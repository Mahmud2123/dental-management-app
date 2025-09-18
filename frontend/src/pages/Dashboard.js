import React, { useState, useEffect } from 'react';
import { Users, Calendar, FileText, CreditCard, Eye, Plus, Search, BarChart3, TrendingUp, Clock, Activity, Heart, Shield, Star, ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';

// API integration - replace with your actual API service
const dashboardAPI = {
  getStats: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  }
};

const ModernDentalDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalTreatments: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    recentPatients: [],
    recentPayments: [],
    upcomingAppointments: []
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
      
      // Transform the data to match your component structure
      const transformedStats = {
        totalPatients: data.totalPatients || 0,
        totalTreatments: data.totalTreatments || 0,
        totalRevenue: data.totalRevenue || 0,
        monthlyGrowth: 12.5, // Calculate this based on historical data
        recentPatients: (data.recentPatients || []).map(patient => ({
          ...patient,
          status: 'completed' // Default status, adjust based on your data
        })),
        recentPayments: (data.recentPayments || []).map(payment => ({
          id: payment.id,
          patient: payment.patient_name,
          treatment: payment.treatment,
          amount: payment.amount,
          date: payment.date,
          method: payment.payment_method || 'Cash'
        })),
        upcomingAppointments: [
          // You'll need to add appointments API endpoint to get this data
          // For now, using empty array until appointments feature is added
        ]
      };
      
      setStats(transformedStats);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, change, color, bgGradient, iconBg }) => (
    <div className={`relative group bg-gradient-to-br ${bgGradient} rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/20`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl"></div>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-16 h-16 ${iconBg} rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-8 h-8 text-white drop-shadow-sm" />
          </div>
          {change && (
            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm`}>
              {change > 0 ? <ArrowUp className="w-4 h-4 text-green-300" /> : <ArrowDown className="w-4 h-4 text-red-300" />}
              <span className="text-white text-sm font-medium">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-white/80 text-sm font-medium mb-2">{title}</h3>
          <p className="text-white text-3xl font-bold tracking-tight">{value}</p>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mb-16 group-hover:bg-white/10 transition-colors duration-300"></div>
    </div>
  );

  const QuickActionCard = ({ icon: Icon, title, description, onClick, color }) => (
    <div 
      onClick={onClick}
      className={`group cursor-pointer bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-white`}
    >
      <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-slate-800 font-semibold text-lg mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
      <div className="flex items-center justify-end mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <ChevronRight className="w-5 h-5 text-slate-400" />
      </div>
    </div>
  );

  const PatientCard = ({ patient }) => {
    const statusColors = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200'
    };

    return (
      <div className="group flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 hover:bg-white hover:shadow-lg transition-all duration-300">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-semibold text-sm">{patient.name.split(' ').map(n => n[0]).join('')}</span>
          </div>
          <div>
            <p className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{patient.name}</p>
            <p className="text-slate-500 text-sm">{patient.id} • Age {patient.age}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[patient.status]}`}>
            {patient.status}
          </span>
          <button className="text-slate-400 hover:text-blue-600 transition-colors">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const PaymentCard = ({ payment }) => (
    <div className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 hover:bg-white hover:shadow-lg transition-all duration-300">
      <div className="flex-1">
        <p className="font-semibold text-slate-800">{payment.patient}</p>
        <p className="text-slate-500 text-sm">{payment.treatment}</p>
        <p className="text-slate-400 text-xs mt-1">{payment.date} • {payment.method}</p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-green-600">₦{payment.amount.toLocaleString()}</p>
      </div>
    </div>
  );

  const AppointmentCard = ({ appointment }) => {
    const statusColors = {
      confirmed: 'bg-green-500',
      pending: 'bg-yellow-500'
    };

    return (
      <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 hover:bg-white hover:shadow-lg transition-all duration-300">
        <div className="w-3 h-12 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full"></div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-slate-800">{appointment.patient}</p>
            <div className={`w-3 h-3 rounded-full ${statusColors[appointment.status]}`}></div>
          </div>
          <p className="text-slate-500 text-sm">{appointment.treatment}</p>
        </div>
        <div className="text-right">
          <p className="text-slate-800 font-semibold">{appointment.time}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                DentalCare Pro
              </h1>
              <p className="text-slate-600 mt-1">Professional Dental Management System</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-semibold">DA</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            title="Treatments Done"
            value={stats.totalTreatments.toLocaleString()}
            change={8.3}
            bgGradient="from-green-500 via-green-600 to-emerald-700"
            iconBg="bg-white/20"
          />
          <StatCard
            icon={Calendar}
            title="Today's Appointments"
            value="12"
            change={-2.1}
            bgGradient="from-purple-500 via-purple-600 to-violet-700"
            iconBg="bg-white/20"
          />
          <StatCard
            icon={CreditCard}
            title="Monthly Revenue"
            value={`₦${(stats.totalRevenue / 1000000).toFixed(1)}M`}
            change={15.7}
            bgGradient="from-orange-500 via-orange-600 to-red-600"
            iconBg="bg-white/20"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Quick Actions</h2>
              <p className="text-slate-600 mt-1">Streamline your daily workflow</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickActionCard
              icon={Plus}
              title="Add Patient"
              description="Register a new patient with complete medical history"
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <QuickActionCard
              icon={Calendar}
              title="Schedule"
              description="Book appointments and manage your daily schedule"
              color="bg-gradient-to-br from-green-500 to-green-600"
            />
            <QuickActionCard
              icon={FileText}
              title="Treatment"
              description="Record treatment plans and medical procedures"
              color="bg-gradient-to-br from-purple-500 to-purple-600"
            />
            <QuickActionCard
              icon={BarChart3}
              title="Reports"
              description="Generate comprehensive reports and analytics"
              color="bg-gradient-to-br from-orange-500 to-orange-600"
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Patients */}
          <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Recent Patients</h3>
                <p className="text-slate-600 mt-1">Latest patient registrations and visits</p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-slate-400 hover:text-blue-600 transition-colors">
                  <Search className="w-5 h-5" />
                </button>
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all text-sm font-medium">
                  View All
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {stats.recentPatients.map(patient => (
                <PatientCard key={patient.id} patient={patient} />
              ))}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Today's Schedule</h3>
                <p className="text-slate-600 mt-1">Upcoming appointments</p>
              </div>
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="space-y-4">
              {stats.upcomingAppointments.map(appointment => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
            <button className="w-full mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 text-blue-700 py-3 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all font-medium">
              View Full Schedule
            </button>
          </div>
        </div>

        {/* Payments & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Payments */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Recent Payments</h3>
                <p className="text-slate-600 mt-1">Latest financial transactions</p>
              </div>
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-xl">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-700 text-sm font-medium">+15.7%</span>
              </div>
            </div>
            <div className="space-y-4">
              {stats.recentPayments.map(payment => (
                <PaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
          </div>

          {/* Health Metrics */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Practice Health</h3>
                <p className="text-slate-600 mt-1">Key performance indicators</p>
              </div>
              <Heart className="w-6 h-6 text-red-500" />
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm">Patient Satisfaction</p>
                  <p className="text-2xl font-bold text-slate-800">4.9/5</p>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm">Treatment Success Rate</p>
                  <p className="text-2xl font-bold text-slate-800">98.7%</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm">On-time Performance</p>
                  <p className="text-2xl font-bold text-slate-800">94.2%</p>
                </div>
                <div className="w-3 h-12 bg-gradient-to-t from-blue-200 to-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernDentalDashboard;