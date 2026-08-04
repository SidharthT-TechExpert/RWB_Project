import { Request, Response } from 'express';
import { branchService } from '../services/BranchService';
import { HTTP_STATUS } from '../constants';

export class BranchController {
  async create(req: Request, res: Response): Promise<void> {
    const ownerId = (req as any).user?._id || (req as any).user?.id || 'owner_onboarded';
    const branch = await branchService.createBranch(ownerId, req.body);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: branch });
  }

  async getByRestaurant(req: Request, res: Response): Promise<void> {
    const { restaurantId } = req.params;
    const branches = await branchService.getBranchesByRestaurant(restaurantId);
    res.status(HTTP_STATUS.OK).json({ success: true, data: branches });
  }

  async getMyBranches(req: Request, res: Response): Promise<void> {
    const ownerId = (req as any).user?._id || (req as any).user?.id;
    const branches = await branchService.getBranchesByOwner(ownerId);
    res.status(HTTP_STATUS.OK).json({ success: true, data: branches });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const branch = await branchService.getBranchById(id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: branch });
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const ownerId = (req as any).user?._id || (req as any).user?.id;
    const branch = await branchService.updateBranch(id, ownerId, req.body);
    res.status(HTTP_STATUS.OK).json({ success: true, data: branch });
  }

  async assignManager(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const ownerId = (req as any).user?._id || (req as any).user?.id;
    const result = await branchService.assignBranchManager(id, ownerId, req.body);
    res.status(HTTP_STATUS.OK).json({ success: true, data: result });
  }

  async getManagers(req: Request, res: Response): Promise<void> {
    const ownerId = (req as any).user?._id || (req as any).user?.id;
    const managers = await branchService.getBranchManagers(ownerId);
    res.status(HTTP_STATUS.OK).json({ success: true, data: managers });
  }
}

export const branchController = new BranchController();
