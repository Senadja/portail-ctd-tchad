import { Router } from 'express';
import { 
  getTenders, 
  createTender, 
  updateTender, 
  deleteTender,
  getSubmissions,
  patchSubmissionStatus,
} from '../controllers/tender.controller';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/',    getTenders);
router.post('/',   protect, adminOnly, createTender);
router.put('/:id', protect, adminOnly, updateTender);
router.delete('/:id', protect, adminOnly, deleteTender);

// Soumissions
router.get('/:id/submissions', protect, adminOnly, getSubmissions);
router.patch('/submissions/:subId/status', protect, adminOnly, patchSubmissionStatus);

export default router;
