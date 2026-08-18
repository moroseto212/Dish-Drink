import express from 'express';
import {
  listConversations,
  openConversation,
  getMessages,
  sendMessage,
  markConversationRead,
  unreadCount,
} from '../controllers/conversationController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.get('/', isAuthenticated, listConversations);
router.get('/unread-count', isAuthenticated, unreadCount);
router.post('/', isAuthenticated, openConversation);
router.get('/:id/messages', isAuthenticated, getMessages);
router.post('/:id/messages', isAuthenticated, sendMessage);
router.post('/:id/read', isAuthenticated, markConversationRead);

export default router;
