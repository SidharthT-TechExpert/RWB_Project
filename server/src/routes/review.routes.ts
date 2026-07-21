import { Router } from 'express';
import { reviewController } from '../controllers/ReviewController';
import { authenticate, authorize, optionalAuthenticate } from '../middlewares/authenticate';
import { ROLES } from '../constants';

const router = Router();

router.get('/restaurant/:restaurantId', optionalAuthenticate, reviewController.getByRestaurant.bind(reviewController));
router.post('/', authenticate, reviewController.create.bind(reviewController));
router.get('/my', authenticate, reviewController.getMyReviews.bind(reviewController));
router.put('/:id', authenticate, reviewController.update.bind(reviewController));
router.delete('/:id', authenticate, reviewController.delete.bind(reviewController));
router.post('/:id/reply', authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN), reviewController.addReply.bind(reviewController));
router.post('/:id/helpful', authenticate, reviewController.voteHelpful.bind(reviewController));
router.post('/:id/report', authenticate, reviewController.report.bind(reviewController));

export default router;
