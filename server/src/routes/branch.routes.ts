import { Router } from 'express';
import { branchController } from '../controllers/BranchController';
import { authenticate, authorize } from '../middlewares/authenticate';
import { ROLES } from '../constants';

const router = Router();

// Public / Read
router.get('/restaurant/:restaurantId', branchController.getByRestaurant.bind(branchController));
router.get('/:id', branchController.getById.bind(branchController));

// Owner / Admin Protected
router.use(authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN));

router.post('/', branchController.create.bind(branchController));
router.get('/owner/my-branches', branchController.getMyBranches.bind(branchController));
router.get('/owner/managers', branchController.getManagers.bind(branchController));
router.put('/:id', branchController.update.bind(branchController));
router.post('/:id/manager', branchController.assignManager.bind(branchController));

export default router;
