import axios from "axios";
import querystring from "querystring";
import { Request, Response } from "express";
import { AppDataSource } from '../dbConfig/dataSource';
import { UserTokens } from '../models/UserTokens';
import { setCookie } from '../utils/cookieUtils';

const AZURE_CLIENT_ID = process.env.ONEDRIVE_CLIENT_ID as string;
const AZURE_CLIENT_SECRET = process.env.ONEDRIVE_CLIENT_SECRET as string;
const AZURE_REDIRECT_URI = "http://localhost:4001/auth/azure/callback";

// Step 1: Initiate OneDrive (Azure AD) OAuth
export const initiateOneDriveOAuth = (req: Request, res: Response) => {
  const params = querystring.stringify({
    client_id: AZURE_CLIENT_ID,
    redirect_uri: AZURE_REDIRECT_URI,
    response_type: "code",
    scope: [
      "User.Read",
      "Files.Read", // This scope allows accessing OneDrive files
    ].join(" "),
    response_mode: "query",
    prompt: "consent",
  });

  const azureAuthURL = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`;
  res.redirect(azureAuthURL);
};

// Step 2: Handle OneDrive (Azure AD) OAuth callback
export const handleOneDriveCallback = async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Authorization code not provided.");
  }

  try {
    const tokenResponse = await axios.post(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      querystring.stringify({
        client_id: AZURE_CLIENT_ID,
        client_secret: AZURE_CLIENT_SECRET,
        code: code as string,
        redirect_uri: AZURE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    // Get user's email or profile info from Microsoft Graph API
    const userInfo = await axios.get("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const userEmail = userInfo.data.mail || userInfo.data.userPrincipalName;

    const userTokenRepository = AppDataSource.getRepository(UserTokens);
    let user = await userTokenRepository.findOneBy({ email: userEmail });

    if (!user) {
      user = userTokenRepository.create({
        email: userEmail,
        oneDriveAccessToken: access_token,
        oneDriveRefreshToken: refresh_token,
      });
    } else {
      user.oneDriveAccessToken = access_token;
      user.oneDriveRefreshToken = refresh_token;
    }

    await userTokenRepository.save(user);
    setCookie(res, "email", userEmail); // Utility function to set the cookie

    res.redirect(`http://localhost:3000`); // Redirect to homepage or wherever needed
  } catch (error: any) {
    console.error("Error exchanging code for tokens", error.response?.data || error.message);
    res.status(500).send("Error exchanging code for tokens.");
  }
};


export const fetchOneDriveFiles = async (req: Request, res: Response) => {
    try {
      const userEmail = req.cookies.email;
  
      if (!userEmail) {
        return res.status(401).json({ error: "No email found. Please authenticate." });
      }
  
      const userTokenRepository = AppDataSource.getRepository(UserTokens);
      const user = await userTokenRepository.findOneBy({ email: userEmail });
  
      if (!user || !user.oneDriveAccessToken) {
        return res.status(401).json({ error: "No access token found. Please authenticate." });
      }
  
      // Fetch OneDrive files using Microsoft Graph API
      const filesResponse = await axios.get("https://graph.microsoft.com/v1.0/me/drive/root/children", {
        headers: { Authorization: `Bearer ${user.oneDriveAccessToken}` },
      });
  
      res.json(filesResponse.data);
    } catch (error: any) {
      console.error("Error fetching OneDrive files", error.response?.data || error.message);
      res.status(500).json({ error: "Error fetching OneDrive files." });
    }
  };