import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, Plus, Edit, Trash2, Calendar, X, FileText, 
  Clock, CheckCircle, AlertTriangle, DollarSign
} from 'lucide-react';
import { appointmentsAPI, patientsAPI, paymentsAPI } from '../services/api';

// Billing Component
const Billing = ({ setCurrentView }) => {
  const [payments, setPayments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [newPayment, setNewPayment] = useState({
    patient_id: '',
    patient_name: '',
    address: '',
    treatment: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'Cash',
    status: 'Completed'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [paymentsData, patientsData] = await Promise.all([
          paymentsAPI.getAll(),
          patientsAPI.getAll()
        ]);
        setPayments(paymentsData);
        setPatients(patientsData);
      } catch (error) {
        setError(error.message);
        console.error('Failed to fetch payments or patients:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    const updateState = isEdit ? setSelectedPayment : setNewPayment;
    if (name === 'patient_id') {
      const selectedPatient = patients.find(p => p.id === value);
      updateState(prev => ({
        ...prev,
        patient_id: value,
        patient_name: selectedPatient ? selectedPatient.name : '',
        address: selectedPatient ? selectedPatient.address : ''
      }));
    } else {
      updateState(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const response = await paymentsAPI.create(newPayment);
      setPayments([...payments, { ...newPayment, id: response.id }]);
      setShowAddModal(false);
      setNewPayment({
        patient_id: '',
        patient_name: '',
        address: '',
        treatment: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        payment_method: 'Cash',
        status: 'Completed'
      });
      alert('Payment added successfully!');
    } catch (error) {
      setError(error.message);
      console.error('Failed to create payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPayment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await paymentsAPI.update(selectedPayment.id, selectedPayment);
      setPayments(payments.map(pay => 
        pay.id === selectedPayment.id ? { ...selectedPayment } : pay
      ));
      setShowEditModal(false);
      setSelectedPayment(null);
      alert('Payment updated successfully!');
    } catch (error) {
      setError(error.message);
      console.error('Failed to update payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      try {
        await paymentsAPI.delete(id);
        setPayments(payments.filter(payment => payment.id !== id));
      } catch (error) {
        setError(error.message);
        console.error('Failed to delete payment:', error);
      }
    }
  };

  const PaymentCard = ({ payment }) => {
    const statusColors = {
      Completed: 'bg-green-100 text-green-800 border-green-200',
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Failed: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <div className="group bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                {payment.patient_name}
              </h3>
              <p className="text-slate-600">ID: {payment.patient_id}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[payment.status]}`}>
                  {payment.status}
                </span>
                <span className="text-slate-400 text-sm">{payment.date}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => {
                setSelectedPayment(payment);
                setShowEditModal(true);
              }}
              className="w-10 h-10 bg-green-50 hover:bg-green-100 rounded-xl flex items-center justify-center text-green-600 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleDelete(payment.id)}
              className="w-10 h-10 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-slate-600 mb-2">Treatment</h4>
          <p className="text-slate-800 text-sm leading-relaxed">
            {payment.treatment || 'Not specified'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/50">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-sm text-slate-600">
              <DollarSign className="w-4 h-4" />
              <span>₦{(payment.amount || 0).toLocaleString()}</span>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-sm text-slate-600">
              <CheckCircle className="w-4 h-4" />
              <span>{payment.payment_method}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PaymentForm = ({ isEdit = false, onSubmit, payment, setShowModal }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full border border-slate-200/50 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">{isEdit ? 'Edit Payment' : 'Add Payment'}</h3>
          <button onClick={() => setShowModal(false)}>
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Patient</label>
            <select
              name="patient_id"
              value={payment.patient_id}
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
            <label className="block text-sm font-medium text-slate-700 mb-2">Treatment Description</label>
            <input
              type="text"
              name="treatment"
              value={payment.treatment}
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
              value={payment.date}
              onChange={(e) => handleInputChange(e, isEdit)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Amount (₦)</label>
            <input
              type="number"
              name="amount"
              value={payment.amount}
              onChange={(e) => handleInputChange(e, isEdit)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
            <select
              name="payment_method"
              value={payment.payment_method}
              onChange={(e) => handleInputChange(e, isEdit)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="Cash">Cash</option>
              <option value="Transfer">Transfer</option>
              <option value="Card">Card</option>
              <option value="POS">POS</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              name="status"
              value={payment.status}
              onChange={(e) => handleInputChange(e, isEdit)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
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
              <span>{loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Payment'}</span>
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
            <DollarSign className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-slate-600">Loading payments...</p>
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
              <h1 className="text-3xl font-bold text-slate-800">Billing</h1>
              <p className="text-slate-600 mt-1">Manage payment records</p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl hover:shadow-lg transition-all font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Add Payment</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-400/30 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {payments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {payments.map(payment => (
                <PaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-12 border border-slate-200/50 shadow-xl text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No payments found</h3>
              <p className="text-slate-600 mb-6">Start by adding your first payment record</p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all"
              >
                Add First Payment
              </button>
            </div>
          )}
        </div>

        {showAddModal && (
          <PaymentForm 
            onSubmit={handleAddPayment} 
            payment={newPayment} 
            setShowModal={setShowAddModal} 
          />
        )}
        {showEditModal && selectedPayment && (
          <PaymentForm 
            isEdit 
            onSubmit={handleEditPayment} 
            payment={selectedPayment} 
            setShowModal={setShowEditModal} 
          />
        )}
      </div>
    </div>
  );
};

export default Billing;