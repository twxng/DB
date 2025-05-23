// Типи для користувачів
export interface User {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  isActive: boolean;
  registrationDate: string;
  lastLoginDate: string | null;
  orderCount: number;
}

// Інтерфейс для профілю користувача
export interface UserProfileDto {
  userId: number;
  username: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  registrationDate: string;
  lastLoginDate?: string;
}

// Інтерфейс для оновлення профілю
export interface UpdateUserProfileDto {
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

// Інтерфейс для відповіді API
export interface UserListResponseDto {
  users: User[];
  totalCount: number;
}

// Типи для продуктів
export interface Product {
  productId: number;
  name: string;
  description: string;
  price: number; // unitPrice
  unitPrice?: number;
  imageBase64?: string; // Для зберігання зображення у форматі Base64
  imageFile?: File; // Для локального зберігання файлу зображення при завантаженні
  category: string; // categoryName
  categoryName?: string;
  categoryId?: number;
  supplierId?: number;
  supplierName?: string;
  sku?: string;
  weight?: number;
  dimensions?: string;
  inStock: boolean;
  quantity: number; // quantityInStock
  isDiscontinued?: boolean;
  createdAt?: string;
  updatedAt?: string;
  averageRating?: number;
  reviewCount?: number;
  reviewsCount?: number;
  discountPercentage?: number;
}

// Фільтр для пошуку товарів
export interface ProductFilterParams {
  searchTerm?: string;
  categoryID?: number;
  supplierID?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: string;
  sortDescending?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

// Пагінований результат
export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Типи для відгуків
export interface Review {
  reviewID: number;
  productId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  reviewDate: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  parentReviewId: number | null;
  replies?: Review[];
}

// Типи для замовлень
export interface Order {
  orderID: number;
  customerID: number;
  customerName: string;
  orderDate: string;
  shippedDate: string | null;
  deliveryDate: string | null;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  shippingAddress: string;
  shippingCity: string;
  shippingCountry: string;
  shippingPostalCode: string | null;
  notes: string | null;
  orderDetails: OrderDetail[];
}

export interface OrderDetail {
  orderDetailID: number;
  orderID: number;
  productID: number;
  productName: string;
  imageBase64?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  lineTotal: number;
}

// Типи для категорій
export interface Category {
  categoryId: number;
  name: string;
  description?: string;
  parentCategoryId?: number;
  createdAt: string;
  isActive: boolean;
}

// Типи для постачальників
export interface Supplier {
  supplierId: number;
  companyName: string;
  contactPerson?: string | null;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string | null;
  website?: string | null;
  createdAt: string;
  isActive: boolean;
} 