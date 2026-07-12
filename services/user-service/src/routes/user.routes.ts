import { Router } from 'express';
import { userController } from '../controllers/UserController';
import { authenticate } from '@quickbite/shared';

const router = Router();
router.use(authenticate);
router.get('/profile', userController.getProfile.bind(userController));
router.put('/profile', userController.updateProfile.bind(userController));
router.post('/addresses', userController.addAddress.bind(userController));
router.put('/addresses/:addressId', userController.updateAddress.bind(userController));
router.delete('/addresses/:addressId', userController.deleteAddress.bind(userController));
router.get('/favorites', userController.getFavorites.bind(userController));
router.post('/favorites/:restaurantId', userController.toggleFavoriteRestaurant.bind(userController));
router.get('/wallet', userController.getWalletBalance.bind(userController));
router.put('/notifications', userController.updateNotificationPreferences.bind(userController));
export default router;
