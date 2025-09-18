import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, Plus, Edit, Trash2, Calendar, X, FileText, 
  Clock, CheckCircle, AlertTriangle, DollarSign
} from 'lucide-react';
import { appointmentsAPI, patientsAPI, paymentsAPI } from '../services/api';

// Appointments Component
const Appointments = ({ setCurrentView }) => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newAppointment, setNewAppointment] = useState({
    patient_id: '',
    patient_name: '',
    treatment: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    status: 'scheduled',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [appointmentsData, patientsData] = await Promise.all([
          appointmentsAPI.getAll(),
          patientsAPI.getAll()
        ]);
        setAppointments(appointmentsData);
        setPatients(patientsData);
      } catch (error) {
        setError(error.message);
        console.error('Failed to fetch appointments or patients:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    const updateState = isEdit ? setSelectedAppointment : setNewAppointment;
    if (name === 'patient_id') {
      const selectedPatient = patients.find(p => p.id === value);
      updateState(prev => ({
        ...prev,
        patient_id: value,
        patient_name: selectedPatient ? selectedPatient.name : ''
      }));
    } else {
      updateState(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const response = await appointmentsAPI.create(newAppointment);
      setAppointments([...appointments, { ...newAppointment, id: response.id }]);
      setShowAddModal(false);
      setNewAppointment({
        patient_id: '',
        patient_name: '',
        treatment: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        status: 'scheduled',
        notes: ''
      });
      alert('Appointment added successfully!');
    } catch (error) {
      setError(error.message);
      console.error('Failed to create appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAppointment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await appointmentsAPI.update(selectedAppointment.id, selectedAppointment);
      setAppointments(appointments.map(app => 
        app.id === selectedAppointment.id ? { ...selectedAppointment } : app
      ));
      setShowEditModal(false);
      setSelectedAppointment(null);
      alert('Appointment updated successfully!');
    } catch (error) {
      setError(error.message);
      console.error('Failed to update appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await appointmentsAPI.delete(id);
        setAppointments(appointments.filter(appointment => appointment.id !== id));
      } catch (error) {
        setError(error.message);
        console.error('Failed to delete appointment:', error);
      }
    }
  };

  const AppointmentCard = ({ appointment }) => {
    const statusColors = {
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <div className="group bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                {appointment.patient_name}
              </h3>
              <p className="text-slate-600">ID: {appointment.patient_id}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[appointment.status]}`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
                <span className="text-slate-400 text-sm">{appointment.date} • {appointment.time}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => {
                setSelectedAppointment(appointment);
                setShowEditModal(true);
              }}
              className="w-10 h-10 bg-green-50 hover:bg-green-100 rounded-xl flex items-center justify-center text-green-600 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleDelete(appointment.id)}
              className="w-10 h-10 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-slate-600 mb-2">Treatment</h4>
          <p className="text-slate-800 text-sm leading-relaxed">
            {appointment.treatment || 'Not specified'}
          </p>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-slate-600 mb-2">Notes</h4>
          <p className="text-slate-800 text-sm leading-relaxed">
            {appointment.notes || 'No notes provided'}
          </p>
        </div>
      </div>
    );
  };

  const AppointmentForm = ({ isEdit = false, onSubmit, appointment, setShowModal }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full border border-slate-200/50 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">{isEdit ? 'Edit Appointment' : 'Add Appointment'}</h3>
          <button onClick={() => setShowModal(false)}>
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Patient</label>
            <select
              name="patient_id"
              value={appointment.patient_id}
              onChange={(e) => handleInputChange(e, isEdit)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            >
              <option value="">Select Patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>{patient.id} - {patient.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Treatment</label>
            <input
              type="text"
              name="treatment"
              value={appointment.treatment}
              onChange={(e) => handleInputChange(e, isEdit)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={appointment.date}
              onChange={(e) => handleInputChange(e, isEdit)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Time</label>
            <input
              type="time"
              name="time"
              value={appointment.time}
              onChange={(e) => handleInputChange(e, isEdit)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              name="status"
              value={appointment.status}
              onChange={(e) => handleInputChange(e, isEdit)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
            <textarea
              name="notes"
              value={appointment.notes}
              onChange={(e) => handleInputChange(e, isEdit)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:shadow-lg transition-all flex items-center space-x-2 font-medium disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Appointment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-slate-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Appointments</h1>
              <p className="text-slate-600 mt-1">Manage appointment records</p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl hover:shadow-lg transition-all font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Add Appointment</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-400/30 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {appointments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {appointments.map(appointment => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-12 border border-slate-200/50 shadow-xl text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No appointments found</h3>
              <p className="text-slate-600 mb-6">Start by adding your first appointment</p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all"
              >
                Add First Appointment
              </button>
            </div>
          )}
        </div>

        {showAddModal && (
          <AppointmentForm 
            onSubmit={handleAddAppointment} 
            appointment={newAppointment} 
            setShowModal={setShowAddModal} 
          />
        )}
        {showEditModal && selectedAppointment && (
          <AppointmentForm 
            isEdit 
            onSubmit={handleEditAppointment} 
            appointment={selectedAppointment} 
            setShowModal={setShowEditModal} 
          />
        )}
      </div>
    </div>
  );
};

export default Appointments;