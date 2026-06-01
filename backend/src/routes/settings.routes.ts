import { Router } from 'express';
import { 
  getSettings, 
  updateSettings,
  uploadPresidentImage
} from '../controllers/settings.controller';
import { protect, adminOnly } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', getSettings);
router.put('/', protect, adminOnly, updateSettings);
router.post('/upload', protect, adminOnly, upload.single('image'), uploadPresidentImage);

export default router;
