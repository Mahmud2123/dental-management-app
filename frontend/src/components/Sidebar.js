import React from 'react';
import { 
  Activity, Users, Plus, FileText, CreditCard, Search, TrendingUp, X, Calendar 
} from 'lucide-react';

const Sidebar = ({ currentView, setCurrentView, sidebarOpen, setSidebarOpen, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'patients', label: 'Patient Records', icon: Users },
    { id: 'add-patient', label: 'Add Patient', icon: Plus },
    { id: 'treatments', label: 'Treatments', icon: FileText },
    { id: 'appointments', label: 'Appointments', icon: Calendar }, // Added Appointments menu item
    { id: 'payments', label: 'Billing', icon: CreditCard },
    { id: 'search', label: 'Search Records', icon: Search },
    { id: 'reports', label: 'Reports', icon: TrendingUp }
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 lg:translate-x-0`}>
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold">Dental Care</h2>
              <p className="text-slate-400 text-sm">Management</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              setCurrentView(item.id);
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              currentView === item.id 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <button 
          onClick={onLogout}
          className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-xl transition-all"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;