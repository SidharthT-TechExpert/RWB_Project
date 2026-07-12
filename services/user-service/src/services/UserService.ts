import {
  NotFoundError,
  AppError,
  HTTP_STATUS,
  createLogger,
} from '@quickbite/shared';
import { UserProfile, IUserProfile, IAddress } from '../models/UserProfile';

const logger = createLogger('user-service');

export class UserService {
  async getOrCreateProfile(userId: string, defaults: Partial<IUserProfile>): Promise<IUserProfile> {
    let profile = await UserProfile.findOne({ userId });
    if (!profile) {
      profile = await UserProfile.create({ userId, ...defaults });
    }
    return profile;
  }

  async getProfile(userId: string): Promise<IUserProfile> {
    const profile = await UserProfile.findOne({ userId });
    if (!profile) throw new NotFoundError('User profile');
    return profile;
  }

  async updateProfile(userId: string, data: Partial<IUserProfile>): Promise<IUserProfile> {
    const profile = await UserProfile.findOneAndUpdate({ userId }, { $set: data }, { new: true, upsert: true });
    if (!profile) throw new NotFoundError('User profile');
    return profile;
  }

  // Addresses
  async addAddress(userId: string, address: Omit<IAddress, '_id'>): Promise<IUserProfile> {
    const profile = await UserProfile.findOne({ userId });
    if (!profile) throw new NotFoundError('User profile');

    if (address.isDefault) {
      profile.addresses.forEach((a) => (a.isDefault = false));
    }
    if (profile.addresses.length === 0) address.isDefault = true;

    profile.addresses.push(address);
    return profile.save();
  }

  async updateAddress(userId: string, addressId: string, data: Partial<IAddress>): Promise<IUserProfile> {
    const profile = await UserProfile.findOne({ userId });
    if (!profile) throw new NotFoundError('User profile');

    const addr = profile.addresses.find((a) => a._id?.toString() === addressId);
    if (!addr) throw new NotFoundError('Address');

    if (data.isDefault) profile.addresses.forEach((a) => (a.isDefault = false));
    Object.assign(addr, data);
    return profile.save();
  }

  async deleteAddress(userId: string, addressId: string): Promise<IUserProfile> {
    const profile = await UserProfile.findOne({ userId });
    if (!profile) throw new NotFoundError('User profile');
    profile.addresses = profile.addresses.filter((a) => a._id?.toString() !== addressId);
    return profile.save();
  }

  // Favorites
  async toggleFavoriteRestaurant(userId: string, restaurantId: string): Promise<{ isFavorite: boolean }> {
    const profile = await UserProfile.findOne({ userId });
    if (!profile) throw new NotFoundError('User profile');

    const idx = profile.favoriteRestaurants.indexOf(restaurantId);
    if (idx > -1) {
      profile.favoriteRestaurants.splice(idx, 1);
      await profile.save();
      return { isFavorite: false };
    } else {
      profile.favoriteRestaurants.push(restaurantId);
      await profile.save();
      return { isFavorite: true };
    }
  }

  async getFavoriteRestaurants(userId: string): Promise<string[]> {
    const profile = await UserProfile.findOne({ userId });
    return profile?.favoriteRestaurants || [];
  }

  // Wallet
  async getWalletBalance(userId: string): Promise<number> {
    const profile = await UserProfile.findOne({ userId });
    return profile?.walletBalance || 0;
  }

  async topUpWallet(userId: string, amount: number): Promise<IUserProfile> {
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $inc: { walletBalance: amount } },
      { new: true }
    );
    if (!profile) throw new NotFoundError('User profile');
    return profile;
  }

  async deductWallet(userId: string, amount: number): Promise<IUserProfile> {
    const profile = await UserProfile.findOne({ userId });
    if (!profile) throw new NotFoundError('User profile');
    if (profile.walletBalance < amount) throw new AppError('Insufficient wallet balance', HTTP_STATUS.BAD_REQUEST);

    profile.walletBalance -= amount;
    return profile.save();
  }

  // Notification preferences
  async updateNotificationPreferences(
    userId: string,
    prefs: Partial<IUserProfile['notifications']>
  ): Promise<IUserProfile> {
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: { notifications: prefs } },
      { new: true }
    );
    if (!profile) throw new NotFoundError('User profile');
    return profile;
  }
}

export const userService = new UserService();
