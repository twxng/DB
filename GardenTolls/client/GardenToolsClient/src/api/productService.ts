import axiosClient from './axiosClient';
import type { Product, PagedResult, ProductFilterParams, Category, Review } from '../types';
import type { ServerProduct } from '../types/index';

const logError = (error: any, context: string) => {
  console.error(`[ProductService] ${context}:`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    stack: error.stack
  });
};

class ProductServiceError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'ProductServiceError';
  }
}

const productService = {
  getProducts: async (params: ProductFilterParams = {}): Promise<PagedResult<Product>> => {
    try {
      const response = await axiosClient.get<PagedResult<ServerProduct>>('/products', { params });
      return {
        ...response.data,
        items: response.data.items.map(mapServerToClientProduct)
      };
    } catch (error: any) {
      logError(error, 'Помилка при отриманні списку товарів');
      throw new ProductServiceError(
        'Помилка при отриманні списку товарів: ' + (error.response?.data?.message || error.message),
        error.response?.status
      );
    }
  },

  getProductById: async (id: number): Promise<Product> => {
    try {
      const response = await axiosClient.get<ServerProduct>(`/products/${id}`);
      return mapServerToClientProduct(response.data);
    } catch (error: any) {
      logError(error, `Помилка при отриманні товару з ID ${id}`);
      throw new ProductServiceError(
        'Помилка при отриманні товару: ' + (error.response?.data?.message || error.message),
        error.response?.status
      );
    }
  },

  createProduct: async (product: Partial<Product>): Promise<Product> => {
    try {
      const productData = { ...product };
      
      if (product.imageFile instanceof File) {
        const base64Image = await convertFileToBase64(product.imageFile);
        productData.imageBase64 = base64Image;
        delete productData.imageFile;
      }
      
      const serverData = {
        productName: productData.name,
        categoryID: productData.categoryId,
        supplierID: productData.supplierId,
        description: productData.description,
        unitPrice: productData.price,
        weight: productData.weight,
        dimensions: productData.dimensions,
        sku: productData.sku,
        imageBase64: productData.imageBase64
      };
      
      const response = await axiosClient.post<ServerProduct>('/products', serverData);
      return mapServerToClientProduct(response.data);
    } catch (error: any) {
      logError(error, 'Помилка при створенні товару');
      throw new ProductServiceError(
        'Помилка при створенні товару: ' + (error.response?.data?.message || error.message),
        error.response?.status
      );
    }
  },

  updateProduct: async (id: number, product: Partial<Product>): Promise<Product> => {
    try {
      const productData = { ...product };
      
      if (product.imageFile instanceof File) {
        const base64Image = await convertFileToBase64(product.imageFile);
        productData.imageBase64 = base64Image;
        delete productData.imageFile;
      }
      
      const serverData = {
        productName: productData.name,
        categoryID: productData.categoryId,
        supplierID: productData.supplierId,
        description: productData.description,
        unitPrice: productData.price,
        weight: productData.weight,
        dimensions: productData.dimensions,
        sku: productData.sku,
        imageBase64: productData.imageBase64,
        isDiscontinued: productData.isDiscontinued
      };
      
      const response = await axiosClient.put<ServerProduct>(`/products/${id}`, serverData);
      
      // Перевірка наявності даних у відповіді
      if (!response.data) {
        // Якщо даних немає, отримуємо продукт окремим запитом
        const productResponse = await axiosClient.get<ServerProduct>(`/products/${id}`);
        return mapServerToClientProduct(productResponse.data);
      }
      
      return mapServerToClientProduct(response.data);
    } catch (error: any) {
      logError(error, `Помилка при оновленні товару з ID ${id}`);
      throw new ProductServiceError(
        'Помилка при оновленні товару: ' + (error.response?.data?.message || error.message),
        error.response?.status
      );
    }
  },

  deleteProduct: async (id: number): Promise<boolean> => {
    try {
      const response = await axiosClient.delete(`/products/${id}`);
      return response.status === 204;
    } catch (error: any) {
      logError(error, `Помилка при видаленні товару з ID ${id}`);
      throw new ProductServiceError(
        'Помилка при видаленні товару: ' + (error.response?.data?.message || error.message),
        error.response?.status
      );
    }
  },

  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await axiosClient.get<{categories: Category[], totalCount: number}>('/categories');
      // Повертаємо масив категорій з відповіді
      return response.data.categories || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  getCategoryById: async (id: number): Promise<Category> => {
    const response = await axiosClient.get<Category>(`/categories/${id}`);
    return response.data;
  },

  getProductReviews: async (productId: number): Promise<Review[]> => {
    const response = await axiosClient.get<Review[]>(`/products/${productId}/reviews`);
    return response.data;
  },

  getReviewsByProductId: async (productId: number): Promise<Review[]> => {
    const response = await axiosClient.get<Review[]>(`/reviews/product/${productId}`);
    return response.data;
  },

  addReview: async (review: { productID: number; userID: number; rating: number; comment: string; parentReviewID?: number }): Promise<Review> => {
    const response = await axiosClient.post<Review>(`/reviews`, review);
    return response.data;
  },

  getFeaturedProducts: async (count: number = 6): Promise<Product[]> => {
    const response = await axiosClient.get<Product[]>('/products/featured', {
      params: { count }
    });
    return response.data;
  },

  getNewArrivals: async (count: number = 6): Promise<Product[]> => {
    const response = await axiosClient.get<Product[]>('/products/new-arrivals', {
      params: { count }
    });
    return response.data;
  },

  getBestSellers: async (count: number = 6): Promise<Product[]> => {
    const response = await axiosClient.get<Product[]>('/products/best-sellers', {
      params: { count }
    });
    return response.data;
  }
};

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const mapServerToClientProduct = (serverProduct: ServerProduct): Product => {
  if (!serverProduct) {
    throw new Error('Отримано пустий об\'єкт товару від сервера');
  }

  // Базова валідація обов'язкових полів
  if (typeof serverProduct.productID !== 'number') {
    throw new Error('Відсутнє обов\'язкове поле productID у товарі');
  }

  return {
    productId: serverProduct.productID,
    name: serverProduct.productName?.trim() || '',
    categoryId: serverProduct.categoryID,
    supplierId: serverProduct.supplierID,
    supplierName: serverProduct.supplierName?.trim() || '',
    description: serverProduct.description?.trim(),
    price: serverProduct.unitPrice,
    weight: serverProduct.weight,
    dimensions: serverProduct.dimensions?.trim(),
    sku: serverProduct.sku?.trim() || '',
    imageBase64: serverProduct.imageBase64,
    createdAt: serverProduct.createdAt,
    updatedAt: serverProduct.updatedAt,
    isDiscontinued: Boolean(serverProduct.isDiscontinued),
    quantity: serverProduct.quantityInStock || 0,
    inStock: (serverProduct.quantityInStock || 0) > 0,
    category: serverProduct.categoryName?.trim() || '',
    averageRating: typeof serverProduct.averageRating === 'number' ? serverProduct.averageRating : null
  };
};

export default productService; 