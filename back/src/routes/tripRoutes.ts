import Router from 'express';
import { createTrip, getUserTrips, deleteTrip, getTripDetails, addTripParticipant, removeTripParticipant } from '../controllers/tripController';

const router = Router();
router.post('/create', createTrip);
router.get('/user/:userId', getUserTrips);
router.delete('/delete/:tripId', deleteTrip);
router.get('/details/:tripId', getTripDetails);
router.post('/participants/add', addTripParticipant);
router.post('/participants/remove', removeTripParticipant);
export default router;