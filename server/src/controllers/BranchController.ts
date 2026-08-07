import { Request, Response, NextFunction } from 'express';
import { branchService } from '../services/BranchService';
import { HTTP_STATUS } from '../constants';

export class BranchController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = (req as any).user?._id || (req as any).user?.id || 'owner_onboarded';
      const branch = await branchService.createBranch(ownerId, req.body);
      res.status(HTTP_STATUS.CREATED).json({ success: true, data: branch });
    } catch (error) { next(error); }
  }

  async getByRestaurant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const branches = await branchService.getBranchesByRestaurant(restaurantId);
      res.status(HTTP_STATUS.OK).json({ success: true, data: branches });
    } catch (error) { next(error); }
  }

  async getMyBranches(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = (req as any).user?._id || (req as any).user?.id;
      const branches = await branchService.getBranchesByOwner(ownerId);
      res.status(HTTP_STATUS.OK).json({ success: true, data: branches });
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const branch = await branchService.getBranchById(id);
      res.status(HTTP_STATUS.OK).json({ success: true, data: branch });
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const ownerId = (req as any).user?._id || (req as any).user?.id;
      const branch = await branchService.updateBranch(id, ownerId, req.body);
      res.status(HTTP_STATUS.OK).json({ success: true, data: branch });
    } catch (error) { next(error); }
  }

  async assignManager(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const ownerId = (req as any).user?._id || (req as any).user?.id;
      const result = await branchService.assignBranchManager(id, ownerId, req.body);
      res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async getManagers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = (req as any).user?._id || (req as any).user?.id;
      const managers = await branchService.getBranchManagers(ownerId);
      res.status(HTTP_STATUS.OK).json({ success: true, data: managers });
    } catch (error) { next(error); }
  }

  async getMyBranch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, email } = (req as any).user as { userId: string; email: string };
      const branch = await branchService.getMyBranch(userId, email);
      res.status(HTTP_STATUS.OK).json({ success: true, data: branch });
    } catch (error) { next(error); }
  }
}

export const branchController = new BranchController();
