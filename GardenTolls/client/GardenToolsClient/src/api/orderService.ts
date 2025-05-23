import axios from 'axios';

const API_URL = 'http://localhost:5192/api';

export interface OrderCreateDto {
  paymentMethod: string;
  shippingAddress: string;
  shippingCity: string;
  shippingCountry: string;
  shippingPostalCode: string;
  notes: string;
  orderDetails: {
    productID: number;
    quantity: number;
  }[];
}

export interface OrderFilterDto {
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

class OrderService {
  async createOrder(orderData: OrderCreateDto) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/orders`, orderData, {
        headers: {
          'accept': 'text/plain',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Помилка при створенні замовлення');
    }
  }

  async getOrder(orderId: number) {
    try {
      console.log(`Requesting order with ID: ${orderId}`);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Response from server:', response);
      return response.data;
    } catch (error) {
      console.error('Error in getOrder:', error);
      if (axios.isAxiosError(error)) {
        console.log('Response status:', error.response?.status);
        console.log('Response data:', error.response?.data);
        
        if (error.response?.status === 404) {
          throw new Error(error.response.data.message || 'Замовлення не знайдено');
        }
      }
      throw new Error('Помилка при отриманні замовлення');
    }
  }

  async getOrderReceipt(orderId: number) {
    try {
      console.log(`Requesting order receipt with ID: ${orderId}`);
      const response = await axios.get(`${API_URL}/orders/receipt/${orderId}`, {
        headers: {
          'accept': 'text/plain'
        }
      });
      console.log('Receipt response from server:', response);
      return response.data;
    } catch (error) {
      console.error('Error in getOrderReceipt:', error);
      if (axios.isAxiosError(error)) {
        console.log('Response status:', error.response?.status);
        console.log('Response data:', error.response?.data);
        
        if (error.response?.status === 404) {
          throw new Error(error.response.data.message || 'Чек замовлення не знайдено');
        }
      }
      throw new Error('Помилка при отриманні чеку замовлення');
    }
  }

  async getUserOrders(filter?: OrderFilterDto) {
    try {
      const token = localStorage.getItem('token');
      
      // Підготовка параметрів запиту
      const params = new URLSearchParams();
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }
      
      const response = await axios.get(`${API_URL}/orders`, {
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${token}`
        },
        params
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw new Error('Помилка при отриманні замовлень користувача');
    }
  }

  async getMyOrders(filter?: OrderFilterDto) {
    try {
      const token = localStorage.getItem('token');
      
      // Підготовка параметрів запиту
      const params = new URLSearchParams();
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }
      
      const response = await axios.get(`${API_URL}/orders/my-orders`, {
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${token}`
        },
        params
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching my orders:', error);
      throw new Error('Помилка при отриманні особистих замовлень');
    }
  }

  async cancelOrder(orderId: number) {
    try {
      const token = localStorage.getItem('token');
      console.log(`Спроба скасувати замовлення #${orderId}`);
      console.log(`Токен авторизації: ${token ? 'Присутній' : 'Відсутній'}`);
      
      const response = await axios.post(`${API_URL}/orders/${orderId}/cancel`, {}, {
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Відповідь сервера при скасуванні замовлення:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      
      if (axios.isAxiosError(error)) {
        console.log('Статус помилки:', error.response?.status);
        console.log('Дані помилки:', error.response?.data);
        
        const errorMessage = error.response?.data?.message || 'Помилка при скасуванні замовлення';
        console.log('Повідомлення про помилку:', errorMessage);
        throw new Error(errorMessage);
      }
      
      throw new Error('Помилка при скасуванні замовлення. Спробуйте пізніше.');
    }
  }
}

export default new OrderService();