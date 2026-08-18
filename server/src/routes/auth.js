import express from 'express';
import passport from 'passport';
import { register, login, me, logout, changePassword, deleteAccount } from '../controllers/authController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', isAuthenticated, me);
router.post('/logout', isAuthenticated, logout);
router.post('/change-password', isAuthenticated, changePassword);
router.delete('/account', isAuthenticated, deleteAccount);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: `${process.env.CLIENT_URL}/feed`,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google`,
  })
);

export default router;
