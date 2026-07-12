import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/ReviewService';
import { sendSuccess, sendCreated } from '@quickbite/shared';

export class ReviewController {
  async createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, name: userName, avatar: userAvatar } = req.user as { userId: string; name?: string; avatar?: string; email: string; role: string };
      const review = await reviewService.createReview(userId, userName || 'Anonymous', userAvatar, req.body);
      sendCreated(res, 'Review submitted', review);
    } catch (error) { next(error); }
  }

  async getRestaurantReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const { page, limit, sortBy } = req.query;
      const result = await reviewService.getReviewsByRestaurant(restaurantId, Number(page) || 1, Number(limit) || 20, sortBy as string);
      sendSuccess(res, 'Reviews retrieved', result.reviews, 200, result.meta);
    } catch (error) { next(error); }
  }

  async getMyReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = req.query;
      const result = await reviewService.getReviewsByUser(req.user!.userId, Number(page) || 1, Number(limit) || 20);
      sendSuccess(res, 'Reviews retrieved', result.reviews, 200, result.meta);
    } catch (error) { next(error); }
  }

  async updateReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await reviewService.updateReview(req.params.id, req.user!.userId, req.body);
      sendSuccess(res, 'Review updated', review);
    } catch (error) { next(error); }
  }

  async deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await reviewService.deleteReview(req.params.id, req.user!.userId);
      sendSuccess(res, 'Review deleted');
    } catch (error) { next(error); }
  }

  async addReply(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await reviewService.addReply(req.params.id, req.user!.userId, req.body.text);
      sendSuccess(res, 'Reply added', review);
    } catch (error) { next(error); }
  }

  async voteHelpful(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await reviewService.voteHelpful(req.params.id, req.user!.userId);
      sendSuccess(res, 'Vote recorded', review);
    } catch (error) { next(error); }
  }

  async reportReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await reviewService.reportReview(req.params.id, req.user!.userId, req.body.reason);
      sendSuccess(res, 'Review reported');
    } catch (error) { next(error); }
  }
}

export const reviewController = new ReviewController();
