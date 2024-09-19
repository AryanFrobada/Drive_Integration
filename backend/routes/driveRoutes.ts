import { Router } from "express";
import { fetchGoogleDriveFiles } from "../controllers/googleDriveController";
import { fetchOneDriveFiles } from "../controllers/onedriveController";
import { fetchDropboxFiles } from "../controllers/dropboxController";

const router = Router();

router.get("/api/google-drive/files", fetchGoogleDriveFiles);
router.get("/api/onedrive/files", fetchOneDriveFiles);
router.get("/api/dropbox/files", fetchDropboxFiles);

export default router;
