import { BankVerificationRequest, IBankVerificationRequest } from '../models/BankVerificationRequest';
import { Restaurant } from '../models/Restaurant';
import { User } from '../models/User';
import { NotFoundError, AppError } from '../errors';
import { getPaginationParams, buildPaginationMeta } from '../utils';
import { logger } from '../config/logger';

export class BankVerificationService {
  async submitBankRequest(ownerId: string, data: {
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    branchName?: string;
    accountType?: 'current' | 'savings';
    upiId?: string;
    payoutSchedule?: 'daily' | 'weekly' | 'monthly';
    restaurantId?: string;
  }): Promise<IBankVerificationRequest> {
    let restaurant = data.restaurantId
      ? await Restaurant.findById(data.restaurantId)
      : await Restaurant.findOne({ ownerId });

    if (!restaurant) {
      restaurant = await Restaurant.findOne();
    }

    if (!restaurant) {
      throw new NotFoundError('Restaurant for this owner');
    }

    const user = await User.findById(ownerId);
    const ownerName = user?.name || restaurant.ownerName || 'Restaurant Owner';

    if (!data.bankName?.trim()) throw new AppError('Bank name is required', 400);
    if (!data.accountHolderName?.trim()) throw new AppError('Account holder name is required', 400);
    if (!data.accountNumber?.trim()) throw new AppError('Account number is required', 400);
    if (!data.ifscCode?.trim()) throw new AppError('IFSC / SWIFT code is required', 400);

    const bankReq = await BankVerificationRequest.create({
      restaurantId: restaurant._id.toString(),
      ownerId: ownerId || restaurant.ownerId,
      restaurantName: restaurant.name,
      ownerName,
      bankName: data.bankName.trim(),
      accountHolderName: data.accountHolderName.trim(),
      accountNumber: data.accountNumber.trim(),
      ifscCode: data.ifscCode.trim().toUpperCase(),
      branchName: data.branchName?.trim() || '',
      accountType: data.accountType || 'current',
      upiId: data.upiId?.trim() || '',
      payoutSchedule: data.payoutSchedule || 'daily',
      status: 'pending',
    });

    // Attach pending request directly to restaurant document
    await Restaurant.findByIdAndUpdate(restaurant._id, {
      pendingBankRequest: {
        requestId: bankReq._id.toString(),
        bankName: bankReq.bankName,
        accountHolderName: bankReq.accountHolderName,
        accountNumber: bankReq.accountNumber,
        ifscCode: bankReq.ifscCode,
        branchName: bankReq.branchName,
        accountType: bankReq.accountType,
        upiId: bankReq.upiId,
        payoutSchedule: bankReq.payoutSchedule,
        submittedAt: bankReq.createdAt,
      },
    });

    logger.info(`Bank verification request submitted for ${restaurant.name} (${restaurant._id}) by owner ${ownerId}`);
    return bankReq;
  }

  async getOwnerBankDetails(ownerId: string, restaurantId?: string) {
    let restaurant = restaurantId
      ? await Restaurant.findById(restaurantId)
      : await Restaurant.findOne({ ownerId });

    if (!restaurant) {
      restaurant = await Restaurant.findOne();
    }

    if (!restaurant) {
      return {
        bankDetails: null,
        pendingBankRequest: null,
        history: [],
      };
    }

    const restIdStr = restaurant._id.toString();

    const [pendingRequest, history] = await Promise.all([
      BankVerificationRequest.findOne({ restaurantId: restIdStr, status: 'pending' }).sort({ createdAt: -1 }),
      BankVerificationRequest.find({ restaurantId: restIdStr }).sort({ createdAt: -1 }).limit(10),
    ]);

    return {
      restaurantId: restIdStr,
      restaurantName: restaurant.name,
      bankDetails: restaurant.bankDetails || null,
      pendingBankRequest: pendingRequest || restaurant.pendingBankRequest || null,
      history,
    };
  }

  async getAdminBankRequests(status?: string, page = 1, limit = 20) {
    const { skip } = getPaginationParams(page, limit);
    const filter: Record<string, unknown> = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const [requests, total] = await Promise.all([
      BankVerificationRequest.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      BankVerificationRequest.countDocuments(filter),
    ]);

    return { requests, meta: buildPaginationMeta(page, limit, total) };
  }

  async approveBankRequest(requestId: string, adminId: string, adminNotes?: string): Promise<IBankVerificationRequest> {
    const request = await BankVerificationRequest.findById(requestId);
    if (!request) throw new NotFoundError('Bank verification request');

    request.status = 'approved';
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();
    if (adminNotes) request.adminNotes = adminNotes;
    await request.save();

    // Update restaurant active bank details & clear pending
    await Restaurant.findByIdAndUpdate(request.restaurantId, {
      bankDetails: {
        bankName: request.bankName,
        accountHolderName: request.accountHolderName,
        accountNumber: request.accountNumber,
        ifscCode: request.ifscCode,
        branchName: request.branchName,
        accountType: request.accountType,
        upiId: request.upiId,
        payoutSchedule: request.payoutSchedule,
        isVerified: true,
        lastApprovedAt: new Date(),
      },
      pendingBankRequest: null,
    });

    logger.info(`Bank verification request ${requestId} approved by admin ${adminId} for restaurant ${request.restaurantId}`);
    return request;
  }

  async rejectBankRequest(requestId: string, adminId: string, reason: string): Promise<IBankVerificationRequest> {
    const request = await BankVerificationRequest.findById(requestId);
    if (!request) throw new NotFoundError('Bank verification request');

    request.status = 'rejected';
    request.rejectionReason = reason || 'Bank details could not be verified by compliance team';
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();
    await request.save();

    // Clear pending request from restaurant so owner can resubmit
    await Restaurant.findByIdAndUpdate(request.restaurantId, {
      pendingBankRequest: null,
    });

    logger.info(`Bank verification request ${requestId} rejected by admin ${adminId}. Reason: ${reason}`);
    return request;
  }
}

export const bankVerificationService = new BankVerificationService();
