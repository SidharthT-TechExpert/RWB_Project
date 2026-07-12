import { Router } from 'express';
import { reviewController } from '../controllers/ReviewController';
import { authenticate, authorize, optionalAuthenticate, ROLES } from '@quickbite/shared';

const router = Router();

router.get('/restaurant/:restaurantId', optionalAuthenticate, reviewController.getRestaurantReviews.bind(reviewController));
router.post('/', authenticate, reviewController.createReview.bind(reviewController));
router.get('/my', authenticate, reviewController.getMyReviews.bind(reviewController));
router.put('/:id', authenticate, reviewController.updateReview.bind(reviewController));
router.delete('/:id', authenticate, reviewController.deleteReview.bind(reviewController));
router.post('/:id/reply', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), reviewController.addReply.bind(reviewController));
router.post('/:id/helpful', authenticate, reviewController.voteHelpful.bind(reviewController));
router.post('/:id/report', authenticate, reviewController.reportReview.bind(reviewController));

export default router;
