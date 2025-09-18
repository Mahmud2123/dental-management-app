import React from 'react';
import { Menu, User } from 'lucide-react';

const Header = ({ title, currentTime, setSidebarOpen, user }) => {
  return (
    <div className="bg-white/80 backdrop-blur-lg border-b border-slate-200/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-600 hover:text-slate-900"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-sm text-slate-600">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-lg font-semibold text-slate-800">
              {currentTime.toLocaleTimeString('en-US', { hour12: true })}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-800">{user?.username}</p>
              <p className="text-xs text-slate-600 capitalize">{user?.role}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;