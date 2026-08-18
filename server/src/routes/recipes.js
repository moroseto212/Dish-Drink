import express from 'express';
import {
  listRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  likeRecipe,
  unlikeRecipe,
  saveRecipe,
  unsaveRecipe,
  addComment,
  deleteComment,
} from '../controllers/recipeController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.get('/', listRecipes);
router.get('/:id', getRecipe);
router.post('/', isAuthenticated, createRecipe);
router.put('/:id', isAuthenticated, updateRecipe);
router.delete('/:id', isAuthenticated, deleteRecipe);
router.post('/:id/like', isAuthenticated, likeRecipe);
router.delete('/:id/like', isAuthenticated, unlikeRecipe);
router.post('/:id/save', isAuthenticated, saveRecipe);
router.delete('/:id/save', isAuthenticated, unsaveRecipe);
router.post('/:id/comments', isAuthenticated, addComment);
router.delete('/:id/comments/:commentId', isAuthenticated, deleteComment);

export default router;
