import { Request, Response, NextFunction } from 'express';
import { searchService } from '../services/SearchService';
import { sendSuccess } from '../utils/response';

export class SearchController {
  async searchAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, city, cuisineTypes, priceRange, rating, sortBy, page, limit } = req.query;
      const result = await searchService.searchAll(q as string, {
        city: city as string,
        cuisineTypes: cuisineTypes ? String(cuisineTypes).split(',') : undefined,
        priceRange: priceRange ? String(priceRange).split(',').map(Number) : undefined,
        rating: rating ? Number(rating) : undefined,
        sortBy: sortBy as string, page: page ? Number(page) : undefined, limit: limit ? Number(limit) : undefined,
      }, req.user?.userId);
      sendSuccess(res, 'Search results', result);
    } catch (error) { next(error); }
  }
  async getSuggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Suggestions', await searchService.getSuggestions(req.query.q as string)); }
    catch (error) { next(error); }
  }
  async getPopular(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Popular searches', await searchService.getPopularSearches(Number(req.query.limit) || 10)); }
    catch (error) { next(error); }
  }
  async getRecent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, 'Recent searches', await searchService.getRecentSearches(req.user!.userId, Number(req.query.limit) || 10)); }
    catch (error) { next(error); }
  }
  async clearHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await searchService.clearSearchHistory(req.user!.userId); sendSuccess(res, 'Search history cleared'); }
    catch (error) { next(error); }
  }
  async trackClick(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { await searchService.trackSearchClick(req.body.query, req.body.resultId, req.body.resultType); sendSuccess(res, 'Click tracked'); }
    catch (error) { next(error); }
  }
}

export const searchController = new SearchController();
