import { FilterQuery, UpdateQuery } from 'mongoose';
import { Restaurant, IRestaurant } from '../models/Restaurant';
import { NotFoundError, getPaginationParams, buildPaginationMeta, PaginationMeta } from '@quickbite/shared';
import { RESTAURANT_STATUS } from '@quickbite/shared';

export interface RestaurantFilters {
  city?: string;
  cuisineTypes?: string[];
  priceRange?: number[];
  rating?: number;
  isOpen?: boolean;
  features?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface NearbyFilters {
  longitude: number;
  latitude: number;
  radiusKm?: number;
  page?: number;
  limit?: number;
}

export class RestaurantRepository {
  async create(data: Partial<IRestaurant>): Promise<IRestaurant> {
    return Restaurant.create(data);
  }

  async findById(id: string): Promise<IRestaurant | null> {
    return Restaurant.findById(id);
  }

  async findBySlug(slug: string): Promise<IRestaurant | null> {
    return Restaurant.findOne({ slug });
  }

  async findByOwnerId(
    ownerId: string,
    page = 1,
    limit = 20
  ): Promise<{ restaurants: IRestaurant[]; meta: PaginationMeta }> {
    const { skip } = getPaginationParams(page, limit);
    const total = await Restaurant.countDocuments({ ownerId });
    const restaurants = await Restaurant.find({ ownerId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    return { restaurants, meta: buildPaginationMeta(page, limit, total) };
  }

  async findMany(
    filters: RestaurantFilters
  ): Promise<{ restaurants: IRestaurant[]; meta: PaginationMeta }> {
    const { page, limit, skip } = getPaginationParams(filters.page, filters.limit);

    const query: FilterQuery<IRestaurant> = {
      status: RESTAURANT_STATUS.ACTIVE,
    };

    if (filters.city) query['address.city'] = { $regex: filters.city, $options: 'i' };
    if (filters.cuisineTypes?.length) query.cuisineTypes = { $in: filters.cuisineTypes };
    if (filters.priceRange?.length) query.priceRange = { $in: filters.priceRange };
    if (filters.rating) query.averageRating = { $gte: filters.rating };
    if (filters.features?.length) query.features = { $all: filters.features };

    const sortOptions: Record<string, 1 | -1> = {};
    switch (filters.sortBy) {
      case 'rating':
        sortOptions.averageRating = -1;
        break;
      case 'popular':
        sortOptions.totalBookings = -1;
        break;
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      default:
        sortOptions.isFeatured = -1;
        sortOptions.averageRating = -1;
    }

    const [restaurants, total] = await Promise.all([
      Restaurant.find(query).skip(skip).limit(limit).sort(sortOptions),
      Restaurant.countDocuments(query),
    ]);

    return { restaurants, meta: buildPaginationMeta(page, limit, total) };
  }

  async findNearby(
    filters: NearbyFilters
  ): Promise<{ restaurants: IRestaurant[]; meta: PaginationMeta }> {
    const { page, limit, skip } = getPaginationParams(filters.page, filters.limit);
    const radiusMeters = (filters.radiusKm || 10) * 1000;

    const geoQuery = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [filters.longitude, filters.latitude],
          },
          $maxDistance: radiusMeters,
        },
      },
      status: RESTAURANT_STATUS.ACTIVE,
    };

    const [restaurants, total] = await Promise.all([
      Restaurant.find(geoQuery).skip(skip).limit(limit),
      Restaurant.countDocuments(geoQuery),
    ]);

    return { restaurants, meta: buildPaginationMeta(page, limit, total) };
  }

  async update(id: string, data: UpdateQuery<IRestaurant>): Promise<IRestaurant> {
    const restaurant = await Restaurant.findByIdAndUpdate(id, data, { new: true });
    if (!restaurant) throw new NotFoundError('Restaurant');
    return restaurant;
  }

  async delete(id: string): Promise<void> {
    await Restaurant.findByIdAndDelete(id);
  }

  async updateRating(id: string, averageRating: number, totalReviews: number): Promise<void> {
    await Restaurant.findByIdAndUpdate(id, { averageRating, totalReviews });
  }

  async incrementBookings(id: string): Promise<void> {
    await Restaurant.findByIdAndUpdate(id, { $inc: { totalBookings: 1 } });
  }

  async search(query: string, page = 1, limit = 20): Promise<{ restaurants: IRestaurant[]; meta: PaginationMeta }> {
    const { skip } = getPaginationParams(page, limit);
    const filter = {
      $text: { $search: query },
      status: RESTAURANT_STATUS.ACTIVE,
    };

    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit),
      Restaurant.countDocuments(filter),
    ]);

    return { restaurants, meta: buildPaginationMeta(page, limit, total) };
  }

  async getFeatured(limit = 10): Promise<IRestaurant[]> {
    return Restaurant.find({ isFeatured: true, status: RESTAURANT_STATUS.ACTIVE })
      .sort({ averageRating: -1 })
      .limit(limit);
  }
}
