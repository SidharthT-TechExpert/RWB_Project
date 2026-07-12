import { Request, Response, NextFunction } from 'express';
import { searchService } from '../services/SearchService';
import { sendSuccess } from '@quickbite/shared';

export class SearchController {
  async searchAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, city, cuisineTypes, priceRange, rating, sortBy, page, limit } = req.query;
      const filters = {
        city: city as string,
        cuisineTypes: cuisineTypes ? String(cuisineTypes).split(',') : undefined,
        priceRange: priceRange ? String(priceRange).split(',').map(Number) : undefined,
        rating: rating ? Number(rating) : undefined,
        sortBy: sortBy as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      };
      const result = await searchService.searchAll(q as string, filters, req.user?.userId);
      sendSuccess(res, 'Search results', result);
    } catch (error) { next(error); }
  }

  async searchRestaurants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, ...filters } = req.query;
      const results = await searchService.searchRestaurants(q as string, filters);
      sendSuccess(res, 'Restaurant search results', results);
    } catch (error) { next(error); }
  }

  async searchFood(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, restaurantId, ...filters } = req.query;
      const results = await searchService.searchFood(q as string, restaurantId as string, filters);
      sendSuccess(res, 'Food search results', results);
    } catch (error) { next(error); }
  }

  async getSuggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const suggestions = await searchService.getSuggestions(req.query.q as string);
      sendSuccess(res, 'Suggestions', suggestions);
    } catch (error) { next(error); }
  }

  async getPopularSearches(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const searches = await searchService.getPopularSearches(Number(req.query.limit) || 10);
      sendSuccess(res, 'Popular searches', searches);
    } catch (error) { next(error); }
  }

  async getRecentSearches(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const searches = await searchService.getRecentSearches(req.user!.userId, Number(req.query.limit) || 10);
      sendSuccess(res, 'Recent searches', searches);
    } catch (error) { next(error); }
  }

  async clearHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await searchService.clearSearchHistory(req.user!.userId);
      sendSuccess(res, 'Search history cleared');
    } catch (error) { next(error); }
  }

  async trackClick(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query, resultId, resultType } = req.body;
      await searchService.trackSearchClick(query, resultId, resultType);
      sendSuccess(res, 'Click tracked');
    } catch (error) { next(error); }
  }
}

export const searchController = new SearchController();
