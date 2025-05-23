import axiosClient from './axiosClient';
import type { LoginDto, RegisterDto, AuthResponseDto, UserDto, UserProfileDto, UpdateUserProfileDto } from '../types/index';
import cartService from './cartService';

const authService = {
  register: async (userData: RegisterDto): Promise<AuthResponseDto> => {
    try {
      // Переконуємося, що всі поля відповідають формату API ендпоінту
      const registerData = {
        Username: userData.Username,
        Email: userData.Email,
        Password: userData.Password,
        ConfirmPassword: userData.ConfirmPassword,
        FirstName: userData.FirstName || '',
        LastName: userData.LastName || '',
        Phone: userData.Phone || ''
      };
      
      // Логування даних (без паролів)
      console.log('Відправка даних для реєстрації:', {
        Username: registerData.Username,
        Email: registerData.Email,
        FirstName: registerData.FirstName,
        LastName: registerData.LastName,
        Phone: registerData.Phone,
        // Не логуємо паролі з міркувань безпеки
        hasPassword: !!registerData.Password,
        hasConfirmPassword: !!registerData.ConfirmPassword
      });
      
      // Відправляємо запит з форматованими даними
      const response = await axiosClient.post<AuthResponseDto>('/auth/register', registerData);
      
      console.log('Відповідь сервера на реєстрацію:', {
        isSuccess: response.data.isSuccess,
        message: response.data.message,
        hasToken: !!response.data.token,
        userReceived: !!response.data.user,
      });
      
      // Якщо реєстрація успішна, зберігаємо токен та дані користувача
      if (response.data.isSuccess && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Переносимо кошик гостя до авторизованого користувача
        if (response.data.user?.userId) {
          cartService.transferGuestCartToUser(response.data.user.userId);
        }
      }
      
      return response.data;
    } catch (error: unknown) {
      console.error('Register error details:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: any };
        if (err.response) {
          console.error('Response data:', err.response.data);
          console.error('Response status:', err.response.status);
          console.error('Response headers:', err.response.headers);
        }
      }
      throw error;
    }
  },

  login: async (credentials: LoginDto): Promise<AuthResponseDto> => {
    try {
      // Переконуємося, що дані запиту відповідають очікуваному формату
      console.log('Login request payload:', {
        Email: credentials.Email,
        hasPassword: !!credentials.Password
      });
      
      const response = await axiosClient.post<AuthResponseDto>('/auth/login', credentials);
      console.log('Login response:', response.data);
      
      if (response.data.isSuccess && response.data.token) {
        // Зберігаємо токен та дані користувача
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Переносимо кошик гостя до авторизованого користувача
        if (response.data.user?.userId) {
          cartService.transferGuestCartToUser(response.data.user.userId);
        }
      }
      
      return response.data;
    } catch (error: unknown) {
      console.error('Login error details:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: any, request?: any, message?: string };
        if (err.response) {
          console.error('Response data:', err.response.data);
          console.error('Response status:', err.response.status);
          console.error('Response headers:', err.response.headers);
        } else if (err.request) {
          console.error('No response received', err.request);
        } else if (err.message) {
          console.error('Error setting up request', err.message);
        }
      }
      throw error;
    }
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser: (): UserDto | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr) as UserDto;
      } catch (error: any) {
        console.error('Error parsing user data:', error);
        // Якщо є помилка при парсінгу, очищаємо локальне сховище
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    return localStorage.getItem('token') !== null;
  },

  isAdmin: (): boolean => {
    const user = authService.getCurrentUser();
    return user?.role === 'Admin';
  },

  // Функція для перевірки чи токен валідний
  validateToken: async (): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      // Спробуємо зробити запит, який потребує авторизації
      await axiosClient.get('/auth/validate-token');
      return true;
    } catch (error: any) {
      console.error('Token validation error:', error);
      // Якщо токен невалідний, виконуємо вихід з системи
      if (error.response && error.response.status === 401) {
        authService.logout();
      }
      return false;
    }
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await axiosClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword: newPassword
      });
      return response.status === 200;
    } catch (error: any) {
      console.error('Change password error:', error);
      return false;
    }
  },

  getUserProfile: async (): Promise<UserDto> => {
    try {
      const response = await axiosClient.get<UserDto>('/auth/me');
      return response.data;
    } catch (error: any) {
      console.error('Get user profile error:', error);
      throw error;
    }
  },

  getFullUserProfile: async (): Promise<UserProfileDto> => {
    try {
      const response = await axiosClient.get<UserProfileDto>('/auth/profile');
      return response.data;
    } catch (error: any) {
      console.error('Get full user profile error:', error);
      throw error;
    }
  },

  updateUserProfile: async (profileData: UpdateUserProfileDto): Promise<boolean> => {
    try {
      const response = await axiosClient.put('/auth/update-profile', profileData);
      
      // При успішному оновленні, оновлюємо також дані в локальному сховищі
      if (response.status === 200) {
        const user = authService.getCurrentUser();
        if (user) {
          // Оновлюємо тільки ті поля, які були змінені
          const updatedUser = { 
            ...user,
            ...(profileData.firstName !== undefined && { firstName: profileData.firstName }),
            ...(profileData.lastName !== undefined && { lastName: profileData.lastName }),
            ...(profileData.username !== undefined && { username: profileData.username })
          };
          
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Update user profile error:', error);
      return false;
    }
  }
};

export default authService; 