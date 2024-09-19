import { Router } from "express";
import { initiateGoogleOAuth, handleGoogleCallback, signOut } from "../controllers/googleAuthController";
import {
    initiateOneDriveOAuth,
    handleOneDriveCallback,
  } from "../controllers/onedriveController";

import { initiateDropboxOAuth, handleDropboxCallback } from "../controllers/dropboxController";

const router = Router();

router.get("/auth/google", initiateGoogleOAuth);
router.get("/auth/google/callback", handleGoogleCallback);


router.get("/auth/azure", initiateOneDriveOAuth);
router.get("/auth/azure/callback", handleOneDriveCallback);


router.get("/auth/dropbox", initiateDropboxOAuth);
router.get("/auth/dropbox/callback", handleDropboxCallback);


router.get("/auth/signout", signOut);

export default router;
