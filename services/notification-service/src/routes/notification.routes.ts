import { Router } from 'express';
import { notificationController } from '../controllers/NotificationController';
import { authenticate } from '@quickbite/shared';

const router = Router();
router.use(authenticate);
router.get('/', notificationController.getNotifications.bind(notificationController));
router.get('/unread-count', notificationController.getUnreadCount.bind(notificationController));
router.post('/device-token', notificationController.registerDeviceToken.bind(notificationController));
router.patch('/:id/read', notificationController.markAsRead.bind(notificationController));
router.patch('/mark-all-read', notificationController.markAllAsRead.bind(notificationController));
export default router;
