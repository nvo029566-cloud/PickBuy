import axios from 'axios';

// Instance axios riêng để tự động đính kèm token đăng nhập vào mỗi request
const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('pickbuy_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;