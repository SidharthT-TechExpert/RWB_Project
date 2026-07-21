import { Router } from 'express';
import { searchController } from '../controllers/SearchController';
import { authenticate, optionalAuthenticate } from '../middlewares/authenticate';

const router = Router();
router.get('/', optionalAuthenticate, searchController.searchAll.bind(searchController));
router.get('/suggestions', searchController.getSuggestions.bind(searchController));
router.get('/popular', searchController.getPopular.bind(searchController));
router.get('/recent', authenticate, searchController.getRecent.bind(searchController));
router.delete('/history', authenticate, searchController.clearHistory.bind(searchController));
router.post('/click', optionalAuthenticate, searchController.trackClick.bind(searchController));
export default router;
