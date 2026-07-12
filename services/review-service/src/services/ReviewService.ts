import axios from 'axios';
import {
  NotFoundError,
  AuthorizationError,
  ConflictError,
  AppError,
  HTTP_STATUS,
  getPaginationParams,
  buildPaginationMeta,
  createLogger,
} from '@quickbite/shared';
import { Review, IReview } from '../models/Review';

const logger = createLogger('review-service');
const RESTAURANT_URL = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3003';

export class ReviewService {
  async createReview(
    userId: string,
    userName: string,
    userAvatar: string | undefined,
    data: Partial<IReview>
  ): Promise<IReview> {
    // One review per restaurant per user
    const existing = await Review.findOne({ userId, restaurantId: data.restaurantId });
    if (existing) throw new ConflictError('You have already reviewed this restaurant');

    const review = await Review.create({ ...data, userId, userName, userAvatar });

    // Update restaurant rating (fire-and-forget)
    this.updateRestaurantRating(data.restaurantId!).catch((err) =>
      logger.error('Failed to update restaurant rating:', err)
    );

    logger.info(`Review created for restaurant ${data.restaurantId} by user ${userId}`);
    return review;
  }

  async updateReview(id: string, userId: string, data: Partial<IReview>): Promise<IReview> {
    const review = await Review.findById(id);
    if (!review) throw new NotFoundError('Review');
    if (review.userId !== userId) throw new AuthorizationError();

    Object.assign(review, data);
    await review.save();

    this.updateRestaurantRating(review.restaurantId).catch((err) =>
      logger.error('Failed to update restaurant rating:', err)
    );

    return review;
  }

  async deleteReview(id: string, userId: string, isAdmin = false): Promise<void> {
    const review = await Review.findById(id);
    if (!review) throw new NotFoundError('Review');
    if (!isAdmin && review.userId !== userId) throw new AuthorizationError();

    await review.deleteOne();
    this.updateRestaurantRating(review.restaurantId).catch(() => {});
  }

  async getReviewsByRestaurant(
    restaurantId: string,
    page = 1,
    limit = 20,
    sortBy = 'recent'
  ) {
    const { skip } = getPaginationParams(page, limit);
    const sort: Record<string, 1 | -1> =
      sortBy === 'helpful'
        ? { helpfulVotes: -1 }
        : sortBy === 'highest'
        ? { rating: -1 }
        : sortBy === 'lowest'
        ? { rating: 1 }
        : { createdAt: -1 };

    const filter = { restaurantId, isHidden: false };
    const [reviews, total] = await Promise.all([
      Review.find(filter).sort(sort).skip(skip).limit(limit),
      Review.countDocuments(filter),
    ]);

    // Get rating distribution
    const ratingDist = await Review.aggregate([
      { $match: filter },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    return {
      reviews,
      meta: buildPaginationMeta(page, limit, total),
      ratingDistribution: ratingDist,
    };
  }

  async getReviewsByUser(userId: string, page = 1, limit = 20) {
    const { skip } = getPaginationParams(page, limit);
    const [reviews, total] = await Promise.all([
      Review.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Review.countDocuments({ userId }),
    ]);
    return { reviews, meta: buildPaginationMeta(page, limit, total) };
  }

  async addReply(reviewId: string, restaurantOwnerId: string, text: string): Promise<IReview> {
    const review = await Review.findById(reviewId);
    if (!review) throw new NotFoundError('Review');

    review.reply = { text, repliedAt: new Date() };
    await review.save();
    return review;
  }

  async voteHelpful(reviewId: string, userId: string): Promise<IReview> {
    const review = await Review.findById(reviewId);
    if (!review) throw new NotFoundError('Review');
    if (review.userId === userId) throw new AppError('Cannot vote on your own review', HTTP_STATUS.BAD_REQUEST);

    const alreadyVoted = review.helpfulVotedBy.includes(userId);
    if (alreadyVoted) {
      review.helpfulVotedBy = review.helpfulVotedBy.filter((id) => id !== userId);
      review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
    } else {
      review.helpfulVotedBy.push(userId);
      review.helpfulVotes += 1;
    }

    await review.save();
    return review;
  }

  async reportReview(reviewId: string, userId: string, reason: string): Promise<void> {
    await Review.findByIdAndUpdate(reviewId, { isReported: true, reportReason: reason });
  }

  private async updateRestaurantRating(restaurantId: string): Promise<void> {
    const result = await Review.aggregate([
      { $match: { restaurantId, isHidden: false } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    const avg = result[0]?.avg ? Math.round(result[0].avg * 10) / 10 : 0;
    const count = result[0]?.count || 0;

    await axios
      .patch(`${RESTAURANT_URL}/api/v1/restaurants/${restaurantId}/rating`, {
        averageRating: avg,
        totalReviews: count,
      })
      .catch(() => {});
  }
}

export const reviewService = new ReviewService();
