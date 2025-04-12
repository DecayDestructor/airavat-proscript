// ExpiredPrescriptions.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const ExpiredPrescriptions = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Fetch expired prescriptions
    const fetchPrescriptions = async () => {
      try {
        // Using the doctor's email - replace 'guga' with the actual logged-in doctor's email
        // In a real app, you'd get this from context/auth state
        const response = await axios.get('http://localhost:3000/get-expired-prescripts-by-doctor/guga');
        setPrescriptions(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching expired prescriptions:', err);
        setError('Failed to load expired prescriptions. Please try again later.');
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate days since expiration
  const getDaysSinceExpiration = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = today - end;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

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
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Expired Prescriptions</h1>
            
            {loading && <p className="text-gray-500">Loading expired prescriptions...</p>}
            
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {!loading && !error && prescriptions.length === 0 && (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">No expired prescriptions found.</p>
              </div>
            )}
            
            {!loading && prescriptions.length > 0 && (
              <div className="grid gap-6 mb-8 md:grid-cols-1">
                {prescriptions.map((prescription) => (
                  <div key={prescription._id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-5 border-b border-gray-200 bg-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-medium text-gray-900">{prescription.name}</h2>
                          <p className="text-sm text-gray-500">
                            {prescription.age} years, {prescription.sex.charAt(0).toUpperCase() + prescription.sex.slice(1)}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Expired {getDaysSinceExpiration(prescription.medication_end_date)} days ago
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-5 py-4 sm:p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Diagnosis</h3>
                          <p className="mt-1 text-sm text-gray-900">{prescription.diagnosis}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Symptoms</h3>
                          <p className="mt-1 text-sm text-gray-900">{prescription.symptoms.join(', ')}</p>
                        </div>
                        
                        <div className="md:col-span-2">
                          <h3 className="text-sm font-medium text-gray-500">Medication</h3>
                          <div className="mt-1 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage (mg)</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {prescription.medication.map((med, index) => (
                                  <tr key={index}>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{med.medicine}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{med.dosage} mg</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        
                        {/* Contact information if available */}
                        {(prescription.patient_phone || prescription.patient_email) && (
                          <div className="md:col-span-2">
                            <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                            <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {prescription.patient_phone && (
                                <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  <span className="text-sm text-gray-900">{prescription.patient_phone}</span>
                                </div>
                              )}
                              {prescription.patient_email && (
                                <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-sm text-gray-900">{prescription.patient_email}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                          <p className="mt-1 text-sm text-gray-900">{formatDate(prescription.createdAt)}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                          <p className="mt-1 text-sm text-gray-900 text-red-600">{formatDate(prescription.medication_end_date)}</p>
                        </div>
                        
                        {prescription.notes && (
                          <div className="md:col-span-2">
                            <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                            <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">{prescription.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="px-5 py-3 bg-gray-50 text-right border-t border-gray-200">
                      <div className="flex justify-end">
                        {/* Action button - can be used to either extend the prescription or view details */}
                        {!prescription.completed ? (
                          <button
                            onClick={() => navigate(`/prescription/${prescription._id}`)}
                            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                          >
                            Complete Prescription
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/prescription/${prescription._id}`)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                          >
                            View Details
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpiredPrescriptions;