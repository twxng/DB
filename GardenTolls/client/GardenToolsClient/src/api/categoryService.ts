import axiosClient from './axiosClient';
import type { Category } from '../types';

interface CategoryListResponseDto {
  categories: Category[];
  totalCount: number;
}

interface CategoryToggleResponse {
  isActive: boolean;
}

const categoryService = {
  // Отримання всіх категорій
  getCategories: async (): Promise<CategoryListResponseDto> => {
    const response = await axiosClient.get<CategoryListResponseDto>('/Categories');
    return response.data;
  },

  // Отримання категорії за ID
  getCategoryById: async (id: number): Promise<Category> => {
    const response = await axiosClient.get<Category>(`/Categories/${id}`);
    return response.data;
  },

  // Створення нової категорії
  createCategory: async (category: Omit<Category, 'categoryId' | 'createdAt'>): Promise<Category> => {
    const response = await axiosClient.post<Category>('/Categories', category);
    return response.data;
  },

  // Оновлення категорії
  updateCategory: async (id: number, category: Omit<Category, 'categoryId' | 'createdAt'>): Promise<void> => {
    await axiosClient.put(`/Categories/${id}`, category);
  },

  // Видалення категорії
  deleteCategory: async (id: number): Promise<void> => {
    await axiosClient.delete(`/Categories/${id}`);
  },

  // Зміна активності категорії
  toggleCategoryActive: async (id: number): Promise<CategoryToggleResponse> => {
    const response = await axiosClient.patch<CategoryToggleResponse>(`/Categories/${id}/toggle-active`);
    return response.data;
  },
  
  // Отримання підкатегорій за батьківським ID
  getSubcategories: async (parentId: number): Promise<CategoryListResponseDto> => {
    const response = await axiosClient.get<CategoryListResponseDto>(`/Categories/${parentId}/subcategories`);
    return response.data;
  }
};

export default categoryService; 