import { Request, Response } from 'express';
import { StoreService } from '../services/store.service';
import { successResponse, errorResponse } from '../utils/response';

export class StoreController {
	static async getStores(req: Request, res: Response) {
		try {
			const query = req.query;
			const result = await StoreService.getStores({
				is_active: query.isActive ? query.isActive === 'true' : undefined,
				page: query.page ? parseInt(query.page as string, 10) : 1,
				limit: query.limit ? parseInt(query.limit as string, 10) : 20,
				search: query.search as string | undefined,
			});
			return successResponse(res, result, 'Mağazalar gətirildi');
		} catch (error: any) {
			return errorResponse(res, error.message || 'Mağazalar gətirilə bilmədi', 500);
		}
	}

	static async getMyStore(req: Request, res: Response) {
		try {
			let storeId = (req as any).user?.storeId;
			if (!storeId) {
				// Super admin fallback: just pick the first store
				const result = await StoreService.getStores({ limit: 1 });
				if (result.stores.length > 0) {
					storeId = result.stores[0].id;
				}
			}
			
			if (!storeId) return errorResponse(res, 'Mağaza tapılmadı', 404);
			
			const store = await StoreService.getStoreById(storeId);
			return successResponse(res, store, 'Mağaza gətirildi');
		} catch (error: any) {
			return errorResponse(res, error.message || 'Mağaza gətirilə bilmədi', 500);
		}
	}

	static async updateMyStore(req: Request, res: Response) {
		try {
			let storeId = (req as any).user?.storeId;
			if (!storeId) {
				const result = await StoreService.getStores({ limit: 1 });
				if (result.stores.length > 0) {
					storeId = result.stores[0].id;
				}
			}
			
			if (!storeId) return errorResponse(res, 'Mağaza tapılmadı', 404);
			
			const updated = await StoreService.updateStore(storeId, req.body);
			return successResponse(res, updated, 'Mağaza məlumatları yeniləndi');
		} catch (error: any) {
			return errorResponse(res, error.message || 'Mağaza yenilənə bilmədi', 500);
		}
	}

	static async getStore(req: Request, res: Response) {
		try {
			const id = req.params.id as string;
			const store = await StoreService.getStoreById(id);
			if (!store) return errorResponse(res, 'Mağaza tapılmadı', 404);
			return successResponse(res, store, 'Mağaza tapıldı');
		} catch (error: any) {
			return errorResponse(res, error.message || 'Mağaza gətirilə bilmədi', 500);
		}
	}

	static async createStore(req: Request, res: Response) {
		try {
			const payload = req.body;
			const store = await StoreService.createStore(payload);
			return successResponse(res, store, 'Mağaza yaradıldı');
		} catch (error: any) {
			return errorResponse(res, error.message || 'Mağaza yaradılmadı', 500);
		}
	}

	static async updateStore(req: Request, res: Response) {
		try {
			const id = req.params.id as string;
			const updateData = req.body;
			const updated = await StoreService.updateStore(id, updateData);
			if (!updated) return errorResponse(res, 'Mağaza tapılmadı və ya yenilənə bilmədi', 404);
			return successResponse(res, updated, 'Mağaza yeniləndi');
		} catch (error: any) {
			return errorResponse(res, error.message || 'Mağaza yenilənə bilmədi', 500);
		}
	}

	static async deleteStore(req: Request, res: Response) {
		try {
			const id = req.params.id as string;
			const ok = await StoreService.deleteStore(id);
			if (!ok) return errorResponse(res, 'Mağaza tapılmadı və ya silinə bilmədi', 404);
			return successResponse(res, null, 'Mağaza silindi');
		} catch (error: any) {
			return errorResponse(res, error.message || 'Mağaza silinə bilmədi', 500);
		}
	}
}
