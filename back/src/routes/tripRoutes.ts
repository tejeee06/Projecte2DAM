import Router from 'express';
import { createTrip, getUserTrips } from '../controllers/tripController';

const router = Router();
router.post('/create', createTrip);
router.get('/user/:userId', getUserTrips);
export default router;