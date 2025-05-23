import axiosClient from './axiosClient';
import type { User } from '../types';

interface UserListResponseDto {
  users: User[];
  totalCount: number;
}

interface BlockResponseDto {
  message: string;
  isActive: boolean;
}

interface DeleteResponseDto {
  message: string;
}

const userService = {
  // Отримання всіх користувачів
  getUsers: async (): Promise<UserListResponseDto> => {
    const response = await axiosClient.get<UserListResponseDto>('/Users');
    return response.data;
  },

  // Отримання користувача за ID
  getUserById: async (id: number): Promise<User> => {
    const response = await axiosClient.get<User>(`/Users/${id}`);
    return response.data;
  },

  // Зміна активності користувача
  toggleUserActive: async (id: number): Promise<{ isActive: boolean }> => {
    const response = await axiosClient.patch<{ isActive: boolean }>(`/Users/${id}/toggle-active`);
    return response.data;
  },

  // Видалення користувача
  deleteUser: async (id: number): Promise<DeleteResponseDto> => {
    const response = await axiosClient.delete<DeleteResponseDto>(`/Users/${id}`);
    return response.data;
  },

  // Блокування користувача
  blockUser: async (id: number): Promise<BlockResponseDto> => {
    const response = await axiosClient.patch<BlockResponseDto>(`/Users/${id}/block`);
    return response.data;
  },

  // Розблокування користувача
  unblockUser: async (id: number): Promise<BlockResponseDto> => {
    const response = await axiosClient.patch<BlockResponseDto>(`/Users/${id}/unblock`);
    return response.data;
  },

};

export default userService; 