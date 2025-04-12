// PatientHistory.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const PatientHistory = () => {
  const { email } = useParams(); // Assuming we're using email to identify the patient
  const navigate = useNavigate();
  
  const [patientRecords, setPatientRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'active', 'completed'
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // Fetch patient history
    const fetchPatientHistory = async () => {
      try {
        // Using the patient email to fetch their records
        const response = await axios.get(`http://localhost:3000/get-prescripts/${email}`);
        setPatientRecords(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching patient history:', err);
        setError('Failed to load patient history. Please try again later.');
        setLoading(false);
      }
    };

    fetchPatientHistory();
  }, [email]);

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate treatment duration
  const getTreatmentDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Filter records based on active tab and search term
  const filteredRecords = patientRecords.filter(record => {
    // First filter by tab
    if (activeTab === 'active' && record.completed) return false;
    if (activeTab === 'completed' && !record.completed) return false;
    
    // Then filter by search term
    if (searchTerm.trim() === '') return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      record.diagnosis.toLowerCase().includes(searchLower) ||
      record.symptoms.some(symptom => symptom.toLowerCase().includes(searchLower)) ||
      record.medication.some(med => med.medicine.toLowerCase().includes(searchLower))
    );
  });

  // Sort records by date (most recent first)
  const sortedRecords = [...filteredRecords].sort(
    (a, b) => new Date(b.medication_start_date) - new Date(a.medication_start_date)
  );

  // Group prescriptions by year and month
  const groupedRecords = sortedRecords.reduce((groups, record) => {
    const date = new Date(record.medication_start_date);
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' });
    const key = `${month} ${year}`;
    
    if (!groups[key]) {
      groups[key] = [];
    }
    
    groups[key].push(record);
    return groups;
  }, {});

  // Get patient info from the first record (if available)
  const patientInfo = patientRecords.length > 0 ? {
    name: patientRecords[0].name,
    age: patientRecords[0].age,
    sex: patientRecords[0].sex,
    email: patientRecords[0].patient_email,
    phone: patientRecords[0].patient_phone
  } : null;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Header setSidebarOpen={() => {}} />
      
      {/* Content area with sidebar and main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 hidden md:block">
          <Sidebar />
        </div>
        
        {/* Main content */}
        <div className="flex-1 overflow-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Patient History</h1>
              <button
                onClick={() => navigate(-1)}
                className="mt-2 md:mt-0 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
              >
                Back
              </button>
            </div>
            
            {loading && <p className="text-gray-500">Loading patient history...</p>}
            
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {!loading && patientInfo && (
              <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="p-6">
                  <h2 className="text-xl font-medium text-gray-900">{patientInfo.name}</h2>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="mt-1 text-base text-gray-900">{patientInfo.age} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Sex</p>
                      <p className="mt-1 text-base text-gray-900">{patientInfo.sex.charAt(0).toUpperCase() + patientInfo.sex.slice(1)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact</p>
                      <p className="mt-1 text-base text-gray-900">{patientInfo.phone}</p>
                      <p className="text-base text-gray-900">{patientInfo.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {!loading && patientRecords.length === 0 && (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">No patient records found.</p>
              </div>
            )}
            
            {!loading && patientRecords.length > 0 && (
              <>
                {/* Filters and search */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex space-x-2 mb-4 md:mb-0">
                      <button
                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                          activeTab === 'all'
                            ? 'bg-teal-100 text-teal-700'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => setActiveTab('all')}
                      >
                        All Records
                      </button>
                      <button
                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                          activeTab === 'active'
                            ? 'bg-teal-100 text-teal-700'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => setActiveTab('active')}
                      >
                        Active
                      </button>
                      <button
                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                          activeTab === 'completed'
                            ? 'bg-teal-100 text-teal-700'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => setActiveTab('completed')}
                      >
                        Completed
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Search diagnoses, symptoms..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <div className="absolute left-3 top-2.5 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Records timeline */}
                <div className="space-y-8">
                  {Object.entries(groupedRecords).map(([dateGroup, records]) => (
                    <div key={dateGroup}>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">{dateGroup}</h3>
                      
                      <div className="space-y-4">
                        {records.map((record) => (
                          <div 
                            key={record._id} 
                            className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 hover:shadow-lg transition-shadow duration-200"
                            style={{ 
                              borderLeftColor: record.completed 
                                ? record.effectiveness >= 7 ? '#10B981' // Green for high effectiveness
                                : record.effectiveness >= 4 ? '#F59E0B' // Yellow for medium
                                : '#EF4444' // Red for low
                                : '#6B7280' // Gray for active
                            }}
                          >
                            <div className="p-5 border-b border-gray-200">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center">
                                    <h4 className="text-lg font-medium text-gray-900">{record.diagnosis}</h4>
                                    {record.completed && (
                                      <span className="ml-2 px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                        Completed
                                      </span>
                                    )}
                                    {!record.completed && new Date(record.medication_end_date) < new Date() && (
                                      <span className="ml-2 px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                        Expired
                                      </span>
                                    )}
                                    {!record.completed && new Date(record.medication_end_date) >= new Date() && (
                                      <span className="ml-2 px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                        Active
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {formatDate(record.medication_start_date)} — {formatDate(record.medication_end_date)}
                                    <span className="ml-2 text-gray-400">
                                      ({getTreatmentDuration(record.medication_start_date, record.medication_end_date)} days)
                                    </span>
                                  </p>
                                </div>
                                <button
                                  onClick={() => navigate(`/prescription/${record._id}`)}
                                  className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                            
                            <div className="px-5 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                  <h5 className="text-sm font-medium text-gray-500 mb-1">Symptoms</h5>
                                  <div className="flex flex-wrap gap-1">
                                    {record.symptoms.map((symptom, index) => (
                                      <span 
                                        key={index} 
                                        className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800"
                                      >
                                        {symptom}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                
                                <div>
                                  <h5 className="text-sm font-medium text-gray-500 mb-1">Medication</h5>
                                  <ul className="text-sm text-gray-700 space-y-1">
                                    {record.medication.map((med, index) => (
                                      <li key={index}>{med.medicine} ({med.dosage} mg)</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                {record.completed && (
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-500 mb-1">Treatment Outcome</h5>
                                    {record.effectiveness > 0 && (
                                      <div className="mb-2">
                                        <div className="flex items-center">
                                          <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                              className={`h-2 rounded-full ${
                                                record.effectiveness >= 7 ? 'bg-green-500'
                                                : record.effectiveness >= 4 ? 'bg-yellow-500'
                                                : 'bg-red-500'
                                              }`}
                                              style={{ width: `${(record.effectiveness / 10) * 100}%` }}
                                            ></div>
                                          </div>
                                          <span className="ml-2 text-xs font-medium text-gray-700">{record.effectiveness}/10</span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {record.side_effects && record.side_effects.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {record.side_effects.map((effect, index) => (
                                          <span 
                                            key={index} 
                                            className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800"
                                          >
                                            {effect}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientHistory;