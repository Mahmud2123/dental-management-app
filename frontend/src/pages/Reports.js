import React, { useState } from 'react';
import { Printer, Users, FileText, CreditCard } from 'lucide-react';
import { reportsAPI } from '../services/api';

const Reports = () => {
  const [reportType, setReportType] = useState('patients');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reportTypes = [
    { id: 'patients', title: 'Patient Report', description: 'Complete list of all patients', icon: Users },
    { id: 'treatments', title: 'Treatment Report', description: 'All treatments performed', icon: FileText },
    { id: 'payments', title: 'Payment Report', description: 'Financial transactions', icon: CreditCard }
  ];

  const generateReport = async () => {
    setLoading(true);
    setError('');

    try {
      let data = [];
      switch (reportType) {
        case 'patients':
          data = await reportsAPI.patients(startDate, endDate);
          break;
        case 'treatments':
          data = await reportsAPI.treatments(startDate, endDate);
          break;
        case 'payments':
          data = await reportsAPI.payments(startDate, endDate);
          break;
        default:
          break;
      }
      setReportData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (reportData.length === 0) return;

    const headers = Object.keys(reportData[0]);
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => 
        headers.map(header => 
          `"${row[header] || ''}"`
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => (
          <div 
            key={report.id} 
            className={`bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-slate-200/50 shadow-lg cursor-pointer transition-all ${
              reportType === report.id ? 'ring-2 ring-blue-500' : 'hover:shadow-xl'
            }`}
            onClick={() => setReportType(report.id)}
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
                <report.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{report.title}</h3>
                <p className="text-sm text-slate-600">{report.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-slate-200/50 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Generate {reportTypes.find(r => r.id === reportType)?.title}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={generateReport}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>{loading ? 'Generating...' : 'Generate'}</span>
            </button>
            
            {reportData.length > 0 && (
              <button
                onClick={exportToCSV}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-green-700 transition-all"
              >
                Export CSV
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {reportData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  {Object.keys(reportData[0]).map((key) => (
                    <th key={key} className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {key.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {reportData.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, i) => (
                      <td key={i} className="px-4 py-2 text-sm text-slate-600">
                        {value || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportData.length === 0 && !loading && (
          <div className="text-center py-8 text-slate-600">
            No report data available. Generate a report to view data.
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;