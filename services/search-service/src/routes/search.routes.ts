import { Router } from 'express';
import { searchController } from '../controllers/SearchController';
import { authenticate, optionalAuthenticate } from '@quickbite/shared';

const router = Router();
router.get('/', optionalAuthenticate, searchController.searchAll.bind(searchController));
router.get('/restaurants', searchController.searchRestaurants.bind(searchController));
router.get('/food', searchController.searchFood.bind(searchController));
router.get('/suggestions', searchController.getSuggestions.bind(searchController));
router.get('/popular', searchController.getPopularSearches.bind(searchController));
router.get('/recent', authenticate, searchController.getRecentSearches.bind(searchController));
router.delete('/history', authenticate, searchController.clearHistory.bind(searchController));
router.post('/click', optionalAuthenticate, searchController.trackClick.bind(searchController));
export default router;
