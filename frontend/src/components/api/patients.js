// src/api/patients.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const getPatients = async (token) => {
  const response = await axios.get(`${API_URL}/patients`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createPatient = async (patient, token) => {
  const response = await axios.post(`${API_URL}/patients`, patient, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Add other patient CRUD operations...