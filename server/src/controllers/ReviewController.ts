import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/ReviewService';
import { sendSuccess, sendCreated } from '../utils/response';

export class ReviewController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as { userId: string; name?: string; avatar?: string };
      sendCreated(res, 'Review submitted', await reviewService.createReview(user.userId, user.name || 'Anonymous', user.avatar, req.body));
    } catch (error) { next(error); }
  }
  async getByRestaurant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await reviewService.getReviewsByRestaurant(req.params.restaurantId, Number(req.query.page) || 1, Number(req.query.limit) || 20, req.query.sortBy as string);
      sendSuccess(res, 'Reviews retrieved', result.reviews, 200, result.meta);
    } catch (error) { next(error); }
  }
  async getMyReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await reviewService.getReviewsByUser(req.user!.userId, Number(req.query.page) || 1, Number(req.query.limit) || 20);
      sendSuccess(res, 'Reviews retrieved', result.reviews, 200, result.meta);
    } catch (error) { next(error); }
  }
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Review updated', await reviewService.updateReview(req.params.id, req.user!.userId, req.body)); }
    catch (error) { next(error); }
  }
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await reviewService.deleteReview(req.params.id, req.user!.userId); sendSuccess(res, 'Review deleted'); }
    catch (error) { next(error); }
  }
  async addReply(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Reply added', await reviewService.addReply(req.params.id, req.user!.userId, req.body.text)); }
    catch (error) { next(error); }
  }
  async voteHelpful(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Vote recorded', await reviewService.voteHelpful(req.params.id, req.user!.userId)); }
    catch (error) { next(error); }
  }
  async report(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await reviewService.reportReview(req.params.id, req.user!.userId, req.body.reason); sendSuccess(res, 'Review reported'); }
    catch (error) { next(error); }
  }
}

export const reviewController = new ReviewController();
