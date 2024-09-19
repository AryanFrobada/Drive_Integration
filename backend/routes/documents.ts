// backend/routes/documents.ts
import express from "express";
import { getDocumentContent } from "../controllers/documents";

const router = express.Router();

// Route for fetching document content
router.get("/api/onedrive/document-content", getDocumentContent);

export default router;
