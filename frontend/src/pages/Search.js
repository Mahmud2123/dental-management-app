import React, { useState } from 'react';
import { Search as SearchIcon, Eye } from 'lucide-react';
import { patientsAPI, treatmentsAPI } from '../services/api';

const Search = ({ setCurrentView, setSelectedPatient }) => {
  const [searchType, setSearchType] = useState('patient');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError('');

    try {
      let results = [];
      if (searchType === 'patient') {
        results = await patientsAPI.search(searchQuery);
      } else if (searchType === 'treatment') {
        results = await treatmentsAPI.getAll();
        // Filter treatments client-side since backend doesn't have search endpoint
        results = results.filter(treatment => 
          treatment.patient_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          treatment.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      setSearchResults(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-slate-200/50 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Search Records</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search Type</label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="patient">Patient Records</option>
              <option value="treatment">Treatment Records</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search Query</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter patient ID or name"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <SearchIcon className="w-4 h-4" />
              <span>{loading ? 'Searching...' : 'Search'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-800">
              Search Results ({searchResults.length} found)
            </h4>
            <div className="grid grid-cols-1 gap-4">
              {searchResults.map((result, idx) => (
                <div key={idx} className="bg-slate-50/50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    {searchType === 'patient' ? (
                      <>
                        <p className="font-semibold text-slate-800">{result.name}</p>
                        <p className="text-sm text-slate-600">
                          ID: {result.id} | Age: {result.age} | Phone: {result.phone}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-slate-800">{result.patient_name}</p>
                        <p className="text-sm text-slate-600">
                          Date: {result.date} | Treatments: {
                            [result.treatment1, result.treatment2, result.treatment3]
                              .filter(t => t).join(', ')
                          }
                        </p>
                      </>
                    )}
                  </div>
                  {searchType === 'patient' && (
                    <button 
                      onClick={() => {
                        setSelectedPatient(result);
                        setCurrentView('view-patient');
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {searchQuery && searchResults.length === 0 && !loading && (
          <div className="text-center py-4 text-slate-600">
            No results found for "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;