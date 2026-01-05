import Router from 'express';
import { createTrip, getUserTrips, deleteTrip, getTripDetails } from '../controllers/tripController';

const router = Router();
router.post('/create', createTrip);
router.get('/user/:userId', getUserTrips);
router.delete('/delete/:tripId', deleteTrip);
router.get('/details/:tripId', getTripDetails);
export default router;