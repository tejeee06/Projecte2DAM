import { Router } from 'express';
import * as friendshipController from '../controllers/friendshipController';

const router = Router();

router.post('/send', friendshipController.sendRequest);
router.post('/accept', friendshipController.acceptRequest);
router.delete('/delete/:friendshipId', friendshipController.removeFriendship);

router.get('/pending/:userId', friendshipController.getNotifications);
router.get('/list/:userId', friendshipController.getMyFriends);
router.get('/status/:myId/:otherId', friendshipController.getStatus);

export default router;