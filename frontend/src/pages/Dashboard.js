import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Users, FileText, Calendar, CreditCard, Eye, Plus, Search, 
  BarChart3, TrendingUp, Clock, Activity, Heart, Shield, Star, 
  ArrowUp, ArrowDown, ChevronRight 
} from 'lucide-react';
import { dashboardAPI } from '../services/api';

const ModernDentalDashboard = ({ setCurrentView }) => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalTreatments: 0,
    totalRevenue: 0,
    recentPatients: [],
    recentPayments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await dashboardAPI.getStats();
      
      setStats({
        totalPatients: data.totalPatients || 0,
        totalTreatments: data.totalTreatments || 0,
        totalRevenue: data.totalRevenue || 0,
        recentPatients: (data.recentPatients || []).map(p => ({ ...p, status: 'completed' })),
        recentPayments: (data.recentPayments || []).map(payment => ({
          ...payment,
          method: payment.payment_method || 'Cash'
        })),
      });
    } catch (err) {
      setError(err.message);
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Memoized Stat Card to prevent re-renders
  const StatCard = React.memo(({ icon: Icon, title, value, change, bgGradient, iconBg }) => (
    <div className={`relative group bg-gradient-to-br ${bgGradient} rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-white/20 w-full`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-16 h-16 ${iconBg} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
            <Icon className="w-8 h-8 text-white drop-shadow-sm" />
          </div>
          {change !== undefined && (
            <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
              {change > 0 ? <ArrowUp className="w-4 h-4 text-green-300" /> : <ArrowDown className="w-4 h-4 text-red-300" />}
              <span className="text-white text-sm font-medium">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <h3 className="text-white/80 text-sm font-medium mb-1">{title}</h3>
        <p className="text-white text-3xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  ));

  const QuickActionCard = React.memo(({ icon: Icon, title, description, onClick, color }) => (
    <div 
      onClick={onClick}
      className="group cursor-pointer bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 hover:-translate-y-1"
    >
      <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-slate-800 font-semibold text-lg mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
      <div className="flex justify-end mt-4 opacity-0 group-hover:opacity-100">
        <ChevronRight className="w-5 h-5 text-slate-400" />
      </div>
    </div>
  ));

  // Memoized cards for stability
  const recentPatientsMemo = useMemo(() => stats.recentPatients, [stats.recentPatients]);
  const recentPaymentsMemo = useMemo(() => stats.recentPayments, [stats.recentPayments]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Stats Grid - Fully Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard icon={Users} title="Total Patients" value={stats.totalPatients.toLocaleString()} change={12.5} bgGradient="from-blue-500 via-blue-600 to-blue-700" iconBg="bg-white/20" />
          <StatCard icon={FileText} title="Treatments Done" value={stats.totalTreatments.toLocaleString()} change={8.3} bgGradient="from-green-500 via-green-600 to-emerald-700" iconBg="bg-white/20" />
          <StatCard icon={Calendar} title="Today's Appointments" value="12" change={-2.1} bgGradient="from-purple-500 via-purple-600 to-violet-700" iconBg="bg-white/20" />
          <StatCard icon={CreditCard} title="Monthly Revenue" value={`₦${(stats.totalRevenue / 1000000).toFixed(1)}M`} change={15.7} bgGradient="from-orange-500 via-orange-600 to-red-600" iconBg="bg-white/20" />
        </div>

        {/* Quick Actions - Responsive */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-200/50 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Quick Actions</h2>
              <p className="text-slate-600">Streamline your daily workflow</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <QuickActionCard icon={Plus} title="Add Patient" description="Register new patient" onClick={() => setCurrentView('add-patient')} color="bg-gradient-to-br from-blue-500 to-blue-600" />
            <QuickActionCard icon={Calendar} title="Schedule" description="Book appointments" onClick={() => setCurrentView('appointments')} color="bg-gradient-to-br from-green-500 to-green-600" />
            <QuickActionCard icon={FileText} title="Treatment" description="Record treatments" onClick={() => setCurrentView('treatments')} color="bg-gradient-to-br from-purple-500 to-purple-600" />
            <QuickActionCard icon={BarChart3} title="Reports" description="View analytics" onClick={() => setCurrentView('reports')} color="bg-gradient-to-br from-orange-500 to-orange-600" />
          </div>
        </div>

        {/* Recent Patients & Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-200/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Recent Patients</h3>
                <p className="text-slate-600 text-sm">Latest registrations</p>
              </div>
              <button onClick={() => setCurrentView('patients')} className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {recentPatientsMemo.length > 0 ? recentPatientsMemo.slice(0, 5).map(patient => (
                <div key={patient.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-medium text-sm">
                      {patient.name?.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{patient.name}</p>
                      <p className="text-slate-500 text-sm">ID: {patient.id} • Age {patient.age}</p>
                    </div>
                  </div>
                  <button onClick={() => setCurrentView('view-patient')} className="text-slate-400 hover:text-blue-600">
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              )) : <p className="text-slate-500 py-8 text-center">No recent patients</p>}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-200/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Today's Schedule</h3>
                <p className="text-slate-600 text-sm">Upcoming appointments</p>
              </div>
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-center py-12 text-slate-500">
              Appointments feature coming soon
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernDentalDashboard;
