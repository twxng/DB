import axiosClient from './axiosClient';

// Інтерфейси для роботи з постачальниками
export interface Supplier {
  supplierId: number;
  companyName: string;
  contactPerson?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  website?: string;
  createdAt: string;
  isActive: boolean;
}

// Інтерфейс для обробки відповіді з сервера (SupplierDTO)
interface SupplierDTO {
  supplierID?: number;
  SupplierID?: number;
  companyName: string;
  contactPerson?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  website?: string;
  createdAt: string;
  isActive: boolean;
}

export interface SupplierListResponse {
  suppliers: Supplier[];
  totalCount: number;
}

export interface SupplierCreateRequest {
  companyName: string;
  contactPerson?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  website?: string;
  isActive?: boolean;
}

export interface SupplierUpdateRequest {
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  isActive?: boolean;
}

const supplierService = {
  // Отримання списку постачальників з пагінацією та фільтрацією
  getSuppliers: async (params: { searchTerm?: string; pageNumber?: number; pageSize?: number } = {}): Promise<SupplierListResponse> => {
    const response = await axiosClient.get<SupplierListResponse>('/suppliers', { params });
    return response.data;
  },

  // Отримання постачальника за ID
  getSupplierById: async (id: number): Promise<Supplier> => {
    const response = await axiosClient.get<Supplier>(`/suppliers/${id}`);
    return response.data;
  },

  // Створення нового постачальника
  createSupplier: async (supplier: SupplierCreateRequest): Promise<number> => {
    const response = await axiosClient.post<{ id: number }>('/suppliers', supplier);
    return response.data.id;
  },

  // Оновлення існуючого постачальника
  updateSupplier: async (id: number, supplier: SupplierUpdateRequest): Promise<void> => {
    await axiosClient.put(`/suppliers/${id}`, supplier);
  },

  // Видалення постачальника
  deleteSupplier: async (id: number): Promise<boolean> => {
    const response = await axiosClient.delete(`/suppliers/${id}`);
    return response.status === 204;
  },

  // Отримання списку постачальників без пагінації (для форм)
  getSuppliersList: async (): Promise<Supplier[]> => {
    const response = await axiosClient.get<SupplierDTO[]>('/suppliers/list');
    // Перетворення SupplierID в supplierId для узгодження з інтерфейсом клієнту
    return Array.isArray(response.data) 
      ? response.data.map(supplier => ({
          ...supplier,
          supplierId: supplier.supplierID || supplier.SupplierID || 0,
        }))
      : [];
  }
};

export default supplierService; 