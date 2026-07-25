import { Restaurant, IRestaurant } from '../models/Restaurant';
import { NotFoundError, AuthorizationError, ConflictError } from '../errors';
import { setCache, getCache, deleteCache } from '../config/redis';
import { generateSlug, getPaginationParams, buildPaginationMeta } from '../utils';
import { RESTAURANT_STATUS, CACHE_TTL } from '../constants';
import { logger } from '../config/logger';

export class RestaurantService {
  async createRestaurant(ownerId: string, data: Partial<IRestaurant>): Promise<IRestaurant> {
    let slug = generateSlug(data.name!);
    const existing = await Restaurant.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const restaurant = await Restaurant.create({
      ...data,
      ownerId: ownerId || 'admin_onboarded',
      slug,
      status: data.status || RESTAURANT_STATUS.PENDING,
      openingHours: data.openingHours || [
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
    const cached = await getCache<IRestaurant>(`restaurant:${id}`);
    if (cached) return cached;
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) throw new NotFoundError('Restaurant');
    await setCache(`restaurant:${id}`, restaurant, CACHE_TTL.MEDIUM);
    return restaurant;
  }

  async getRestaurantBySlug(slug: string): Promise<IRestaurant> {
    const cached = await getCache<IRestaurant>(`restaurant:slug:${slug}`);
    if (cached) return cached;
    const restaurant = await Restaurant.findOne({ slug });
    if (!restaurant) throw new NotFoundError('Restaurant');
    await setCache(`restaurant:slug:${slug}`, restaurant, CACHE_TTL.MEDIUM);
    return restaurant;
  }

  async getRestaurants(filters: { status?: string; city?: string; cuisineTypes?: string[]; priceRange?: number[]; rating?: number; features?: string[]; sortBy?: string; page?: number; limit?: number }) {
    const { page, limit, skip } = getPaginationParams(filters.page, filters.limit);
    const query: Record<string, unknown> = {};

    if (filters.status && filters.status !== 'all' && filters.status !== 'ALL') {
      query.status = filters.status;
    } else if (filters.status === undefined) {
      query.status = RESTAURANT_STATUS.ACTIVE;
    }
    if (filters.city) query['address.city'] = { $regex: filters.city, $options: 'i' };
    if (filters.cuisineTypes?.length) query.cuisineTypes = { $in: filters.cuisineTypes };
    if (filters.priceRange?.length) query.priceRange = { $in: filters.priceRange };
    if (filters.rating) query.averageRating = { $gte: filters.rating };
    if (filters.features?.length) query.features = { $all: filters.features };

    const sortOptions: Record<string, 1 | -1> = {};
    if (filters.sortBy === 'rating') sortOptions.averageRating = -1;
    else if (filters.sortBy === 'popular') sortOptions.totalBookings = -1;
    else { sortOptions.isFeatured = -1; sortOptions.averageRating = -1; }

    const [restaurants, total] = await Promise.all([
      Restaurant.find(query).skip(skip).limit(limit).sort(sortOptions),
      Restaurant.countDocuments(query),
    ]);
    return { restaurants, meta: buildPaginationMeta(page, limit, total) };
  }

  async getNearbyRestaurants(filters: { longitude: number; latitude: number; radiusKm?: number; page?: number; limit?: number }) {
    const { page, limit, skip } = getPaginationParams(filters.page, filters.limit);
    const geoQuery = {
      location: { $near: { $geometry: { type: 'Point', coordinates: [filters.longitude, filters.latitude] }, $maxDistance: (filters.radiusKm || 10) * 1000 } },
      status: RESTAURANT_STATUS.ACTIVE,
    };
    const [restaurants, total] = await Promise.all([
      Restaurant.find(geoQuery).skip(skip).limit(limit),
      Restaurant.countDocuments(geoQuery),
    ]);
    return { restaurants, meta: buildPaginationMeta(page, limit, total) };
  }

  async getMyRestaurants(ownerId: string, page?: number, limit?: number) {
    const { page: p, limit: l, skip } = getPaginationParams(page, limit);
    const [restaurants, total] = await Promise.all([
      Restaurant.find({ ownerId }).skip(skip).limit(l).sort({ createdAt: -1 }),
      Restaurant.countDocuments({ ownerId }),
    ]);
    return { restaurants, meta: buildPaginationMeta(p, l, total) };
  }

  async updateRestaurant(id: string, ownerId: string, data: Partial<IRestaurant>): Promise<IRestaurant> {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) throw new NotFoundError('Restaurant');
    if (restaurant.ownerId !== ownerId) throw new AuthorizationError();
    const updated = await Restaurant.findByIdAndUpdate(id, data, { new: true }) as IRestaurant;
    await deleteCache(`restaurant:${id}`);
    await deleteCache(`restaurant:slug:${restaurant.slug}`);
    return updated;
  }

  async addTable(id: string, ownerId: string, tableData: IRestaurant['tables'][number]): Promise<IRestaurant> {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) throw new NotFoundError('Restaurant');
    if (restaurant.ownerId !== ownerId) throw new AuthorizationError();
    if (restaurant.tables.find((t) => t.tableNumber === tableData.tableNumber)) throw new ConflictError(`Table ${tableData.tableNumber} already exists`);
    const updated = await Restaurant.findByIdAndUpdate(id, { $push: { tables: tableData }, $inc: { totalCapacity: tableData.capacity } }, { new: true }) as IRestaurant;
    await deleteCache(`restaurant:${id}`);
    return updated;
  }

  async searchRestaurants(query: string, page?: number, limit?: number) {
    const { page: p, limit: l, skip } = getPaginationParams(page, limit);
    const filter = { $text: { $search: query }, status: RESTAURANT_STATUS.ACTIVE };
    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } }).skip(skip).limit(l),
      Restaurant.countDocuments(filter),
    ]);
    return { restaurants, meta: buildPaginationMeta(p, l, total) };
  }

  async getFeaturedRestaurants(limit?: number): Promise<IRestaurant[]> {
    const cacheKey = 'restaurants:featured';
    const cached = await getCache<IRestaurant[]>(cacheKey);
    if (cached) return cached;
    const restaurants = await Restaurant.find({ isFeatured: true, status: RESTAURANT_STATUS.ACTIVE }).sort({ averageRating: -1 }).limit(limit || 10);
    await setCache(cacheKey, restaurants, CACHE_TTL.LONG);
    return restaurants;
  }

  async approveRestaurant(id: string): Promise<IRestaurant> {
    const updated = await Restaurant.findByIdAndUpdate(id, { status: RESTAURANT_STATUS.ACTIVE, isVerified: true }, { new: true }) as IRestaurant;
    await deleteCache(`restaurant:${id}`);
    return updated;
  }

  async suspendRestaurant(id: string): Promise<IRestaurant> {
    const updated = await Restaurant.findByIdAndUpdate(id, { status: RESTAURANT_STATUS.SUSPENDED }, { new: true }) as IRestaurant;
    await deleteCache(`restaurant:${id}`);
    return updated;
  }

  async updateRating(id: string, averageRating: number, totalReviews: number): Promise<void> {
    await Restaurant.findByIdAndUpdate(id, { averageRating, totalReviews });
    await deleteCache(`restaurant:${id}`);
  }
}

export const restaurantService = new RestaurantService();
