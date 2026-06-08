import { Router } from 'express';
import { 
  getOrganismes,
  getOrganismeTree,
  createOrganisme,
  updateOrganisme,
  deleteOrganisme
} from '../controllers/organisme.controller';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

// Routes publiques
router.get('/', getOrganismes);
router.get('/tree', getOrganismeTree);

// Routes protégées (admin)
router.post('/', protect, adminOnly, createOrganisme);
router.put('/:id', protect, adminOnly, updateOrganisme);
router.delete('/:id', protect, adminOnly, deleteOrganisme);

export default router;
