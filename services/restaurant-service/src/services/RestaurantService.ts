import {
  NotFoundError,
  AuthorizationError,
  ConflictError,
  generateSlug,
  setCache,
  getCache,
  deleteCache,
  CACHE_TTL,
  RESTAURANT_STATUS,
  createLogger,
} from '@quickbite/shared';
import { RestaurantRepository, RestaurantFilters, NearbyFilters } from '../repositories/RestaurantRepository';
import { IRestaurant } from '../models/Restaurant';

const logger = createLogger('restaurant-service');
const restaurantRepo = new RestaurantRepository();

export interface CreateRestaurantDTO {
  name: string;
  description: string;
  cuisineTypes: string[];
  priceRange: 1 | 2 | 3 | 4;
  address: IRestaurant['address'];
  location: IRestaurant['location'];
  phone: string;
  email?: string;
  website?: string;
  preparationTime?: number;
  taxPercentage?: number;
  serviceChargePercentage?: number;
  acceptsPreOrders?: boolean;
  acceptsTableBooking?: boolean;
}

export class RestaurantService {
  private cacheKey = (id: string) => `restaurant:${id}`;
  private cacheKeySlug = (slug: string) => `restaurant:slug:${slug}`;

  async createRestaurant(ownerId: string, data: CreateRestaurantDTO): Promise<IRestaurant> {
    let slug = generateSlug(data.name);

    // Ensure unique slug
    const existing = await restaurantRepo.findBySlug(slug);
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const restaurant = await restaurantRepo.create({
      ...data,
      ownerId,
      slug,
      status: RESTAURANT_STATUS.PENDING,
      openingHours: [
        { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
        { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
        { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
        { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
        { day: 'friday', isOpen: true, openTime: '09:00', closeTime: '23:00' },
        { day: 'saturday', isOpen: true, openTime: '10:00', closeTime: '23:00' },
        { day: 'sunday', isOpen: true, openTime: '10:00', closeTime: '21:00' },
      ],
    });

    logger.info(`Restaurant created: ${restaurant.name} by owner ${ownerId}`);
    return restaurant;
  }

  async getRestaurantById(id: string): Promise<IRestaurant> {
    const cached = await getCache<IRestaurant>(this.cacheKey(id));
    if (cached) return cached;

    const restaurant = await restaurantRepo.findById(id);
    if (!restaurant) throw new NotFoundError('Restaurant');

    await setCache(this.cacheKey(id), restaurant, CACHE_TTL.MEDIUM);
    return restaurant;
  }

  async getRestaurantBySlug(slug: string): Promise<IRestaurant> {
    const cached = await getCache<IRestaurant>(this.cacheKeySlug(slug));
    if (cached) return cached;

    const restaurant = await restaurantRepo.findBySlug(slug);
    if (!restaurant) throw new NotFoundError('Restaurant');

    await setCache(this.cacheKeySlug(slug), restaurant, CACHE_TTL.MEDIUM);
    return restaurant;
  }

  async getRestaurants(filters: RestaurantFilters) {
    return restaurantRepo.findMany(filters);
  }

  async getNearbyRestaurants(filters: NearbyFilters) {
    return restaurantRepo.findNearby(filters);
  }

  async getMyRestaurants(ownerId: string, page?: number, limit?: number) {
    return restaurantRepo.findByOwnerId(ownerId, page, limit);
  }

  async updateRestaurant(
    id: string,
    ownerId: string,
    data: Partial<CreateRestaurantDTO>
  ): Promise<IRestaurant> {
    const restaurant = await restaurantRepo.findById(id);
    if (!restaurant) throw new NotFoundError('Restaurant');
    if (restaurant.ownerId !== ownerId) throw new AuthorizationError();

    const updated = await restaurantRepo.update(id, data);
    await deleteCache(this.cacheKey(id));
    await deleteCache(this.cacheKeySlug(restaurant.slug));

    return updated;
  }

  async updateOpeningHours(
    id: string,
    ownerId: string,
    openingHours: IRestaurant['openingHours']
  ): Promise<IRestaurant> {
    const restaurant = await restaurantRepo.findById(id);
    if (!restaurant) throw new NotFoundError('Restaurant');
    if (restaurant.ownerId !== ownerId) throw new AuthorizationError();

    const updated = await restaurantRepo.update(id, { openingHours });
    await deleteCache(this.cacheKey(id));
    return updated;
  }

  async addTable(
    id: string,
    ownerId: string,
    tableData: IRestaurant['tables'][number]
  ): Promise<IRestaurant> {
    const restaurant = await restaurantRepo.findById(id);
    if (!restaurant) throw new NotFoundError('Restaurant');
    if (restaurant.ownerId !== ownerId) throw new AuthorizationError();

    const existingTable = restaurant.tables.find(
      (t) => t.tableNumber === tableData.tableNumber
    );
    if (existingTable) throw new ConflictError(`Table ${tableData.tableNumber} already exists`);

    const updated = await restaurantRepo.update(id, {
      $push: { tables: tableData },
      $inc: { totalCapacity: tableData.capacity },
    });
    await deleteCache(this.cacheKey(id));
    return updated;
  }

  async updateTable(
    restaurantId: string,
    ownerId: string,
    tableNumber: string,
    data: Partial<IRestaurant['tables'][number]>
  ): Promise<IRestaurant> {
    const restaurant = await restaurantRepo.findById(restaurantId);
    if (!restaurant) throw new NotFoundError('Restaurant');
    if (restaurant.ownerId !== ownerId) throw new AuthorizationError();

    const updated = await restaurantRepo.update(restaurantId, {
      $set: {
        'tables.$[table]': { ...data },
      },
    });
    await deleteCache(this.cacheKey(restaurantId));
    return updated;
  }

  async uploadGalleryImage(
    id: string,
    ownerId: string,
    imageUrl: string
  ): Promise<IRestaurant> {
    const restaurant = await restaurantRepo.findById(id);
    if (!restaurant) throw new NotFoundError('Restaurant');
    if (restaurant.ownerId !== ownerId) throw new AuthorizationError();

    const updated = await restaurantRepo.update(id, {
      $push: { gallery: imageUrl },
    });
    await deleteCache(this.cacheKey(id));
    return updated;
  }

  async getFeaturedRestaurants(limit?: number): Promise<IRestaurant[]> {
    const cacheKey = 'restaurants:featured';
    const cached = await getCache<IRestaurant[]>(cacheKey);
    if (cached) return cached;

    const restaurants = await restaurantRepo.getFeatured(limit);
    await setCache(cacheKey, restaurants, CACHE_TTL.LONG);
    return restaurants;
  }

  async searchRestaurants(query: string, page?: number, limit?: number) {
    return restaurantRepo.search(query, page, limit);
  }

  // Called by admin service
  async approveRestaurant(id: string): Promise<IRestaurant> {
    const updated = await restaurantRepo.update(id, {
      status: RESTAURANT_STATUS.ACTIVE,
      isVerified: true,
    });
    await deleteCache(this.cacheKey(id));
    return updated;
  }

  async suspendRestaurant(id: string): Promise<IRestaurant> {
    const updated = await restaurantRepo.update(id, {
      status: RESTAURANT_STATUS.SUSPENDED,
    });
    await deleteCache(this.cacheKey(id));
    return updated;
  }
}

export const restaurantService = new RestaurantService();
