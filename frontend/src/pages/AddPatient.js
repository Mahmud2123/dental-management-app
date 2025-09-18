import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { patientsAPI } from '../services/api';

const AddPatient = ({ setCurrentView }) => {
  const [patient, setPatient] = useState({
    name: '', age: '', gender: 'Male', phone: '', address: '', blood_group: '', 
    genotype: '', occupation: '', religion: '', state: '', nationality: 'Nigerian',
    marital_status: 'Single', next_of_kin: '', past_dental_history: '', 
    family_history: '', past_medical_history: '', rhesus: 'Positive'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa',
    'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger',
    'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await patientsAPI.create(patient);
      alert('Patient record saved successfully!');
      setCurrentView('patients');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => setCurrentView('patients')}
          className="text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-slate-800">Add New Patient</h2>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-400/30 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-slate-200/50 shadow-lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
            <input
              type="text"
              value={patient.name}
              onChange={(e) => setPatient({...patient, name: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Age</label>
            <input
              type="number"
              value={patient.age}
              onChange={(e) => setPatient({...patient, age: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
            <select
              value={patient.gender}
              onChange={(e) => setPatient({...patient, gender: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
            <input
              type="tel"
              value={patient.phone}
              onChange={(e) => setPatient({...patient, phone: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
            <textarea
              value={patient.address}
              onChange={(e) => setPatient({...patient, address: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Blood Group</label>
            <select
              value={patient.blood_group}
              onChange={(e) => setPatient({...patient, blood_group: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Blood Group</option>
              {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Genotype</label>
            <select
              value={patient.genotype}
              onChange={(e) => setPatient({...patient, genotype: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Genotype</option>
              {['AA', 'AS', 'SS', 'AC', 'SC'].map(gt => (
                <option key={gt} value={gt}>{gt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Occupation</label>
            <input
              type="text"
              value={patient.occupation}
              onChange={(e) => setPatient({...patient, occupation: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Religion</label>
            <select
              value={patient.religion}
              onChange={(e) => setPatient({...patient, religion: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Religion</option>
              <option value="Christianity">Christianity</option>
              <option value="Islam">Islam</option>
              <option value="Traditional">Traditional</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
            <select
              value={patient.state}
              onChange={(e) => setPatient({...patient, state: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select State</option>
              {nigerianStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Marital Status</label>
            <select
              value={patient.marital_status}
              onChange={(e) => setPatient({...patient, marital_status: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Next of Kin</label>
            <input
              type="text"
              value={patient.next_of_kin}
              onChange={(e) => setPatient({...patient, next_of_kin: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Rhesus Factor</label>
            <select
              value={patient.rhesus}
              onChange={(e) => setPatient({...patient, rhesus: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Positive">Positive</option>
              <option value="Negative">Negative</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Past Dental History</label>
            <textarea
              value={patient.past_dental_history}
              onChange={(e) => setPatient({...patient, past_dental_history: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Family History</label>
            <textarea
              value={patient.family_history}
              onChange={(e) => setPatient({...patient, family_history: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Medical History</label>
            <textarea
              value={patient.past_medical_history}
              onChange={(e) => setPatient({...patient, past_medical_history: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            />
          </div>

          <div className="md:col-span-2 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setCurrentView('patients')}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Patient'}</span>
            </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatient;