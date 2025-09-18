import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import AddPatient from './pages/AddPatient';
import ViewPatient from './pages/ViewPatient';
import Treatments from './pages/Treatments';
import Billing from './pages/Billing';
import Search from './pages/Search';
import Reports from './pages/Reports';
import Appointments from './pages/Appointment'; // Added import for Appointments
import { authAPI } from './services/api';

const DentalManagementApp = () => {
  const [currentView, setCurrentView] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [user, setUser] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.verify()
        .then((data) => {
          setIsLoggedIn(true);
          setUser(data.user);
          setCurrentView('dashboard');
        })
        .catch(() => {
          localStorage.removeItem('token');
        });
    }
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    setCurrentView('login');
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard';
      case 'patients': return 'Patient Records';
      case 'add-patient': return 'Add New Patient';
      case 'view-patient': return 'Patient Details';
      case 'treatments': return 'Treatment Records';
      case 'payments': return 'Billing & Payments';
      case 'appointments': return 'Appointments'; // Added title for appointments
      case 'search': return 'Search Records';
      case 'reports': return 'Reports';
      default: return 'Dashboard';
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard setCurrentView={setCurrentView} />; // Passed setCurrentView to Dashboard
      case 'patients': return <Patients setCurrentView={setCurrentView} setSelectedPatient={setSelectedPatient} />;
      case 'add-patient': return <AddPatient setCurrentView={setCurrentView} />;
      case 'view-patient': return <ViewPatient patient={selectedPatient} setCurrentView={setCurrentView} />;
      case 'treatments': return <Treatments setCurrentView={setCurrentView} />;
      case 'payments': return <Billing setCurrentView={setCurrentView} />;
      case 'appointments': return <Appointments setCurrentView={setCurrentView} />; // Added case for appointments
      case 'search': return <Search setCurrentView={setCurrentView} setSelectedPatient={setSelectedPatient} />;
      case 'reports': return <Reports />;
      default: return <Dashboard setCurrentView={setCurrentView} />;
    }
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />
      <div className="lg:ml-64 min-h-screen">
        <Header 
          title={getViewTitle()} 
          currentTime={currentTime} 
          setSidebarOpen={setSidebarOpen} 
          user={user}
        />
        <main className="p-6">
          {renderCurrentView()}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DentalManagementApp;