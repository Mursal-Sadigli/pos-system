import { StoreModel, CreateStoreData } from '../models/Store.model';

export class StoreService {
	static async createStore(data: CreateStoreData) {
		return StoreModel.create(data);
	}

	static async getStoreById(id: string) {
		return StoreModel.findById(id);
	}

	static async getStores(options?: { is_active?: boolean; page?: number; limit?: number; search?: string }) {
		return StoreModel.findAll(options as any);
	}

	static async updateStore(id: string, data: Partial<any>) {
		return StoreModel.update(id, data);
	}

	static async deleteStore(id: string) {
		return StoreModel.delete(id);
	}
}
