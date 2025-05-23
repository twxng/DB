import type { Cart, CartItem, Product } from '../types';

// Отримання ключа для зберігання кошика у localStorage
const getCartStorageKey = (userId?: number): string => {
  return userId ? `garden_tools_cart_${userId}` : 'garden_tools_cart_guest';
};

// Отримання поточного користувача
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Отримання кошика з localStorage
const getCart = (): Cart => {
  const user = getCurrentUser();
  const cartData = localStorage.getItem(getCartStorageKey(user?.userId));
  if (cartData) {
    return JSON.parse(cartData) as Cart;
  }
  return { items: [], totalItems: 0, totalPrice: 0 };
};

// Збереження кошика в localStorage
const saveCart = (cart: Cart): void => {
  const user = getCurrentUser();
  localStorage.setItem(getCartStorageKey(user?.userId), JSON.stringify(cart));
};

// Перерахунок загальної кількості товарів та вартості
const recalculateCart = (items: CartItem[]): Cart => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);
  return { items, totalItems, totalPrice };
};

const cartService = {
  getCart: (): Cart => {
    return getCart();
  },

  addToCart: (product: Product, quantity: number = 1): Cart => {
    const cart = getCart();
    const existingItemIndex = cart.items.findIndex(item => item.productId === product.productId);

    if (existingItemIndex >= 0) {
      const existingItem = cart.items[existingItemIndex];
      const updatedItem = {
        ...existingItem,
        quantity: existingItem.quantity + quantity,
        totalPrice: (existingItem.quantity + quantity) * product.price
      };
      cart.items[existingItemIndex] = updatedItem;
    } else {
      const newItem: CartItem = {
        productId: product.productId,
        name: product.name,
        imageUrl: `data:image/jpeg;base64,${product.imageBase64}`, // Add data URL prefix
        unitPrice: product.price,
        quantity: quantity,
        totalPrice: quantity * product.price
      };
      cart.items.push(newItem);
    }

    const updatedCart = recalculateCart(cart.items);
    saveCart(updatedCart);
    return updatedCart;
  },

  updateQuantity: (productId: number, quantity: number): Cart => {
    const cart = getCart();
    const itemIndex = cart.items.findIndex(item => item.productId === productId);

    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // Якщо кількість 0 або менше, видаляємо товар
        cart.items.splice(itemIndex, 1);
      } else {
        // Інакше оновлюємо кількість
        const item = cart.items[itemIndex];
        cart.items[itemIndex] = {
          ...item,
          quantity: quantity,
          totalPrice: quantity * item.unitPrice
        };
      }

      const updatedCart = recalculateCart(cart.items);
      saveCart(updatedCart);
      return updatedCart;
    }
    
    return cart;
  },

  removeItem: (productId: number): Cart => {
    const cart = getCart();
    const updatedItems = cart.items.filter(item => item.productId !== productId);
    const updatedCart = recalculateCart(updatedItems);
    saveCart(updatedCart);
    return updatedCart;
  },

  clearCart: (): Cart => {
    const emptyCart: Cart = { items: [], totalItems: 0, totalPrice: 0 };
    saveCart(emptyCart);
    return emptyCart;
  },

  // Метод для перенесення кошика гостя до авторизованого користувача
  transferGuestCartToUser: (userId: number): void => {
    const guestCart = localStorage.getItem(getCartStorageKey());
    if (guestCart) {
      localStorage.setItem(getCartStorageKey(userId), guestCart);
      localStorage.removeItem(getCartStorageKey());
    }
  }
};

export default cartService;