import { Router } from 'express';
import { registerUser, loginUser, updateUserProfile, deleteUserAccount, searchUsers } from '../controllers/userController'; 
import { upload } from '../config/multerConfig';

const router = Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/update/:id', upload.single('profileImage'), updateUserProfile);
router.delete('/delete/:id', deleteUserAccount);
router.get('/search', searchUsers);

export default router;