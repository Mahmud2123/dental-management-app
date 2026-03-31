import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './contexts/AuthContext';
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
import Appointments from './pages/Appointment';

const DentalManagementApp = () => {
  const { user, loading: authLoading, login, logout } = useAuth();

  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Clock - memoized to prevent unnecessary updates
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navigateTo = useCallback((view) => {
    setCurrentView(view);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleLogin = useCallback((userData, token) => {
    login(userData, token);
    setCurrentView('dashboard');
  }, [login]);

  const handleLogout = useCallback(() => {
    logout();
    setSelectedPatient(null);
    setCurrentView('login');
    setSidebarOpen(false);
  }, [logout]);

  // Memoized view configuration
  const viewConfig = useMemo(() => ({
    dashboard: { title: 'Dashboard', component: Dashboard },
    patients: { title: 'Patient Records', component: Patients },
    'add-patient': { title: 'Add New Patient', component: AddPatient },
    'view-patient': { title: 'Patient Details', component: ViewPatient },
    treatments: { title: 'Treatment Records', component: Treatments },
    payments: { title: 'Billing & Payments', component: Billing },
    appointments: { title: 'Appointments', component: Appointments },
    search: { title: 'Search Records', component: Search },
    reports: { title: 'Reports', component: Reports },
  }), []);

  const getViewTitle = useCallback(() => 
    viewConfig[currentView]?.title || 'Dashboard', 
  [currentView, viewConfig]);

  // Memoized view renderer for performance
  const renderCurrentView = useMemo(() => {
    const config = viewConfig[currentView];
    if (!config) return <Dashboard setCurrentView={navigateTo} />;

    const Component = config.component;
    const commonProps = { setCurrentView: navigateTo };

    switch (currentView) {
      case 'view-patient':
        return <Component {...commonProps} patient={selectedPatient} />;
      case 'patients':
      case 'search':
        return <Component {...commonProps} setSelectedPatient={setSelectedPatient} />;
      default:
        return <Component {...commonProps} />;
    }
  }, [currentView, viewConfig, navigateTo, selectedPatient]);

  // Loading state with improved UI
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-medical-200 rounded-full animate-spin border-t-medical-600" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-pulse" />
          </div>
          <p className="text-calm-500 font-medium animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={navigateTo} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
        user={user}
      />
      
      <div className="lg:ml-72 min-h-screen transition-all duration-300 ease-smooth">
        <Header 
          title={getViewTitle()} 
          currentTime={currentTime} 
          setSidebarOpen={setSidebarOpen} 
          user={user}
        />
        
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          <div className="animate-fade-in">
            {renderCurrentView}
          </div>
        </main>
      </div>

      {/* Mobile Overlay - improved with blur */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default React.memo(DentalManagementApp);
