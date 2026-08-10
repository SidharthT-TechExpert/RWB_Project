import mongoose, { Document, Schema } from 'mongoose';
import { RESTAURANT_STATUS, RestaurantStatus } from '../constants';

export interface ITable {
  tableNumber: string; capacity: number; isAvailable: boolean;
  type: 'indoor' | 'outdoor' | 'private' | 'bar';
  seatingCategory: 'regular' | 'family' | 'business' | 'vip' | 'couple';
  isAc?: boolean;
  description?: string;
}

export interface IOpeningHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isOpen: boolean; openTime: string; closeTime: string;
}

export interface IRestaurant extends Document {
  _id: mongoose.Types.ObjectId;
  name: string; slug: string; description: string; ownerId: string; ownerName?: string;
  status: RestaurantStatus; cuisineTypes: string[]; priceRange: 1 | 2 | 3 | 4;
  address: { street: string; city: string; state: string; country: string; zipCode: string };
  location: { type: 'Point'; coordinates: [number, number] };
  phone: string; email?: string; website?: string;
  coverImage?: string; logo?: string; gallery: string[];
  openingHours: IOpeningHours[]; tables: ITable[]; totalCapacity: number;
  averageRating: number; totalReviews: number; totalBookings: number;
  features: string[]; isVerified: boolean; isFeatured: boolean; tags: string[];
  minimumOrderAmount?: number; preparationTime: number;
  taxPercentage: number; serviceChargePercentage: number;
  acceptsPreOrders: boolean; acceptsTableBooking: boolean;
  createdAt: Date; updatedAt: Date;
}

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    ownerId: { type: String, required: true, index: true },
    ownerName: { type: String },
    status: { type: String, enum: Object.values(RESTAURANT_STATUS), default: RESTAURANT_STATUS.PENDING, index: true },
    cuisineTypes: [{ type: String, index: true }],
    priceRange: { type: Number, enum: [1, 2, 3, 4], default: 2 },
    address: {
      street: { type: String, required: true }, city: { type: String, required: true, index: true },
      state: { type: String, required: true }, country: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    phone: { type: String, required: true }, email: String, website: String,
    coverImage: String, logo: String, gallery: [String],
    openingHours: [{ day: String, isOpen: Boolean, openTime: String, closeTime: String }],
    tables: [{ tableNumber: String, capacity: Number, isAvailable: { type: Boolean, default: true }, type: { type: String, default: 'indoor' }, seatingCategory: { type: String, default: 'regular' }, isAc: { type: Boolean, default: true }, description: String }],
    totalCapacity: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 }, totalReviews: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 }, features: [String],
    isVerified: { type: Boolean, default: false }, isFeatured: { type: Boolean, default: false },
    tags: [String], minimumOrderAmount: Number, preparationTime: { type: Number, default: 30 },
    taxPercentage: { type: Number, default: 5 }, serviceChargePercentage: { type: Number, default: 10 },
    acceptsPreOrders: { type: Boolean, default: true }, acceptsTableBooking: { type: Boolean, default: true },
  },
  { timestamps: true }
);

RestaurantSchema.index({ location: '2dsphere' });
RestaurantSchema.index({ name: 'text', description: 'text', tags: 'text' });
RestaurantSchema.index({ 'address.city': 1, status: 1, averageRating: -1 });

export const Restaurant = mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
