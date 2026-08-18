import express from 'express';
import { uploadAvatar, uploadCover } from '../controllers/uploadController.js';
import { uploadAvatar as uploadAvatarMiddleware, uploadImage as uploadImageMiddleware } from '../middleware/upload.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.post('/avatar', isAuthenticated, uploadAvatarMiddleware.single('avatar'), uploadAvatar);
router.post('/cover', isAuthenticated, uploadImageMiddleware.single('cover'), uploadCover);

export default router;
