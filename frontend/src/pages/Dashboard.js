import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Users, FileText, Calendar, CreditCard, Eye, Plus, 
  BarChart3, ArrowUp, ArrowDown, ChevronRight, Activity,
  TrendingUp, Clock
} from 'lucide-react';
import { dashboardAPI } from '../services/api';

const Dashboard = ({ setCurrentView }) => {
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

  // Memoized Stat Card Component
  const StatCard = useMemo(() => React.memo(({ icon: Icon, title, value, change, bgGradient, iconBg }) => (
    <div className={`relative group overflow-hidden bg-gradient-to-br ${bgGradient} rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border border-white/20`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className={`w-10 h-10 sm:w-14 sm:h-14 ${iconBg} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-white drop-shadow-sm" />
          </div>
          {change !== undefined && (
            <div className={`flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm ${
              change > 0 ? 'bg-white/20 text-green-100' : 'bg-white/20 text-red-100'
            }`}>
              {change > 0 ? <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />}
              <span className="text-xs sm:text-sm font-semibold">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <h3 className="text-white/80 text-xs sm:text-sm font-medium mb-1">{title}</h3>
        <p className="text-white text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">{value}</p>
      </div>
      {/* Decorative background element */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
    </div>
  )), []);

  // Memoized Quick Action Card
  const QuickActionCard = useMemo(() => React.memo(({ icon: Icon, title, description, onClick, color, delay }) => (
    <div 
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-calm-200 shadow-card hover:shadow-elevated hover:border-medical-200 transition-all duration-300 hover:-translate-y-1 animate-slide-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${color} rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      <h3 className="text-calm-800 font-semibold text-sm sm:text-base mb-1 sm:mb-2">{title}</h3>
      <p className="text-calm-500 text-xs sm:text-sm leading-relaxed">{description}</p>
      <div className="flex justify-end mt-3 sm:mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-medical-400" />
      </div>
    </div>
  )), []);

  // Skeleton loader for stats
  const StatSkeleton = () => (
    <div className="bg-calm-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 animate-pulse">
      <div className="w-10 h-10 sm:w-14 sm:h-14 bg-calm-200 rounded-xl sm:rounded-2xl mb-3 sm:mb-4" />
      <div className="h-3 sm:h-4 bg-calm-200 rounded w-2/3 mb-2" />
      <div className="h-6 sm:h-8 bg-calm-200 rounded w-1/2" />
    </div>
  );

  const recentPatientsMemo = useMemo(() => stats.recentPatients, [stats.recentPatients]);
  const recentPaymentsMemo = useMemo(() => stats.recentPayments, [stats.recentPayments]);

  if (loading) {
    return (
      <div className="min-h-[60vh] space-y-6 sm:space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => <StatSkeleton key={i} />)}
        </div>
        <div className="bg-calm-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 h-64 sm:h-80 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8 sm:pb-12 space-y-6 sm:space-y-8">
      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatCard 
          icon={Users} 
          title="Total Patients" 
          value={stats.totalPatients.toLocaleString()} 
          change={12.5} 
          bgGradient="from-blue-500 via-blue-600 to-blue-700" 
          iconBg="bg-white/20" 
        />
        <StatCard 
          icon={FileText} 
          title="Treatments" 
          value={stats.totalTreatments.toLocaleString()} 
          change={8.3} 
          bgGradient="from-emerald-500 via-emerald-600 to-teal-700" 
          iconBg="bg-white/20" 
        />
        <StatCard 
          icon={Calendar} 
          title="Today's Appts" 
          value="12" 
          change={-2.1} 
          bgGradient="from-violet-500 via-violet-600 to-purple-700" 
          iconBg="bg-white/20" 
        />
        <StatCard 
          icon={CreditCard} 
          title="Revenue" 
          value={`₦${(stats.totalRevenue / 1000000).toFixed(1)}M`} 
          change={15.7} 
          bgGradient="from-orange-500 via-orange-600 to-amber-600" 
          iconBg="bg-white/20" 
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-calm-200 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-calm-800">Quick Actions</h2>
            <p className="text-calm-500 text-xs sm:text-sm mt-1">Streamline your daily workflow</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-medical-100 to-violet-100 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-medical-600" />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <QuickActionCard 
            icon={Plus} 
            title="Add Patient" 
            description="Register new patient record" 
            onClick={() => setCurrentView('add-patient')} 
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            delay={0}
          />
          <QuickActionCard 
            icon={Calendar} 
            title="Schedule" 
            description="Book new appointment" 
            onClick={() => setCurrentView('appointments')} 
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
            delay={100}
          />
          <QuickActionCard 
            icon={FileText} 
            title="Treatment" 
            description="Record treatment session" 
            onClick={() => setCurrentView('treatments')} 
            color="bg-gradient-to-br from-violet-500 to-violet-600"
            delay={200}
          />
          <QuickActionCard 
            icon={BarChart3} 
            title="Reports" 
            description="View analytics & reports" 
            onClick={() => setCurrentView('reports')} 
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            delay={300}
          />
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Patients */}
        <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-calm-200 shadow-soft">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-calm-800">Recent Patients</h3>
              <p className="text-calm-500 text-xs sm:text-sm">Latest registrations</p>
            </div>
            <button 
              onClick={() => setCurrentView('patients')} 
              className="text-medical-600 hover:text-medical-700 font-medium text-xs sm:text-sm flex items-center gap-1 transition-colors"
            >
              View All <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {recentPatientsMemo.length > 0 ? recentPatientsMemo.slice(0, 5).map((patient, idx) => (
              <div 
                key={patient.id} 
                className="flex items-center justify-between p-3 sm:p-4 bg-calm-50 rounded-xl sm:rounded-2xl border border-calm-100 hover:border-medical-200 hover:shadow-soft transition-all duration-200 group"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-medical-500 to-violet-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
                    {patient.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-calm-800 text-sm sm:text-base truncate">{patient.name}</p>
                    <p className="text-calm-500 text-xs sm:text-sm">ID: {patient.id} • Age {patient.age}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setCurrentView('view-patient')} 
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-white hover:bg-medical-50 rounded-lg sm:rounded-xl flex items-center justify-center text-calm-400 hover:text-medical-600 transition-colors flex-shrink-0 border border-calm-200"
                >
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            )) : (
              <div className="text-center py-8 sm:py-12 text-calm-500">
                <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No recent patients</p>
              </div>
            )}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-calm-200 shadow-soft">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-calm-800">Today's Schedule</h3>
              <p className="text-calm-500 text-xs sm:text-sm">Upcoming appointments</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-medical-50 rounded-lg sm:rounded-xl flex items-center justify-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-medical-600" />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-calm-50 rounded-xl border border-calm-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-medium text-calm-800">John Doe</p>
                <p className="text-xs text-calm-500">10:00 AM • Cleaning</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-calm-50 rounded-xl border border-calm-100">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-medium text-calm-800">Jane Smith</p>
                <p className="text-xs text-calm-500">11:30 AM • Checkup</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-calm-50 rounded-xl border border-calm-100">
              <div className="w-2 h-2 bg-violet-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-medium text-calm-800">Mike Johnson</p>
                <p className="text-xs text-calm-500">2:00 PM • Filling</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setCurrentView('appointments')}
            className="w-full mt-4 py-2.5 bg-medical-50 hover:bg-medical-100 text-medical-700 rounded-xl text-sm font-medium transition-colors"
          >
            View All Appointments
          </button>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-calm-200 shadow-soft">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-calm-800">Revenue Overview</h3>
            <p className="text-calm-500 text-xs sm:text-sm">Monthly performance</p>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-semibold">+15.7%</span>
          </div>
        </div>
        <div className="h-48 sm:h-64 bg-gradient-to-b from-calm-50 to-white rounded-xl sm:rounded-2xl border border-calm-100 flex items-center justify-center">
          <div className="text-center text-calm-400">
            <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-30" />
            <p className="text-xs sm:text-sm">Chart visualization coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Dashboard);
