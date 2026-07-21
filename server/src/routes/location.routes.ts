import { Router } from 'express';
import { locationController } from '../controllers/LocationController';

const router = Router();
router.get('/geocode', locationController.geocode.bind(locationController));
router.get('/reverse', locationController.reverseGeocode.bind(locationController));
router.get('/places', locationController.searchPlaces.bind(locationController));
router.get('/distance', locationController.calculateDistance.bind(locationController));
export default router;
