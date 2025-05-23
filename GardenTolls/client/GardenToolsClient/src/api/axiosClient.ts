import axios from 'axios';

const API_URL = 'http://localhost:5192/api';

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Додаємо інтерсептор для додавання JWT токену до запитів
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      console.log('Using token:', token);
      console.log('Authorization header:', config.headers.Authorization);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Додаємо інтерсептор для обробки помилок
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Виводимо детальну інформацію про помилку
    console.error('Response error:', error);
    
    // Якщо помилка 401 (Unauthorized), перенаправляємо на сторінку входу
    if (error.response && error.response.status === 401) {
      console.error('401 Unauthorized error. Details:', error.response.data);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient; 