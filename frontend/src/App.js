import React, { useState, useEffect, useCallback } from 'react';
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
import Appointments from './pages/Appointments'; // Fixed: plural
import { authAPI } from './services/api';

const DentalManagementApp = () => {
  const [currentView, setCurrentView] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [user, setUser] = useState(null);

  // Check auth status on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const data = await authAPI.verify();
          setIsLoggedIn(true);
          setUser(data.user);
          setCurrentView('dashboard');
        } catch (error) {
          localStorage.removeItem('token');
          console.error('Auth verification failed:', error);
        }
      }
      setIsLoading(false);
    };
    verifyAuth();
  }, []);

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Navigation handler with sidebar auto-close on mobile
  const navigateTo = useCallback((view) => {
    setCurrentView(view);
    setSidebarOpen(false); // Auto-close sidebar on mobile navigation
    window.scrollTo(0, 0); // Scroll to top on view change
  }, []);

  const handleLogin = useCallback((userData, token) => {
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
    setUser(userData);
    setCurrentView('dashboard');
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    setSelectedPatient(null);
    setCurrentView('login');
    setSidebarOpen(false);
  }, []);

  // Centralized view configuration
  const viewConfig = {
    dashboard: { title: 'Dashboard', component: Dashboard },
    patients: { title: 'Patient Records', component: Patients },
    'add-patient': { title: 'Add New Patient', component: AddPatient },
    'view-patient': { title: 'Patient Details', component: ViewPatient },
    treatments: { title: 'Treatment Records', component: Treatments },
    payments: { title: 'Billing & Payments', component: Billing },
    appointments: { title: 'Appointments', component: Appointments },
    search: { title: 'Search Records', component: Search },
    reports: { title: 'Reports', component: Reports },
  };

  const getViewTitle = () => viewConfig[currentView]?.title || 'Dashboard';

  const renderCurrentView = () => {
    const config = viewConfig[currentView];
    if (!config) return <Dashboard setCurrentView={navigateTo} />;

    const Component = config.component;
    const commonProps = { setCurrentView: navigateTo };

    // Add specific props based on view
    switch (currentView) {
      case 'view-patient':
        return <Component {...commonProps} patient={selectedPatient} />;
      case 'patients':
      case 'search':
        return <Component {...commonProps} setSelectedPatient={setSelectedPatient} />;
      default:
        return <Component {...commonProps} />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={navigateTo} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
        user={user}
      />
      
      <div className="lg:ml-64 min-h-screen transition-all duration-300">
        <Header 
          title={getViewTitle()} 
          currentTime={currentTime} 
          setSidebarOpen={setSidebarOpen} 
          user={user}
        />
        
        <main className="p-4 lg:p-6 max-w-7xl mx-auto">
          <div className="animate-fadeIn">
            {renderCurrentView()}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity" 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default DentalManagementApp;
