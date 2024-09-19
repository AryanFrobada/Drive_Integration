import axios from "axios";
import querystring from "querystring";
import { Request, Response } from "express";
import { AppDataSource } from '../dbConfig/dataSource';
import { UserTokens } from '../models/UserTokens';
import { setCookie } from '../utils/cookieUtils';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;
const REDIRECT_URI = "http://localhost:4001/auth/google/callback";

// Step 1: Initiate Google OAuth
export const initiateGoogleOAuth = (req: Request, res: Response) => {
  const params = querystring.stringify({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/drive.readonly",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
  });

  const googleAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  res.redirect(googleAuthURL);
};

// Step 2: Handle Google OAuth callback
export const handleGoogleCallback = async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Authorization code not provided.");
  }

  try {
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      querystring.stringify({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code: code as string,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    const userInfo = await axios.get("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const userEmail = userInfo.data.email;

    const userTokenRepository = AppDataSource.getRepository(UserTokens);
    let user = await userTokenRepository.findOneBy({ email: userEmail });

    if (!user) {
      user = userTokenRepository.create({
        email: userEmail,
        googleAccessToken: access_token,
        googleRefreshToken: refresh_token,
      });
    } else {
      user.googleAccessToken = access_token;
      user.googleRefreshToken = refresh_token;
    }

    await userTokenRepository.save(user);
    setCookie(res, "email", userEmail); // Utility function to set the cookie

    res.redirect(`http://localhost:3000`);
  } catch (error: any) {
    console.error("Error exchanging code for tokens", error.response?.data || error.message);
    res.status(500).send("Error exchanging code for tokens.");
  }
};

// Sign-out functionality
export const signOut = (req: Request, res: Response) => {
  res.clearCookie("email", {
    path: "/",
    domain: "localhost",
    httpOnly: true,
    secure: false,
  });
  res.status(200).send("Signed out");
};
