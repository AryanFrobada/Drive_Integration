import axios from "axios";
import querystring from "querystring";
import { Request, Response } from "express";
import { AppDataSource } from '../dbConfig/dataSource';
import { UserTokens } from '../models/UserTokens';
import { setCookie } from '../utils/cookieUtils';

const DROPBOX_CLIENT_ID = process.env.DROPBOX_CLIENT_ID as string;
const DROPBOX_CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET as string;
const REDIRECT_URI = "http://localhost:4001/auth/dropbox/callback";

// Step 1: Initiate Dropbox OAuth
export const initiateDropboxOAuth = (req: Request, res: Response) => {
  const params = querystring.stringify({
    client_id: DROPBOX_CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    token_access_type: "offline",
  });

  const dropboxAuthURL = `https://www.dropbox.com/oauth2/authorize?${params}`;
  res.redirect(dropboxAuthURL);
};

// Step 2: Handle Dropbox OAuth callback
export const handleDropboxCallback = async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Authorization code not provided.");
  }

  try {
    // Step 3: Exchange authorization code for access token
    const tokenResponse = await axios.post(
      "https://api.dropboxapi.com/oauth2/token",
      new URLSearchParams({
        code: code as string,
        grant_type: "authorization_code",
        client_id: DROPBOX_CLIENT_ID,
        client_secret: DROPBOX_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    // Step 4: Fetch user email from Dropbox
    const userInfo = await axios.post(
      "https://api.dropboxapi.com/2/users/get_current_account",
      null, // No body required
      {
        headers: {
          Authorization: `Bearer ${access_token}`, // Correct Bearer token
          "Content-Type": "application/json", // Set the correct Content-Type
        },
      }
    );

    const userEmail = userInfo.data.email;

    // Step 5: Save tokens in the database
    const userTokenRepository = AppDataSource.getRepository(UserTokens);
    let user = await userTokenRepository.findOneBy({ email: userEmail });

    if (!user) {
      user = userTokenRepository.create({
        email: userEmail,
        dropboxAccessToken: access_token,
        dropboxRefreshToken: refresh_token,
      });
    } else {
      user.dropboxAccessToken = access_token;
      user.dropboxRefreshToken = refresh_token;
    }

    await userTokenRepository.save(user);
    setCookie(res, "email", userEmail); // Utility function to set the cookie

    res.redirect(`http://localhost:3000`);
  } catch (error: any) {
    console.error("Error exchanging code for tokens", error.response?.data || error.message);
    res.status(500).send("Error exchanging code for tokens.");
  }
};


// Fetch Dropbox files
export const fetchDropboxFiles = async (req: Request, res: Response) => {
  const userEmail = req.cookies.email;

  if (!userEmail) {
    return res.status(401).send("User not authenticated.");
  }

  try {
    const userTokenRepository = AppDataSource.getRepository(UserTokens);
    const user = await userTokenRepository.findOneBy({ email: userEmail });

    if (!user || !user.dropboxAccessToken) {
      return res.status(403).send("Dropbox not authorized.");
    }

    const response = await axios.post(
      "https://api.dropboxapi.com/2/files/list_folder",
      {
        path: "", // Root folder path
      },
      {
        headers: { Authorization: `Bearer ${user.dropboxAccessToken}` },
      }
    );

    res.json({ files: response.data.entries });
  } catch (error) {
    console.error("Error fetching Dropbox files", error);
    res.status(500).send("Error fetching Dropbox files.");
  }
};




// export const fetchDropboxFiles = async (req: Request, res: Response) => {
//   const userEmail = req.cookies.email;

//   if (!userEmail) {
//     return res.status(401).send("User not authenticated.");
//   }

//   try {
//     const userTokenRepository = AppDataSource.getRepository(UserTokens);
//     const user = await userTokenRepository.findOneBy({ email: userEmail });

//     if (!user || !user.dropboxAccessToken) {
//       return res.status(403).send("Dropbox not authorized.");
//     }

//     // Fetch files from Dropbox
//     const response = await axios.post(
//       "https://api.dropboxapi.com/2/files/list_folder",
//       { path: "" }, // Root folder path
//       { headers: { Authorization: `Bearer ${user.dropboxAccessToken}` } }
//     );

//     const files = response.data.entries;

//     // Generate preview URLs for each file
//     const filesWithPreviewUrls = await Promise.all(
//       files.map(async (file: any) => {
//         try {
//           const previewResponse = await axios.post(
//             "https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings",
//             { path: file.path_lower },
//             {
//               headers: {
//                 Authorization: `Bearer ${user.dropboxAccessToken}`,
//                 "Content-Type": "application/json",
//               },
//             }
//           );
          
//           // Dropbox preview link with direct file access
//           const previewUrl = previewResponse.data.url.replace("?dl=0", "?raw=1");

//           return { ...file, preview_url: previewUrl }; // Add the preview URL to the file object
//         } catch (error) {
//           console.error("Error generating preview URL for file", file.name, error);
//           return { ...file, preview_url: null }; // Handle error by returning null preview_url
//         }
//       })
//     );

//     res.json({ files: filesWithPreviewUrls });
//   } catch (error) {
//     console.error("Error fetching Dropbox files", error);
//     res.status(500).send("Error fetching Dropbox files.");
//   }
// };