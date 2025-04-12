// PatientList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const PatientList = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'

  useEffect(() => {
    // Fetch all prescriptions to extract unique patients
    const fetchPatients = async () => {
      try {
        // Using the doctor's email - replace 'guga' with the actual logged-in doctor's email
        const response = await axios.get('http://localhost:3000/get-prescripts-by-doctor/guga');
        
        // Process prescriptions to extract unique patients with their most recent prescriptions
        const patientMap = new Map();
        
        response.data.forEach(prescription => {
          const email = prescription.patient_email;
          
          if (!patientMap.has(email) || 
              new Date(patientMap.get(email).lastVisit) < new Date(prescription.medication_start_date)) {
            
            const hasActivePrescription = new Date(prescription.medication_end_date) >= new Date() && !prescription.completed;
            
            patientMap.set(email, {
              id: prescription._id,
              name: prescription.name,
              age: prescription.age,
              sex: prescription.sex,
              email: prescription.patient_email,
              phone: prescription.patient_phone,
              lastVisit: prescription.medication_start_date,
              lastDiagnosis: prescription.diagnosis,
              hasActive: hasActivePrescription || patientMap.get(email)?.hasActive || false,
              hasCompleted: prescription.completed || patientMap.get(email)?.hasCompleted || false
            });
          }
        });
        
        // Convert map to array and sort by most recent visit
        const patientList = Array.from(patientMap.values()).sort(
          (a, b) => new Date(b.lastVisit) - new Date(a.lastVisit)
        );
        
        setPatients(patientList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patient list. Please try again later.');
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter patients based on search term and active filter
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = searchTerm.trim() === '' || (
      (patient.name && patient.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.phone && patient.phone.includes(searchTerm)) ||
      (patient.lastDiagnosis && patient.lastDiagnosis.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && patient.hasActive;
    if (filter === 'completed') return matchesSearch && patient.hasCompleted && !patient.hasActive;
    
    return matchesSearch;
  });

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
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Patient History</h1>
            
            {/* Search and filters */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex space-x-2 mb-4 md:mb-0">
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      filter === 'all'
                        ? 'bg-teal-100 text-teal-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setFilter('all')}
                  >
                    All Patients
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      filter === 'active'
                        ? 'bg-teal-100 text-teal-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setFilter('active')}
                  >
                    With Active Prescriptions
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      filter === 'completed'
                        ? 'bg-teal-100 text-teal-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setFilter('completed')}
                  >
                    Past Patients
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Search patients..."
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
            
            {loading && <p className="text-gray-500">Loading patients...</p>}
            
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {!loading && filteredPatients.length === 0 && (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">No patients found matching your criteria.</p>
              </div>
            )}
            
            {!loading && filteredPatients.length > 0 && (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Information
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Visit
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">View</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPatients.map((patient) => (
                      <tr 
                        key={patient.email || patient.id || Math.random().toString()}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/patient-history/${patient.email}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-teal-100 flex items-center justify-center">
                              <span className="text-teal-800 font-medium">
                                {patient.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {patient.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {patient.age} years, {patient.sex.charAt(0).toUpperCase() + patient.sex.slice(1)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{patient.phone || "No phone"}</div>
                          <div className="text-sm text-gray-500">{patient.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(patient.lastVisit)}</div>
                          <div className="text-sm text-gray-500">{patient.lastDiagnosis}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {patient.hasActive && (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                          {!patient.hasActive && patient.hasCompleted && (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Past Patient
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/patient-history/${patient.email}`);
                            }}
                            className="text-teal-600 hover:text-teal-900"
                          >
                            View History
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientList;