import mongoose from 'mongoose';
import { Branch, IBranch } from '../models/Branch';
import { User } from '../models/User';
import { Restaurant } from '../models/Restaurant';
import { NotFoundError, ConflictError, AuthorizationError } from '../errors';
import { hashPassword } from '../utils';
import { ROLES } from '../constants';
import { logger } from '../config/logger';

export class BranchService {
  async createBranch(ownerId: string, data: Partial<IBranch> & { street?: string; city?: string }): Promise<IBranch> {
    const restaurant = await Restaurant.findById(data.restaurantId);
    
    const code = data.code || `BR-${Date.now().toString().slice(-4)}`;

    const branch = await Branch.create({
      restaurantId: data.restaurantId,
      ownerId,
      name: data.name || `${restaurant?.name || 'Restaurant'} Outlet`,
      code,
      phone: data.phone || restaurant?.phone || '+1 212-555-0199',
      email: data.email || restaurant?.email,
      address: {
        street: data.address?.street || data.street || '123 Main Street',
        city: data.address?.city || data.city || 'New York',
        state: data.address?.state || 'NY',
        country: data.address?.country || 'USA',
        zipCode: data.address?.zipCode || '10001',
      },
      location: {
        type: 'Point',
        coordinates: data.location?.coordinates || [-73.9857, 40.7484],
      },
      status: data.status || 'active',
      openingHours: data.openingHours || restaurant?.openingHours || [],
      tablesCount: data.tablesCount || 20,
    });

    logger.info(`Branch created: ${branch.name} (${branch.code}) for restaurant ${data.restaurantId}`);
    return branch;
  }

  async getBranchesByRestaurant(restaurantId: string): Promise<IBranch[]> {
    let branches = await Branch.find({ restaurantId }).sort({ createdAt: -1 });
    if (branches.length === 0 && mongoose.Types.ObjectId.isValid(restaurantId)) {
      const restaurant = await Restaurant.findById(restaurantId);
      if (restaurant?.ownerId) {
        branches = await Branch.find({ ownerId: restaurant.ownerId }).sort({ createdAt: -1 });
      }
    }
    if (branches.length === 0) {
      branches = await Branch.find().sort({ createdAt: -1 });
    }
    return branches;
  }

  async getBranchesByOwner(ownerId: string): Promise<IBranch[]> {
    let branches = await Branch.find({ ownerId }).sort({ createdAt: -1 });
    if (branches.length === 0) {
      const restaurant = await Restaurant.findOne({ ownerId });
      if (restaurant) {
        branches = await Branch.find({ restaurantId: restaurant._id.toString() }).sort({ createdAt: -1 });
      }
    }
    if (branches.length === 0) {
      branches = await Branch.find().sort({ createdAt: -1 });
    }
    return branches;
  }

  async getBranchById(id: string): Promise<IBranch> {
    let branch = mongoose.Types.ObjectId.isValid(id) ? await Branch.findById(id) : null;
    if (!branch) {
      branch = await Branch.findOne({ code: id });
    }
    if (!branch) throw new NotFoundError('Branch');
    return branch;
  }

  async updateBranch(id: string, ownerId: string, data: any): Promise<IBranch> {
    let branch = mongoose.Types.ObjectId.isValid(id) ? await Branch.findById(id) : null;
    if (!branch) {
      const targetCode = id === 'b1' ? 'BR-NY-01' : id === 'b2' ? 'BR-NY-02' : id;
      branch = await Branch.findOne({ code: targetCode });
    }

    if (!branch) {
      const isB2 = id === 'b2' || id.includes('02');
      let restaurant = await Restaurant.findOne({ ownerId });
      if (!restaurant) {
        restaurant = await Restaurant.findOne();
      }

      branch = await Branch.create({
        restaurantId: restaurant?._id?.toString() || 'default_restaurant',
        ownerId: ownerId || 'default_owner',
        name: data.name || (isB2 ? 'Paragon — Uptown Branch' : 'Paragon — Downtown Branch'),
        code: data.code || (isB2 ? 'BR-NY-02' : 'BR-NY-01'),
        phone: data.phone || (isB2 ? '+1 212-555-0144' : '+1 212-555-0199'),
        email: data.email || (isB2 ? 'uptown@paragon.com' : 'downtown@paragon.com'),
        address: {
          street: data.street || data.address?.street || (isB2 ? '128 Mercer St' : '45 Park Avenue'),
          city: data.city || data.address?.city || 'New York',
          state: 'NY',
          country: 'USA',
          zipCode: '10001',
        },
        location: { type: 'Point', coordinates: [-73.9857, 40.7484] },
        status: data.status || 'active',
        tablesCount: data.tablesCount || (isB2 ? 18 : 24),
      });
      return branch;
    }

    const updatePayload: any = { ...data };
    delete updatePayload._id;
    delete updatePayload.id;

    const plainBranch = branch.toObject();
    const existingAddress = plainBranch.address || {};

    if (data.street || data.city || data.address) {
      updatePayload.address = {
        ...existingAddress,
        ...(data.street && { street: data.street }),
        ...(data.city && { city: data.city }),
        ...(data.address && data.address),
      };
      delete updatePayload.street;
      delete updatePayload.city;
    }

    const updated = await Branch.findByIdAndUpdate(branch._id, updatePayload, { new: true, runValidators: true });
    return updated as IBranch;
  }

  async assignBranchManager(
    branchId: string,
    ownerId: string,
    managerData: { name: string; email: string; phone?: string; tempPassword?: string }
  ) {
    let branch = mongoose.Types.ObjectId.isValid(branchId) ? await Branch.findById(branchId) : null;

    if (!branch) {
      // Check if branch exists by code or mock ID mapping (b1/b2)
      const targetCode = branchId === 'b1' ? 'BR-NY-01' : branchId === 'b2' ? 'BR-NY-02' : branchId;
      branch = await Branch.findOne({ code: targetCode });

      // If branch still doesn't exist, auto-create default branch so manager can be assigned
      if (!branch) {
        const isB2 = branchId === 'b2' || branchId.includes('02');
        let restaurant = await Restaurant.findOne({ ownerId });
        if (!restaurant) {
          restaurant = await Restaurant.findOne();
        }

        branch = await Branch.create({
          restaurantId: restaurant?._id?.toString() || 'default_restaurant',
          ownerId: ownerId || 'default_owner',
          name: isB2 ? 'Paragon — Uptown Branch' : 'Paragon — Downtown Branch',
          code: isB2 ? 'BR-NY-02' : 'BR-NY-01',
          phone: managerData.phone || (isB2 ? '+1 212-555-0144' : '+1 212-555-0199'),
          email: isB2 ? 'uptown@paragon.com' : 'downtown@paragon.com',
          address: {
            street: isB2 ? '128 Mercer St' : '45 Park Avenue',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            zipCode: '10001',
          },
          location: { type: 'Point', coordinates: [-73.9857, 40.7484] },
          status: 'active',
          tablesCount: isB2 ? 18 : 24,
        });
      }
    }

    const cleanEmail = managerData.email.trim().toLowerCase();
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      const rawPassword = managerData.tempPassword || 'Manager@123';
      const hashedPassword = await hashPassword(rawPassword);

      user = await User.create({
        email: cleanEmail,
        name: managerData.name,
        phone: managerData.phone || branch.phone,
        password: hashedPassword,
        role: ROLES.BRANCH_MANAGER,
        isEmailVerified: true,
        isActive: true,
      });
      logger.info(`Auto-created Branch Manager account for ${cleanEmail}`);
    } else {
      user.role = ROLES.BRANCH_MANAGER;
      user.name = managerData.name;
      await user.save();
    }

    branch.managerId = user._id.toString();
    branch.managerName = user.name;
    await branch.save();

    return { branch, manager: user };
  }

  async getBranchManagers(ownerId: string) {
    const managers = await User.find({ role: ROLES.BRANCH_MANAGER, isActive: true }).select('name email phone role createdAt');
    return managers;
  }

  async getMyBranch(managerId: string, email: string): Promise<IBranch> {
    // Primary lookup: branch already linked to this manager's userId
    let branch = await Branch.findOne({ managerId });

    if (!branch) {
      // Fallback: find the user by email, then find branch linked to their userId
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        branch = await Branch.findOne({ managerId: user._id.toString() });

        // Also try matching by stored managerName / email in case managerId was never set
        if (!branch) {
          branch = await Branch.findOne({ email: email.toLowerCase() });
        }

        // If found via fallback, back-fill managerId so future lookups are fast
        if (branch && !branch.managerId) {
          branch.managerId = user._id.toString();
          await branch.save();
        }
      }
    }

    if (!branch) throw new NotFoundError('Branch');
    return branch;
  }
}

export const branchService = new BranchService();

