import { Router } from 'express';
import { branchController } from '../controllers/BranchController';
import { authenticate, authorize } from '../middlewares/authenticate';
import { ROLES } from '../constants';

const router = Router();

// Public / Read
router.get('/qr/resolve/:token', branchController.resolveQR.bind(branchController));
router.get('/restaurant/:restaurantId', branchController.getByRestaurant.bind(branchController));

// Branch Manager — get own branch (must be before /:id wildcard)
router.get('/manager/my-branch', authenticate, authorize(ROLES.BRANCH_MANAGER), branchController.getMyBranch.bind(branchController));

router.get('/:id/qr', branchController.getBranchQR.bind(branchController));
router.get('/:id/tables/:tableNumber/qr', branchController.getTableQR.bind(branchController));
router.get('/:id', branchController.getById.bind(branchController));

// Owner / Admin / Branch Manager Protected
router.use(authenticate, authorize(ROLES.RESTAURANT_OWNER, ROLES.BRANCH_MANAGER, ROLES.ADMIN));

router.post('/', branchController.create.bind(branchController));
router.get('/owner/my-branches', branchController.getMyBranches.bind(branchController));
router.get('/owner/managers', branchController.getManagers.bind(branchController));
router.put('/:id', branchController.update.bind(branchController));
router.post('/:id/manager', branchController.assignManager.bind(branchController));

// Table Management Routes
router.post('/:id/tables', branchController.addTable.bind(branchController));
router.put('/:id/tables/:tableNumber', branchController.updateTable.bind(branchController));
router.patch('/:id/tables/:tableNumber/availability', branchController.toggleTableAvailability.bind(branchController));

export default router;
