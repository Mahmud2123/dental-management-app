import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, FileText, Calendar, CreditCard } from 'lucide-react';
import { patientsAPI, treatmentsAPI, paymentsAPI } from '../services/api';

const ViewPatient = ({ patient, setCurrentView }) => {
  const [patientData, setPatientData] = useState(patient);
  const [treatments, setTreatments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (patient && patient.id) {
      loadPatientDetails();
      loadPatientTreatments();
      loadPatientPayments();
    }
  }, [patient]);

  const loadPatientDetails = async () => {
    try {
      const data = await patientsAPI.getById(patient.id);
      setPatientData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadPatientTreatments = async () => {
    try {
      const data = await treatmentsAPI.getByPatientId(patient.id);
      setTreatments(data);
    } catch (err) {
      console.error('Failed to load treatments:', err);
    }
  };

  const loadPatientPayments = async () => {
    try {
      const data = await paymentsAPI.getByPatientId(patient.id);
      setPayments(data);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading patient details...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (!patientData) return <div className="text-center py-8">Patient not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setCurrentView('patients')}
            className="text-slate-600 hover:text-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold text-slate-800">Patient Record - {patientData.name}</h2>
        </div>
        <button className="text-slate-600 hover:text-slate-800">
          <Printer className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-slate-200/50 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Patient ID</label>
                <p className="text-slate-800 font-semibold">{patientData.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Full Name</label>
                <p className="text-slate-800">{patientData.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Age</label>
                <p className="text-slate-800">{patientData.age}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Gender</label>
                <p className="text-slate-800">{patientData.gender}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Phone</label>
                <p className="text-slate-800">{patientData.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Blood Group</label>
                <p className="text-slate-800">{patientData.blood_group}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Genotype</label>
                <p className="text-slate-800">{patientData.genotype}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Occupation</label>
                <p className="text-slate-800">{patientData.occupation}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Religion</label>
                <p className="text-slate-800">{patientData.religion}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">State</label>
                <p className="text-slate-800">{patientData.state}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Marital Status</label>
                <p className="text-slate-800">{patientData.marital_status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Rhesus Factor</label>
                <p className="text-slate-800">{patientData.rhesus}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-600">Address</label>
                <p className="text-slate-800">{patientData.address}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Next of Kin</label>
                <p className="text-slate-800">{patientData.next_of_kin}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-slate-200/50 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setCurrentView('treatments')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Add Treatment</span>
              </button>
              <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-green-700 transition-all flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Schedule Appointment</span>
              </button>
              <button 
                onClick={() => setCurrentView('payments')}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all flex items-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Create Bill</span>
              </button>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-slate-200/50 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Treatment History</h3>
            <div className="space-y-2">
              {treatments.slice(0, 3).map(treatment => (
                <div key={treatment.id} className="p-2 bg-slate-50/50 rounded-lg">
                  <p className="text-sm font-medium text-slate-800">{treatment.date}</p>
                  <p className="text-xs text-slate-600">
                    {[treatment.treatment1, treatment.treatment2, treatment.treatment3]
                      .filter(t => t).join(', ')}
                  </p>
                </div>
              ))}
              {treatments.length === 0 && (
                <p className="text-sm text-slate-600">No treatments recorded</p>
              )}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-slate-200/50 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Payment History</h3>
            <div className="space-y-2">
              {payments.slice(0, 3).map(payment => (
                <div key={payment.id} className="p-2 bg-slate-50/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-slate-800">{payment.date}</p>
                    <p className="text-sm font-semibold text-green-600">₦{payment.amount}</p>
                  </div>
                  <p className="text-xs text-slate-600">{payment.treatment}</p>
                </div>
              ))}
              {payments.length === 0 && (
                <p className="text-sm text-slate-600">No payments recorded</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-slate-200/50 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Past Dental History</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{patientData.past_dental_history || 'No information available'}</p>
          </div>
        </div>
        <div>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-slate-200/50 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Family History</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{patientData.family_history || 'No information available'}</p>
          </div>
        </div>
        <div>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-slate-200/50 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Medical History</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{patientData.past_medical_history || 'No information available'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPatient;