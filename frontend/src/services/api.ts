import axios from 'axios';

// Cliente HTTP compartilhado para comunicar o frontend com a API do backend.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('portal_hormezinda_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
