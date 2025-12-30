import { Router } from 'express';
import { registerUser, loginUser, updateUserProfile } from '../controllers/userController';
import { upload } from '../config/multerConfig';

const router = Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/update/:id', upload.single('profileImage'), updateUserProfile);
export default router;