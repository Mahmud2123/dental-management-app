import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Users, Search, Plus, Filter, Eye, Edit, Trash2, Phone, 
  MapPin, FileText, Activity, X, ChevronDown, ChevronLeft, 
  ChevronRight, MoreHorizontal, Download, Upload, ArrowUpDown,
  User, Mail, Calendar
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

const patientsAPI = {
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

const treatmentsAPI = {
  getByPatientId: (patientId) => apiRequest(`/treatments/patient/${patientId}`),
};

const paymentsAPI = {
  getByPatientId: (patientId) => apiRequest(`/payments/patient/${patientId}`),
};

const Patients = ({ setCurrentView, setSelectedPatient }) => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatientLocal] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filters, setFilters] = useState({
    status: 'all',
    gender: 'all',
    ageRange: 'all',
    state: 'all'
  });

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [patients, searchQuery, filters, sortConfig]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await patientsAPI.getAll();
      
      const transformedPatients = await Promise.all(data.map(async (patient) => {
        try {
          const treatments = await treatmentsAPI.getByPatientId(patient.id);
          const payments = await paymentsAPI.getByPatientId(patient.id);
          
          return {
            ...patient,
            treatments_count: treatments.length,
            total_paid: payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0),
            status: 'Active',
            last_visit: treatments.length > 0 ? treatments[0].date : 'Never'
          };
        } catch (err) {
          return {
            ...patient,
            treatments_count: 0,
            total_paid: 0,
            status: 'Unknown',
            last_visit: 'Never'
          };
        }
      }));
      
      setPatients(transformedPatients);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async () => {
    let filtered = patients;

    if (searchQuery) {
      try {
        filtered = await patientsAPI.search(searchQuery);
        filtered = await Promise.all(filtered.map(async (patient) => {
          try {
            const treatments = await treatmentsAPI.getByPatientId(patient.id);
            const payments = await paymentsAPI.getByPatientId(patient.id);
            
            return {
              ...patient,
              treatments_count: treatments.length,
              total_paid: payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0),
              status: 'Active',
              last_visit: treatments.length > 0 ? treatments[0].date : 'Never'
            };
          } catch (err) {
            return {
              ...patient,
              treatments_count: 0,
              total_paid: 0,
              status: 'Unknown',
              last_visit: 'Never'
            };
          }
        }));
      } catch (error) {
        filtered = patients.filter(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.phone && p.phone.includes(searchQuery))
        );
      }
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(p => p.status && p.status.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.gender !== 'all') {
      filtered = filtered.filter(p => p.gender && p.gender.toLowerCase() === filters.gender);
    }
    if (filters.state !== 'all') {
      filtered = filtered.filter(p => p.state === filters.state);
    }
    if (filters.ageRange !== 'all') {
      const [min, max] = filters.ageRange.split('-').map(Number);
      filtered = filtered.filter(p => p.age >= min && (max ? p.age <= max : true));
    }

    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

    setFilteredPatients(filtered);
    setCurrentPage(1);
  }, [patients, searchQuery, filters, sortConfig]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await patientsAPI.delete(id);
        setPatients(patients.filter(p => p.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleViewPatient = useCallback((patient) => {
    setSelectedPatientLocal(patient);
    setSelectedPatient(patient);
    setCurrentView('view-patient');
  }, [setSelectedPatient, setCurrentView]);

  // Memoized Patient Card Component
  const PatientCard = useMemo(() => React.memo(({ patient }) => {
    const statusColors = {
      Active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Inactive: 'bg-calm-100 text-calm-800 border-calm-200',
      New: 'bg-medical-100 text-medical-800 border-medical-200',
      Unknown: 'bg-amber-100 text-amber-800 border-amber-200'
    };

    return (
      <div className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-calm-200 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-medical-500 to-violet-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-white font-bold text-sm sm:text-lg">
                {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-calm-800 group-hover:text-medical-600 transition-colors truncate">
                {patient.name}
              </h3>
              <p className="text-calm-500 text-xs sm:text-sm truncate">{patient.id} • {patient.age} yrs • {patient.gender}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[patient.status]}`}>
                  {patient.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-calm-600 min-w-0">
            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-calm-400 flex-shrink-0" />
            <span className="truncate">{patient.phone}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-calm-600 min-w-0">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-calm-400 flex-shrink-0" />
            <span className="truncate">{patient.state}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-calm-600">
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-calm-400 flex-shrink-0" />
            <span>{patient.treatments_count} treatments</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-calm-600">
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-calm-400 flex-shrink-0" />
            <span>₦{patient.total_paid.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-calm-100">
          <div className="flex items-center gap-2 text-xs text-calm-500">
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Last: {patient.last_visit}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button 
              onClick={() => handleViewPatient(patient)}
              className="w-7 h-7 sm:w-8 sm:h-8 bg-medical-50 hover:bg-medical-100 rounded-lg flex items-center justify-center text-medical-600 transition-colors"
              title="View"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button 
              className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 transition-colors"
              title="Edit"
            >
              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button 
              onClick={() => handleDelete(patient.id)}
              className="w-7 h-7 sm:w-8 sm:h-8 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center text-red-600 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }), [handleViewPatient]);

  // Pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Skeleton loader
  const CardSkeleton = () => (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-calm-200 animate-pulse">
      <div className="flex items-start gap-3 sm:gap-4 mb-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-calm-200 rounded-xl sm:rounded-2xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 sm:h-5 bg-calm-200 rounded w-3/4" />
          <div className="h-3 sm:h-4 bg-calm-200 rounded w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="h-3 sm:h-4 bg-calm-200 rounded" />
        <div className="h-3 sm:h-4 bg-calm-200 rounded" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="h-8 sm:h-10 bg-calm-200 rounded w-48 sm:w-64 animate-pulse" />
          <div className="h-10 bg-calm-200 rounded w-full sm:w-32 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-calm-800">Patient Management</h1>
          <p className="text-calm-500 text-sm mt-1">Manage your patient records</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button className="flex items-center gap-2 bg-calm-100 hover:bg-calm-200 text-calm-700 px-3 sm:px-4 py-2 rounded-xl transition-colors text-sm font-medium">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button className="flex items-center gap-2 bg-calm-100 hover:bg-calm-200 text-calm-700 px-3 sm:px-4 py-2 rounded-xl transition-colors text-sm font-medium">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button 
            onClick={() => setCurrentView('add-patient')}
            className="flex items-center gap-2 bg-gradient-to-r from-medical-500 to-violet-600 text-white px-4 sm:px-6 py-2 rounded-xl hover:shadow-lg transition-all text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-calm-200 shadow-soft">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-calm-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search patients by name, ID, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-calm-50 border border-calm-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-transparent transition-all text-sm"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${
                showFilters ? 'bg-medical-100 text-medical-700' : 'bg-calm-100 hover:bg-calm-200 text-calm-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={() => setSortConfig({ 
                key: sortConfig.key, 
                direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' 
              })}
              className="flex items-center gap-2 bg-calm-100 hover:bg-calm-200 text-calm-700 px-3 sm:px-4 py-2.5 rounded-xl transition-all text-sm font-medium"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="hidden sm:inline">Sort</span>
            </button>

            <div className="flex items-center bg-calm-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'grid' ? 'bg-white shadow-sm text-calm-800' : 'text-calm-600'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'list' ? 'bg-white shadow-sm text-calm-800' : 'text-calm-600'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-calm-100 animate-slide-up">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="px-3 sm:px-4 py-2 bg-calm-50 border border-calm-200 rounded-xl focus:ring-2 focus:ring-medical-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="new">New</option>
              </select>

              <select
                value={filters.gender}
                onChange={(e) => setFilters({...filters, gender: e.target.value})}
                className="px-3 sm:px-4 py-2 bg-calm-50 border border-calm-200 rounded-xl focus:ring-2 focus:ring-medical-500 text-sm"
              >
                <option value="all">All Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>

              <select
                value={filters.ageRange}
                onChange={(e) => setFilters({...filters, ageRange: e.target.value})}
                className="px-3 sm:px-4 py-2 bg-calm-50 border border-calm-200 rounded-xl focus:ring-2 focus:ring-medical-500 text-sm"
              >
                <option value="all">All Ages</option>
                <option value="0-18">0-18</option>
                <option value="19-35">19-35</option>
                <option value="36-55">36-55</option>
                <option value="56-100">56+</option>
              </select>

              <select
                value={filters.state}
                onChange={(e) => setFilters({...filters, state: e.target.value})}
                className="px-3 sm:px-4 py-2 bg-calm-50 border border-calm-200 rounded-xl focus:ring-2 focus:ring-medical-500 text-sm"
              >
                <option value="all">All States</option>
                <option value="Lagos">Lagos</option>
                <option value="Enugu">Enugu</option>
                <option value="Abuja">Abuja</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-calm-600 text-sm">
          Showing <span className="font-semibold text-calm-800">{filteredPatients.length}</span> patients
        </p>
      </div>

      {/* Patients Grid/List */}
      {currentPatients.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          : "space-y-3"
        }>
          {currentPatients.map(patient => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-calm-200 shadow-soft text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-calm-100 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-calm-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-calm-800 mb-2">No patients found</h3>
          <p className="text-calm-500 text-sm mb-4 sm:mb-6">Try adjusting your search or add a new patient</p>
          <button 
            onClick={() => setCurrentView('add-patient')}
            className="bg-gradient-to-r from-medical-500 to-violet-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl hover:shadow-lg transition-all text-sm font-medium"
          >
            Add First Patient
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-4">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 sm:w-10 sm:h-10 bg-white hover:bg-calm-50 rounded-lg sm:rounded-xl flex items-center justify-center border border-calm-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => paginate(i + 1)}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all text-sm font-medium ${
                currentPage === i + 1
                  ? 'bg-gradient-to-r from-medical-500 to-violet-600 text-white shadow-md'
                  : 'bg-white hover:bg-calm-50 border border-calm-200 text-calm-700'
              }`}
            >
              {i + 1}
            </button>
          ))}
          
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 sm:w-10 sm:h-10 bg-white hover:bg-calm-50 rounded-lg sm:rounded-xl flex items-center justify-center border border-calm-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(Patients);
