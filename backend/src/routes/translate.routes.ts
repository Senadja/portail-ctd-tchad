import { Router } from 'express';
import { translate } from '../controllers/translate.controller';

const router = Router();

// Public : la traduction est consommée par le portail public (cache partagé côté serveur)
router.post('/', translate);

export default router;
