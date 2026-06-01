import { Router } from 'express';
import { getPageContent, getAllPages, updatePageContent } from '../controllers/page-content.controller';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

// Routes publiques
router.get('/:id', getPageContent);

// Routes privées (CMS)
router.get('/', protect, adminOnly, getAllPages);
router.put('/:id', protect, adminOnly, updatePageContent);

export default router;
