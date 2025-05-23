


export interface RegisterDto {
	Username: string;
	Email: string;
	Password: string;
	ConfirmPassword: string;
	FirstName?: string;
	LastName?: string;
	Phone?: string;
}

export interface LoginDto {
	Email: string;
	Password: string;
}

export interface AuthResponseDto {
	isSuccess: boolean;
	message?: string;
	token?: string;
	expiration?: string;
	user?: UserDto;
}

export interface UserDto {
	userId: number;
	username: string;
	email: string;
	role: string;
	firstName?: string;
	lastName?: string;
}


export interface Product {
	productID: number;
	productName: string;
	categoryID: number;
	categoryName: string;
	supplierID: number;
	supplierName: string;
	description: string;
	unitPrice: number;
	weight: number | null;
	dimensions: string | null;
	sku: string;
	imageBase64: string | null;
	createdAt: string;
	updatedAt: string | null;
	isDiscontinued: boolean;
	quantityInStock: number;
	averageRating: number | null;
}

export interface Category {
	categoryId: number;
	name: string;
	description?: string;
	parentCategoryId?: number;
	createdAt: string;
	isActive: boolean;
	imageUrl: string;
}

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
	isActive: boolean;
	createdAt: string;
}


export interface Order {
	orderID: number;
	customerID: number;
	customerName: string;
	orderDate: string;
	shippedDate?: string;
	deliveryDate?: string;
	status: string;
	paymentMethod: string;
	paymentStatus: string;
	totalAmount: number;
	shippingAddress: string;
	shippingCity: string;
	shippingCountry: string;
	shippingPostalCode?: string;
	notes?: string;
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


export interface Review {
	reviewId: number;
	productId: number;
	userId: number;
	rating: number;
	comment: string;
	reviewDate: string;
	isVerifiedPurchase: boolean;
	isApproved: boolean;
	parentReviewId: number | null;
	replies?: Review[];
}


export interface CartItem {
	productId: number;
	name: string;
	imageUrl: string;
	unitPrice: number;
	quantity: number;
	totalPrice: number;
}

export interface Cart {
	items: CartItem[];
	totalItems: number;
	totalPrice: number;
}


export interface PagedResult<T> {
	items: T[];
	pageNumber: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
	hasPreviousPage: boolean;
	hasNextPage: boolean;
}

export interface ProductFilterParams {
	pageNumber?: number;
	pageSize?: number;
	searchTerm?: string;
	categoryID?: number;
	supplierID?: number;
	minPrice?: number;
	maxPrice?: number;
	inStock?: boolean;
	sortBy?: string;
	sortDescending?: boolean;
}

export interface ServerProduct {
	productID: number;
	productName: string;
	categoryID: number;
	categoryName?: string;
	supplierID: number;
	supplierName?: string;
	description?: string;
	unitPrice: number;
	weight?: number;
	dimensions?: string;
	sku: string;
	imageBase64?: string;
	createdAt: string;
	updatedAt?: string;
	isDiscontinued: boolean;
	quantityInStock?: number;
	averageRating?: number;
}

export interface OrderFormData {
	shippingAddress: string;
	shippingCity: string;
	shippingCountry: string;
	shippingPostalCode: string;
	paymentMethod: string;
	notes?: string;
	orderDetails: {
		productID: number;
		quantity: number;
	}[];
}

export interface User {
	userId: number;
	username: string;
	fullName: string;
	email: string;
	phone: string;
	role: string;
	isActive: boolean;
	registrationDate: string;
	orderCount: number;
	hasActiveOrders: boolean;
}