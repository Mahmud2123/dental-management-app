import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';   // or App.js if you renamed
import { AuthProvider } from './contexts/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <DentalManagementApp />
    </AuthProvider>
  </React.StrictMode>
);
