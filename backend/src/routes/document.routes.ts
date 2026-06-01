import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { 
  getDocuments, 
  createDocument, 
  deleteDocument,
  uploadFile
} from '../controllers/document.controller';
import { protect, adminOnly } from '../middleware/auth';
import { upload } from '../middleware/upload';

// Multer 50Mo pour les dossiers d'AO (PDF/DOC/ZIP)
const uploadsDir = path.join(__dirname, '../../uploads/');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const uploadDoc = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'doc-' + unique + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
});

const router = Router();

router.get('/', getDocuments);
router.post('/', protect, adminOnly, upload.single('file'), createDocument);
router.delete('/:id', protect, adminOnly, deleteDocument);
router.post('/upload', protect, adminOnly, uploadDoc.single('file'), uploadFile);

export default router;
