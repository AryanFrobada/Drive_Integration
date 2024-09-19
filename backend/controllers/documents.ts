import { Request, Response } from "express";
import axios from "axios";
import { AppDataSource } from "../dbConfig/dataSource"; // Assuming data source setup
import { UserTokens } from "../models/UserTokens"; // Your TypeORM model for UserTokens

// Helper function to get the access token from the database
const getAccessTokenForUser = async (email: string) => {
  const userTokens = await AppDataSource.getRepository(UserTokens).findOne({
    where: { email },
  });
  
  if (!userTokens || !userTokens.oneDriveAccessToken) {
    throw new Error("No OneDrive access token found for the user.");
  }

  return userTokens.oneDriveAccessToken;
};

// Controller to fetch OneDrive document content
export const getDocumentContent = async (req: Request, res: Response) => {
  const fileId = req.query.fileId as string;
  
  try {
    const email = req.cookies.email; // Get the user email from cookies
    const accessToken = await getAccessTokenForUser(email); // Fetch access token from the database

    // Fetch the document content from OneDrive
    const response = await axios.get(`https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: "arraybuffer", // Get the file as binary
    });

    const fileType = req.query.fileType || "docx"; // File type, default is docx

    let content = "";
    if (fileType === "docx") {
      // Convert the .docx content to text using mammoth or similar library
      const mammoth = require("mammoth");
      const buffer = Buffer.from(response.data);
      const result = await mammoth.extractRawText({ buffer });
      content = result.value;
    } else {
      // For other file types, handle accordingly
      content = response.data.toString("utf-8");
    }

    res.json({ content });
  } catch (error) {
    console.error("Error fetching document content:", error);
    res.status(500).json({ error: "Failed to fetch document content" });
  }
};
