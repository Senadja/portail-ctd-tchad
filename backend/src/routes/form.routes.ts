import { Router } from 'express';
import { 
  submitForm, 
  getSubmissions, 
  updateSubmissionStatus 
} from '../controllers/form.controller';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

// Route publique pour soumettre
router.post('/', submitForm);

// Routes protégées admin pour consulter/gérer
router.get('/', protect, adminOnly, getSubmissions);
router.patch('/:id/status', protect, adminOnly, updateSubmissionStatus);

export default router;
