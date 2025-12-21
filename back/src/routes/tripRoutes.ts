import Router from 'express';
import { createTrip, getUserTrips, deleteTrip } from '../controllers/tripController';

const router = Router();
router.post('/create', createTrip);
router.get('/user/:userId', getUserTrips);
router.delete('/delete/:tripId', deleteTrip);
export default router;