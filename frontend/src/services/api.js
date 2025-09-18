const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
};

// Auth API
export const authAPI = {
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  verify: () => apiRequest('/auth/verify'),
};

// Patients API
export const patientsAPI = {
  getAll: () => apiRequest('/patients'),
  getById: (id) => apiRequest(`/patients/${id}`),
  create: (patient) => apiRequest('/patients', {
    method: 'POST',
    body: JSON.stringify(patient),
  }),
  update: (id, patient) => apiRequest(`/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patient),
  }),
  delete: (id) => apiRequest(`/patients/${id}`, {
    method: 'DELETE',
  }),
  search: (query) => apiRequest(`/patients/search/${query}`),
};

// Treatments API
export const treatmentsAPI = {
  getAll: () => apiRequest('/treatments'),
  getByPatientId: (patientId) => apiRequest(`/treatments/patient/${patientId}`),
  create: (treatment) => apiRequest('/treatments', {
    method: 'POST',
    body: JSON.stringify(treatment),
  }),
  update: (id, treatment) => apiRequest(`/treatments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(treatment),
  }),
  delete: (id) => apiRequest(`/treatments/${id}`, {
    method: 'DELETE',
  }),
};

// Payments API
export const paymentsAPI = {
  getAll: () => apiRequest('/payments'),
  getByPatientId: (patientId) => apiRequest(`/payments/patient/${patientId}`),
  create: (payment) => apiRequest('/payments', {
    method: 'POST',
    body: JSON.stringify(payment),
  }),
  update: (id, payment) => apiRequest(`/payments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payment),
  }),
  delete: (id) => apiRequest(`/payments/${id}`, {
    method: 'DELETE',
  }),
};

// Appointments API
export const appointmentsAPI = {
  getAll: () => apiRequest('/appointments'),
  getByPatientId: (patientId) => apiRequest(`/appointments/patient/${patientId}`),
  create: (appointment) => apiRequest('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointment),
  }),
  update: (id, appointment) => apiRequest(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(appointment),
  }),
  delete: (id) => apiRequest(`/appointments/${id}`, {
    method: 'DELETE',
  }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => apiRequest('/dashboard/stats'),
};

// Reports API
export const reportsAPI = {
  patients: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiRequest(`/reports/patients?${params.toString()}`);
  },
  treatments: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiRequest(`/reports/treatments?${params.toString()}`);
  },
  payments: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiRequest(`/reports/payments?${params.toString()}`);
  },
  appointments: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiRequest(`/reports/appointments?${params.toString()}`);
  },
};