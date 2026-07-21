import mongoose, { Document, Schema } from 'mongoose';

export interface IAddress {
  _id?: mongoose.Types.ObjectId;
  label: string; street: string; city: string; state: string;
  country: string; zipCode: string; isDefault: boolean;
  location?: { type: 'Point'; coordinates: [number, number] };
}

export interface IUserProfile extends Document {
  userId: string; name: string; email: string; phone?: string; avatar?: string;
  dateOfBirth?: Date; gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  addresses: IAddress[]; favoriteRestaurants: string[]; favoriteFoodItems: string[];
  walletBalance: number; totalSpent: number; couponsUsed: string[];
  dietaryPreferences: string[]; cuisinePreferences: string[];
  language: string; timezone: string;
  notifications: { push: boolean; email: boolean; sms: boolean; promotions: boolean };
  createdAt: Date; updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  label: { type: String, required: true }, street: { type: String, required: true },
  city: { type: String, required: true }, state: { type: String, required: true },
  country: { type: String, required: true }, zipCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
  location: { type: { type: String, enum: ['Point'] }, coordinates: [Number] },
});

const UserProfileSchema = new Schema<IUserProfile>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true }, email: { type: String, required: true, index: true },
    phone: String, avatar: String, dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
    addresses: [AddressSchema], favoriteRestaurants: [String], favoriteFoodItems: [String],
    walletBalance: { type: Number, default: 0, min: 0 }, totalSpent: { type: Number, default: 0 },
    couponsUsed: [String], dietaryPreferences: [String], cuisinePreferences: [String],
    language: { type: String, default: 'en' }, timezone: { type: String, default: 'Asia/Kolkata' },
    notifications: {
      push: { type: Boolean, default: true }, email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }, promotions: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const UserProfile = mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);
