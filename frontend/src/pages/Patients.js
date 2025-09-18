import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Plus, Filter, Eye, Edit, Trash2, Phone, Mail, 
  Calendar, MapPin, Heart, Activity, FileText, X, ChevronDown,
  User, Clock, AlertCircle, CheckCircle, Download, Upload,
  ArrowUpDown, ChevronLeft, ChevronRight, MoreHorizontal
} from 'lucide-react';

// API Integration - using your actual API service
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

// Your existing API service
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

const ModernPatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [error, setError] = useState('');
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
      
      // Transform the data to add computed fields
      const transformedPatients = await Promise.all(data.map(async (patient) => {
        try {
          // Get treatment count
          const treatments = await treatmentsAPI.getByPatientId(patient.id);
          const payments = await paymentsAPI.getByPatientId(patient.id);
          
          return {
            ...patient,
            treatments_count: treatments.length,
            total_paid: payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0),
            status: 'Active', // You can derive this from last visit date or add to your DB
            last_visit: treatments.length > 0 ? treatments[0].date : 'Never'
          };
        } catch (err) {
          console.error(`Error loading additional data for patient ${patient.id}:`, err);
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
      console.error('Failed to load patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    let filtered = patients;

    // Apply search query using API if query exists
    if (searchQuery) {
      try {
        filtered = await patientsAPI.search(searchQuery);
        // Add computed fields to search results
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
        console.error('Search failed:', error);
        filtered = patients.filter(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.phone && p.phone.includes(searchQuery))
        );
      }
    }

    // Apply filters
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

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

    setFilteredPatients(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await patientsAPI.delete(id);
        setPatients(patients.filter(p => p.id !== id));
        setFilteredPatients(filteredPatients.filter(p => p.id !== id));
      } catch (err) {
        setError(err.message);
        console.error('Failed to delete patient:', err);
      }
    }
  };

  const PatientCard = ({ patient }) => {
    const statusColors = {
      Active: 'bg-green-100 text-green-800 border-green-200',
      Inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      New: 'bg-blue-100 text-blue-800 border-blue-200'
    };

    return (
      <div className="group bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                {patient.name}
              </h3>
              <p className="text-slate-600">{patient.id} • {patient.age} years • {patient.gender}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[patient.status]}`}>
                  {patient.status}
                </span>
                <span className="text-slate-400 text-sm">Last visit: {patient.last_visit}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => setSelectedPatient(patient)}
              className="w-10 h-10 bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 bg-green-50 hover:bg-green-100 rounded-xl flex items-center justify-center text-green-600 transition-colors">
              <Edit className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center text-red-600 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Phone className="w-4 h-4" />
            <span>{patient.phone}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4" />
            <span>{patient.state}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <FileText className="w-4 h-4" />
            <span>{patient.treatments_count} treatments</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Activity className="w-4 h-4" />
            <span>₦{patient.total_paid.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-slate-600">{patient.occupation}</span>
          </div>
          <div className="text-sm text-slate-500">
            Blood: {patient.blood_group} • {patient.genotype}
          </div>
        </div>
      </div>
    );
  };

  const PatientModal = ({ patient, onClose }) => {
    if (!patient) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {patient.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{patient.name}</h2>
                  <p className="text-white/80">{patient.id} • {patient.age} years old</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Gender</label>
                      <p className="text-slate-800">{patient.gender}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Marital Status</label>
                      <p className="text-slate-800">{patient.marital_status}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Occupation</label>
                      <p className="text-slate-800">{patient.occupation}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Religion</label>
                      <p className="text-slate-800">{patient.religion}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-slate-600">Address</label>
                      <p className="text-slate-800">{patient.address}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Next of Kin</label>
                      <p className="text-slate-800">{patient.next_of_kin}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Medical Information</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Blood Group</label>
                      <p className="text-slate-800 font-semibold">{patient.blood_group}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Genotype</label>
                      <p className="text-slate-800 font-semibold">{patient.genotype}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">State</label>
                      <p className="text-slate-800">{patient.state}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-800">Total Treatments</span>
                    <FileText className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-800">{patient.treatments_count}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800">Total Paid</span>
                    <Activity className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-800">₦{patient.total_paid.toLocaleString()}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-800">Last Visit</span>
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-lg font-bold text-purple-800">{patient.last_visit}</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <button className="w-full bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600 transition-colors text-sm">
                      Schedule Appointment
                    </button>
                    <button className="w-full bg-green-500 text-white py-2 rounded-xl hover:bg-green-600 transition-colors text-sm">
                      Add Treatment
                    </button>
                    <button className="w-full bg-orange-500 text-white py-2 rounded-xl hover:bg-orange-600 transition-colors text-sm">
                      Create Invoice
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-slate-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Patient Management</h1>
              <p className="text-slate-600 mt-1">Manage your patient records and information</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors">
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </button>
              <button className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Patient</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Search and Filters */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search patients by name, ID, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                  showFilters ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 hover:bg-slate-200'
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
                className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors"
              >
                <ArrowUpDown className="w-4 h-4" />
                <span>Sort</span>
              </button>

              <div className="text-sm text-slate-600">
                {filteredPatients.length} patients found
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-slate-200/50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="new">New</option>
                </select>

                <select
                  value={filters.gender}
                  onChange={(e) => setFilters({...filters, gender: e.target.value})}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>

                <select
                  value={filters.ageRange}
                  onChange={(e) => setFilters({...filters, ageRange: e.target.value})}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
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
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
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

        {/* Patients Grid */}
        {currentPatients.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {currentPatients.map(patient => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-12 border border-slate-200/50 shadow-xl text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No patients found</h3>
            <p className="text-slate-600 mb-6">Try adjusting your search criteria or add a new patient</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all"
            >
              Add First Patient
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-10 h-10 bg-white/90 hover:bg-white rounded-xl flex items-center justify-center border border-slate-200/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  currentPage === i + 1
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/90 hover:bg-white border border-slate-200/50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-10 h-10 bg-white/90 hover:bg-white rounded-xl flex items-center justify-center border border-slate-200/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <PatientModal 
          patient={selectedPatient} 
          onClose={() => setSelectedPatient(null)} 
        />
      )}
    </div>
  );
};

export default ModernPatientManagement;