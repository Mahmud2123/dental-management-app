// src/api/auth.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);
  return response.data;
};

export const verifyToken = async (token) => {
  const response = await axios.get(`${API_URL}/auth/verify`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};