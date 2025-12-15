import Router from 'express';
import { createTrip } from '../controllers/tripController';

const router = Router();
router.post('/create', createTrip);
export default router;