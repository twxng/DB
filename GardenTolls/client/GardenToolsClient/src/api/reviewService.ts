import axiosClient from './axiosClient';
import type { Review } from '../types';

const reviewService = {
  getReviewsByProductId: async (productId: number): Promise<Review[]> => {
    try {
      console.log('Запит на отримання відгуків для продукту:', productId);
      const response = await axiosClient.get<Review[]>(`/reviews/product/${productId}`);
      console.log('Відповідь сервера:', response.data);
      return response.data;
    } catch (error) {
      console.error('Помилка при отриманні відгуків:', error);
      return [];
    }
  },

  addReview: async (review: {
    productId: number;
    userId: number;
    rating?: number;
    comment: string;
    parentReviewId?: number;
  }): Promise<Review> => {
    try {
      const reviewData = {
        ProductID: review.productId,
        UserID: review.userId,
        Rating: review.rating,
        Comment: review.comment,
        ParentReviewID: review.parentReviewId
      };
      
      console.log('Відправка відгуку на сервер:', reviewData);
      const response = await axiosClient.post<Review>('/reviews', reviewData);
      console.log('Відповідь сервера на додавання відгуку:', response.data);
      return response.data;
    } catch (error) {
      console.error('Помилка при додаванні відгуку:', error);
      throw error;
    }
  },

  addReply: async (reply: {
    productId: number;
    userId: number;
    comment: string;
    parentReviewId: number;
    rating?: number;
  }): Promise<Review> => {
    try {
      console.log('Отримані дані для відповіді:', reply);
      
      const replyData = {
        ProductID: reply.productId,
        UserID: reply.userId,
        Comment: reply.comment,
        ParentReviewID: reply.parentReviewId,
        Rating: reply.rating ?? 0
      };
      
      console.log('Відправка відповіді на сервер:', replyData);
      const response = await axiosClient.post<Review>('/reviews/reply', replyData);
      console.log('Відповідь сервера на додавання відповіді:', response.data);
      return response.data;
    } catch (error) {
      console.error('Помилка при додаванні відповіді:', error);
      if (error.response) {
        console.error('Деталі помилки:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      throw error;
    }
  }
};

export default reviewService; 