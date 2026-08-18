import express from 'express';
import { getNotifications, readAllNotifications } from '../controllers/notificationController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.get('/', isAuthenticated, getNotifications);
router.post('/read', isAuthenticated, readAllNotifications);

export default router;
