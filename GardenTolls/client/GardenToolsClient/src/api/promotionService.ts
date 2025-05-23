import axiosClient from './axiosClient';

// Інтерфейс для акційного товару
export interface PromotionProduct {
  productID: number;
  productName: string;
  originalPrice: number;
  discountPercentage: number;
  discountedPrice: number;
  imageURL: string | null;
  promotionID?: number;
  promotionName?: string;
}

// Інтерфейс для акції
export interface Promotion {
  promotionID: number;
  supplierID: number;
  supplierName: string;
  startDate: string;
  endDate: string;
  description: string | null;
  promotionName: string;
  productCount: number;
}

// Сервіс для роботи з акціями
const promotionService = {
  // Отримання всіх активних акцій
  getActivePromotions: async (): Promise<Promotion[]> => {
    try {
      const response = await axiosClient.get<Promotion[]>('/promotions');
      return response.data;
    } catch (error) {
      console.error('Помилка при отриманні акцій:', error);
      return [];
    }
  },

  // Отримання акційних товарів за ID акції
  getPromotionProducts: async (promotionId: number): Promise<PromotionProduct[]> => {
    try {
      const response = await axiosClient.get<PromotionProduct[]>(`/promotions/${promotionId}/products`);
      return response.data;
    } catch (error) {
      console.error(`Помилка при отриманні товарів для акції ${promotionId}:`, error);
      return [];
    }
  },

  // Отримання акційних товарів від конкретного постачальника
  getPromotionProductsBySupplier: async (supplierId: number, count: number = 3): Promise<PromotionProduct[]> => {
    try {
      const response = await axiosClient.get<PromotionProduct[]>(`/promotions/supplier/${supplierId}`, {
        params: { count }
      });
      return response.data;
    } catch (error) {
      console.error(`Помилка при отриманні акційних товарів постачальника ${supplierId}:`, error);
      return [];
    }
  }
};

export default promotionService; 