import { Restaurant, IRestaurant } from '../models/Restaurant';
import { User } from '../models/User';
import { NotFoundError, AuthorizationError, ConflictError } from '../errors';
import { setCache, getCache, deleteCache } from '../config/redis';
import { generateSlug, getPaginationParams, buildPaginationMeta, hashPassword } from '../utils';
import { RESTAURANT_STATUS, ROLES, CACHE_TTL } from '../constants';
import { logger } from '../config/logger';

export class RestaurantService {
  async createRestaurant(ownerId: string, data: Partial<IRestaurant>): Promise<IRestaurant> {
    let slug = generateSlug(data.name || 'Restaurant');
    const existing = await Restaurant.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    let finalOwnerId = ownerId;
    let ownerNameVal = (data as any).ownerName;

    // Auto-create Restaurant Owner User Account if email is provided
    if (data.email) {
      const cleanEmail = data.email.trim().toLowerCase();
      let user = await User.findOne({ email: cleanEmail });

      if (!user) {
        const rawPassword = (data as any).tempPassword || 'Welcome@123';
        const hashedPassword = await hashPassword(rawPassword);

        user = await User.create({
          email: cleanEmail,
          name: ownerNameVal || data.name || 'Restaurant Owner',
          phone: data.phone || '+1 212-555-0199',
          password: hashedPassword,
          role: ROLES.RESTAURANT_OWNER,
          isEmailVerified: true,
          isActive: true,
        });
        logger.info(`Auto-created Restaurant Owner account for ${cleanEmail}`);
      } else if (user.role !== ROLES.ADMIN && user.role !== ROLES.RESTAURANT_OWNER) {
        user.role = ROLES.RESTAURANT_OWNER;
        await user.save();
      }

      if (user) {
        finalOwnerId = user._id.toString();
        if (!ownerNameVal) ownerNameVal = user.name;
      }
    }

    const restaurant = await Restaurant.create({
      name: data.name,
      slug,
      description: data.description || `Welcome to ${data.name}`,
      ownerId: finalOwnerId || ownerId || 'admin_onboarded',
      ownerName: ownerNameVal || 'Restaurant Owner',
      phone: data.phone || '+1 212-555-0100',
      email: data.email,
      website: data.website,
      status: data.status || RESTAURANT_STATUS.PENDING,
      cuisineTypes: data.cuisineTypes?.length ? data.cuisineTypes : ['Restaurant'],
      priceRange: data.priceRange || 2,
      address: {
        street: data.address?.street || '123 Main Street',
        city: data.address?.city || 'New York',
        state: data.address?.state || 'NY',
        country: data.address?.country || 'USA',
        zipCode: data.address?.zipCode || '10001',
      },
      location: {
        type: 'Point',
        coordinates: data.location?.coordinates?.length === 2 ? data.location.coordinates : [-73.9857, 40.7484],
      },
      logo: data.logo || undefined,
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      openingHours: data.openingHours || [
        { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
        { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
        { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
        { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
        { day: 'friday', isOpen: true, openTime: '09:00', closeTime: '23:00' },
        { day: 'saturday', isOpen: true, openTime: '10:00', closeTime: '23:00' },
        { day: 'sunday', isOpen: true, openTime: '10:00', closeTime: '21:00' },
      ],
      tables: data.tables || [],
      totalCapacity: data.totalCapacity || 0,
      features: data.features || [],
      tags: data.tags || [],
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

  async addTable(id: string, callerId: string, tableData: IRestaurant['tables'][number], callerRole?: string): Promise<IRestaurant> {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) throw new NotFoundError('Restaurant');
    // Branch managers are trusted to add tables to their own restaurant — skip ownership check
    if (callerRole !== ROLES.BRANCH_MANAGER && callerRole !== ROLES.ADMIN && restaurant.ownerId !== callerId) {
      throw new AuthorizationError();
    }
    if (restaurant.tables.find((t) => t.tableNumber === tableData.tableNumber)) throw new ConflictError(`Table ${tableData.tableNumber} already exists`);
    const updated = await Restaurant.findByIdAndUpdate(id, { $push: { tables: tableData }, $inc: { totalCapacity: tableData.capacity } }, { new: true }) as IRestaurant;
    await deleteCache(`restaurant:${id}`);
    return updated;
  }

  async updateTableAvailability(restaurantId: string, tableNumber: string, isAvailable: boolean, callerRole?: string): Promise<IRestaurant> {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) throw new NotFoundError('Restaurant');
    if (callerRole !== ROLES.BRANCH_MANAGER && callerRole !== ROLES.ADMIN && restaurant.ownerId !== restaurantId) {
      throw new AuthorizationError();
    }
    const tableExists = restaurant.tables.find((t) => t.tableNumber === tableNumber);
    if (!tableExists) throw new NotFoundError(`Table ${tableNumber}`);
    const updated = await Restaurant.findOneAndUpdate(
      { _id: restaurantId, 'tables.tableNumber': tableNumber },
      { $set: { 'tables.$.isAvailable': isAvailable } },
      { new: true }
    ) as IRestaurant;
    await deleteCache(`restaurant:${restaurantId}`);
    return updated;
  }

  async updateTable(
    restaurantId: string,
    tableNumber: string,
    data: Partial<Pick<IRestaurant['tables'][number], 'capacity' | 'type' | 'description' | 'isAc'> & { seatingCategory: string }>,
    callerRole?: string
  ): Promise<IRestaurant> {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) throw new NotFoundError('Restaurant');
    if (callerRole !== ROLES.BRANCH_MANAGER && callerRole !== ROLES.ADMIN && restaurant.ownerId !== restaurantId) {
      throw new AuthorizationError();
    }
    const existingTable = restaurant.tables.find((t) => t.tableNumber === tableNumber);
    if (!existingTable) throw new NotFoundError(`Table ${tableNumber}`);

    const setFields: Record<string, unknown> = {};
    if (data.capacity !== undefined)       setFields['tables.$.capacity']        = data.capacity;
    if (data.type !== undefined)           setFields['tables.$.type']            = data.type;
    if (data.description !== undefined)    setFields['tables.$.description']     = data.description;
    if (data.seatingCategory !== undefined) setFields['tables.$.seatingCategory'] = data.seatingCategory;
    if (data.isAc !== undefined)           setFields['tables.$.isAc']            = data.isAc;

    const updated = await Restaurant.findOneAndUpdate(
      { _id: restaurantId, 'tables.tableNumber': tableNumber },
      { $set: setFields },
      { new: true }
    ) as IRestaurant;

    // Recalculate totalCapacity if capacity changed
    if (data.capacity !== undefined && data.capacity !== existingTable.capacity) {
      const diff = data.capacity - existingTable.capacity;
      await Restaurant.findByIdAndUpdate(restaurantId, { $inc: { totalCapacity: diff } });
    }

    await deleteCache(`restaurant:${restaurantId}`);
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
