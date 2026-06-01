import { Router } from 'express';
import { 
  getArticles, 
  getArticleBySlug, 
  createArticle, 
  updateArticle, 
  deleteArticle 
} from '../controllers/article.controller';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

// Routes publiques
router.get('/', getArticles);
router.get('/:slug', getArticleBySlug);

// Routes protégées (admin)
router.post('/', protect, adminOnly, createArticle);
router.put('/:id', protect, adminOnly, updateArticle);
router.delete('/:id', protect, adminOnly, deleteArticle);

export default router;
