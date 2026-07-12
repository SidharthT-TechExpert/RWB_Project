import mongoose, { Document, Schema } from 'mongoose';
import { RESTAURANT_STATUS, RestaurantStatus } from '@quickbite/shared';

export interface ITable {
  tableNumber: string;
  capacity: number;
  isAvailable: boolean;
  type: 'indoor' | 'outdoor' | 'private' | 'bar';
  description?: string;
}

export interface IOpeningHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface IRestaurant extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  ownerId: string;
  status: RestaurantStatus;
  cuisineTypes: string[];
  priceRange: 1 | 2 | 3 | 4; // $ to $$$$
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  phone: string;
  email?: string;
  website?: string;
  coverImage?: string;
  logo?: string;
  gallery: string[];
  openingHours: IOpeningHours[];
  tables: ITable[];
  totalCapacity: number;
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
  features: string[];
  isVerified: boolean;
  isFeatured: boolean;
  tags: string[];
  minimumOrderAmount?: number;
  preparationTime: number; // minutes
  taxPercentage: number;
  serviceChargePercentage: number;
  acceptsPreOrders: boolean;
  acceptsTableBooking: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema = new Schema<ITable>({
  tableNumber: { type: String, required: true },
  capacity: { type: Number, required: true, min: 1 },
  isAvailable: { type: Boolean, default: true },
  type: { type: String, enum: ['indoor', 'outdoor', 'private', 'bar'], default: 'indoor' },
  description: { type: String },
});

const OpeningHoursSchema = new Schema<IOpeningHours>({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true,
  },
  isOpen: { type: Boolean, default: true },
  openTime: { type: String, default: '09:00' },
  closeTime: { type: String, default: '22:00' },
});

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true, trim: true, index: 'text' },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true, index: 'text' },
    ownerId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: Object.values(RESTAURANT_STATUS),
      default: RESTAURANT_STATUS.PENDING,
      index: true,
    },
    cuisineTypes: [{ type: String, index: true }],
    priceRange: { type: Number, enum: [1, 2, 3, 4], default: 2 },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true, index: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    phone: { type: String, required: true },
    email: { type: String },
    website: { type: String },
    coverImage: { type: String },
    logo: { type: String },
    gallery: [{ type: String }],
    openingHours: [OpeningHoursSchema],
    tables: [TableSchema],
    totalCapacity: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    features: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String }],
    minimumOrderAmount: { type: Number },
    preparationTime: { type: Number, default: 30 },
    taxPercentage: { type: Number, default: 5 },
    serviceChargePercentage: { type: Number, default: 10 },
    acceptsPreOrders: { type: Boolean, default: true },
    acceptsTableBooking: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Geospatial index for nearby restaurants
RestaurantSchema.index({ location: '2dsphere' });
RestaurantSchema.index({ name: 'text', description: 'text', tags: 'text' });
RestaurantSchema.index({ 'address.city': 1, status: 1, averageRating: -1 });

export const Restaurant = mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
