import axios from "axios";
import { Request, Response } from "express";
import { AppDataSource } from '../dbConfig/dataSource';
import { UserTokens } from '../models/UserTokens';

export const fetchGoogleDriveFiles = async (req: Request, res: Response) => {
  try {
    const userEmail = req.cookies.email;

    if (!userEmail) {
      return res.status(401).json({ error: "No email found. Please authenticate." });
    }

    const userTokenRepository = AppDataSource.getRepository(UserTokens);
    const user = await userTokenRepository.findOneBy({ email: userEmail });

    if (!user || !user.googleAccessToken) {
      return res.status(401).json({ error: "No access token found. Please authenticate." });
    }

    const filesResponse = await axios.get("https://www.googleapis.com/drive/v3/files", {
      headers: { Authorization: `Bearer ${user.googleAccessToken}` },
    });

    res.json(filesResponse.data);
  } catch (error: any) {
    console.error("Error fetching Google Drive files", error.response?.data || error.message);
    res.status(500).json({ error: "Error fetching Google Drive files." });
  }
};
