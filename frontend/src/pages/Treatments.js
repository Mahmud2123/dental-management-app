import React, { useState, useEffect } from 'react';
import { 
  FileText, Calendar, User, Save, ArrowLeft, Plus, Search, Filter,
  Clock, CheckCircle, AlertTriangle, Eye, Edit, Trash2, Stethoscope,
  Pill, Shield, Heart, Activity, ChevronDown, X, Camera, Upload
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

// Your existing API services
const treatmentsAPI = {
  getAll: () => apiRequest('/treatments'),
  getByPatientId: (patientId) => apiRequest(`/treatments/patient/${patientId}`),
  create: (treatment) => apiRequest('/treatments', {
    method: 'POST',
    body: JSON.stringify(treatment),
  }),
  update: (id, treatment) => apiRequest(`/treatments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(treatment),
  }),
  delete: (id) => apiRequest(`/treatments/${id}`, {
    method: 'DELETE',
  }),
};

const patientsAPI = {
  getAll: () => apiRequest('/patients'),
};

const ModernTreatmentManagement = () => {
  const [currentView, setCurrentView] = useState('list');
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    dateRange: 'all',
    treatmentType: 'all',
    status: 'all'
  });

  // Treatment form state
  const [treatment, setTreatment] = useState({
    patient_id: '',
    patient_name: '',
    date: new Date().toISOString().split('T')[0],
    treatments: [],
    extra_oral: '',
    intra_oral: '',
    treatment_plan: '',
    next_treatment_date: '',
    chief_complaint: '',
    diagnosis: ''
  });

  const treatmentOptions = [
    { id: 'Cleaning', name: 'Dental Cleaning', color: 'bg-blue-500', category: 'Preventive' },
    { id: 'Examination', name: 'Oral Examination', color: 'bg-green-500', category: 'Diagnostic' },
    { id: 'Filling', name: 'Dental Filling', color: 'bg-yellow-500', category: 'Restorative' },
    { id: 'Root Canal', name: 'Root Canal Treatment', color: 'bg-red-500', category: 'Endodontic' },
    { id: 'Extraction', name: 'Tooth Extraction', color: 'bg-purple-500', category: 'Surgical' },
    { id: 'Crown', name: 'Dental Crown', color: 'bg-indigo-500', category: 'Prosthodontic' },
    { id: 'Whitening', name: 'Teeth Whitening', color: 'bg-pink-500', category: 'Cosmetic' },
    { id: 'Braces', name: 'Orthodontic Braces', color: 'bg-orange-500', category: 'Orthodontic' },
    { id: 'Dentures', name: 'Dentures', color: 'bg-teal-500', category: 'Prosthodontic' },
    { id: 'Bridges', name: 'Dental Bridge', color: 'bg-cyan-500', category: 'Prosthodontic' }
  ];

  useEffect(() => {
    loadTreatments();
    loadPatients();
  }, []);

  const loadTreatments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await treatmentsAPI.getAll();
      
      const transformedTreatments = data.map(treatment => {
        const treatmentList = [
          treatment.treatment1, treatment.treatment2, treatment.treatment3,
          treatment.treatment4, treatment.treatment5, treatment.treatment6,
          treatment.treatment7
        ].filter(t => t && t.trim() !== '');

        return {
          ...treatment,
          treatments: treatmentList,
          status: 'completed',
          duration: '45 min',
          cost: 50000,
          chief_complaint: treatment.chief_complaint || 'General checkup',
          diagnosis: treatment.diagnosis || 'Normal findings'
        };
      });

      setTreatments(transformedTreatments);
    } catch (error) {
      setError(error.message);
      console.error('Failed to load treatments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const data = await patientsAPI.getAll();
      setPatients(data);
    } catch (error) {
      console.error('Failed to load patients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const treatmentData = {
        ...treatment,
        treatments: treatment.treatments
      };

      await treatmentsAPI.create(treatmentData);
      await loadTreatments();
      
      setTreatment({
        patient_id: '',
        patient_name: '',
        date: new Date().toISOString().split('T')[0],
        treatments: [],
        extra_oral: '',
        intra_oral: '',
        treatment_plan: '',
        next_treatment_date: '',
        chief_complaint: '',
        diagnosis: ''
      });
      setCurrentView('list');
      
      alert('Treatment record saved successfully!');
    } catch (error) {
      setError(error.message);
      console.error('Failed to save treatment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this treatment record?')) {
      try {
        await treatmentsAPI.delete(id);
        setTreatments(treatments.filter(t => t.id !== id));
      } catch (error) {
        setError(error.message);
        console.error('Failed to delete treatment:', error);
      }
    }
  };

  const TreatmentCard = ({ treatment }) => {
    const statusColors = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };

    const selectedTreatments = (treatment.treatments || []).map(treatmentName => 
      treatmentOptions.find(opt => opt.id === treatmentName || opt.name === treatmentName)
    ).filter(Boolean);

    return (
      <div className="group bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                {treatment.patient_name}
              </h3>
              <p className="text-slate-600">ID: {treatment.patient_id}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[treatment.status]}`}>
                  {treatment.status.replace('-', ' ')}
                </span>
                <span className="text-slate-400 text-sm">{treatment.date}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => {
                setSelectedTreatment(treatment);
                setCurrentView('view');
              }}
              className="w-10 h-10 bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 bg-green-50 hover:bg-green-100 rounded-xl flex items-center justify-center text-green-600 transition-colors">
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleDelete(treatment.id)}
              className="w-10 h-10 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-slate-600 mb-2">Chief Complaint</h4>
          <p className="text-slate-800 text-sm leading-relaxed">
            {treatment.chief_complaint || 'Not specified'}
          </p>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-slate-600 mb-3">Treatments Performed</h4>
          <div className="flex flex-wrap gap-2">
            {selectedTreatments.length > 0 ? selectedTreatments.map((treatmentType, index) => (
              <div
                key={index}
                className={`${treatmentType.color} text-white px-3 py-1 rounded-lg text-xs font-medium`}
              >
                {treatmentType.name}
              </div>
            )) : (
              <span className="text-sm text-slate-500">No treatments specified</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/50">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-sm text-slate-600">
              <Clock className="w-4 h-4" />
              <span>{treatment.duration || '30 min'}</span>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-sm text-slate-600">
              <Calendar className="w-4 h-4" />
              <span>Next: {treatment.next_treatment_date || 'None'}</span>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-sm font-medium text-green-600">
              <span>₦{(treatment.cost || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TreatmentForm = () => {
    const handleTreatmentToggle = (treatmentId) => {
      setTreatment(prev => ({
        ...prev,
        treatments: prev.treatments.includes(treatmentId)
          ? prev.treatments.filter(t => t !== treatmentId)
          : [...prev.treatments, treatmentId]
      }));
    };

    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setCurrentView('list')}
            className="w-12 h-12 bg-white/90 hover:bg-white rounded-2xl flex items-center justify-center border border-slate-200/50 shadow-lg hover:shadow-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Add Treatment Record</h2>
            <p className="text-slate-600 mt-1">Record a new treatment session</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 shadow-xl">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Patient</label>
                <select
                  value={treatment.patient_id}
                  onChange={(e) => {
                    const selectedPatient = patients.find(p => p.id === e.target.value);
                    setTreatment({
                      ...treatment,
                      patient_id: e.target.value,
                      patient_name: selectedPatient?.name || ''
                    });
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Choose a patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.id} - {patient.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Treatment Date</label>
                <input
                  type="date"
                  value={treatment.date}
                  onChange={(e) => setTreatment({...treatment, date: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 shadow-xl">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Treatments Performed</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {treatmentOptions.map(option => (
                <div
                  key={option.id}
                  onClick={() => handleTreatmentToggle(option.id)}
                  className={`cursor-pointer p-4 rounded-2xl border-2 transition-all duration-300 ${
                    treatment.treatments.includes(option.id)
                      ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${option.color} rounded-xl flex items-center justify-center`}>
                      <Stethoscope className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{option.name}</p>
                      <p className="text-xs text-slate-500">{option.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setCurrentView('list')}
              className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:shadow-lg transition-all flex items-center space-x-2 font-medium disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Treatment'}</span>
            </button>
          </div>
        </form>
      </div>
    );
  };

  const TreatmentList = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Treatment Management</h1>
          <p className="text-slate-600 mt-1">Manage treatment records and clinical data</p>
        </div>
        <button 
          onClick={() => setCurrentView('add')}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl hover:shadow-lg transition-all font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Add Treatment</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-400/30 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {treatments.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {treatments.map(treatment => (
            <TreatmentCard key={treatment.id} treatment={treatment} />
          ))}
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-12 border border-slate-200/50 shadow-xl text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No treatments found</h3>
          <p className="text-slate-600 mb-6">Start by adding your first treatment record</p>
          <button 
            onClick={() => setCurrentView('add')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all"
          >
            Add First Treatment
          </button>
        </div>
      )}
    </div>
  );

  if (loading && currentView === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-slate-600">Loading treatments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {currentView === 'list' && <TreatmentList />}
        {currentView === 'add' && <TreatmentForm />}
        {currentView === 'view' && selectedTreatment && (
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setCurrentView('list')}
                className="w-12 h-12 bg-white/90 hover:bg-white rounded-2xl flex items-center justify-center border border-slate-200/50 shadow-lg hover:shadow-xl transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Treatment Details</h2>
                <p className="text-slate-600 mt-1">{selectedTreatment.patient_name} - {selectedTreatment.date}</p>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 shadow-xl">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Treatment Information</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Patient</h4>
                  <p className="text-slate-600">{selectedTreatment.patient_name} ({selectedTreatment.patient_id})</p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Date</h4>
                  <p className="text-slate-600">{selectedTreatment.date}</p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Status</h4>
                  <p className="text-slate-600">{selectedTreatment.status}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernTreatmentManagement;