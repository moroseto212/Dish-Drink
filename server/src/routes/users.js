import express from 'express';
import {
  updateMe,
  getMe,
  getProfile,
  getUserRecipes,
  getSavedRecipes,
  searchUsers,
  listMutualUsers,
  followUser,
  unfollowUser,
} from '../controllers/userController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.patch('/me', isAuthenticated, updateMe);
router.get('/me', isAuthenticated, getMe);
router.get('/saved', isAuthenticated, getSavedRecipes);
router.get('/search', isAuthenticated, searchUsers);
router.get('/mutual', isAuthenticated, listMutualUsers);
router.get('/:id', getProfile);
router.get('/:id/recipes', getUserRecipes);
router.post('/:id/follow', isAuthenticated, followUser);
router.delete('/:id/follow', isAuthenticated, unfollowUser);

export default router;
