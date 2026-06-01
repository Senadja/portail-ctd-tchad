// Routes Media — /api/media
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { listMedia, uploadMedia, updateMedia, deleteMedia } from '../controllers/media.controller';

const router = Router();

// Config multer — stockage dans /uploads avec UUID natif Node.js (>=18)
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../../uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 Mo max
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Type de fichier non supporté : ${file.mimetype}`));
    }
  },
});

router.get('/',        listMedia);
router.post('/upload', upload.single('file'), uploadMedia);
router.put('/:id',     updateMedia);
router.delete('/:id',  deleteMedia);

export default router;
