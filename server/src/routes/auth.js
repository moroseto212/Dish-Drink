import express from 'express';
import { register, login, me, logout, changePassword, deleteAccount } from '../controllers/authController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', isAuthenticated, me);
router.post('/logout', isAuthenticated, logout);
router.post('/change-password', isAuthenticated, changePassword);
router.delete('/account', isAuthenticated, deleteAccount);

export default router;
