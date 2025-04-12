// OngoingPrescriptions.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const OngoingPrescriptions = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [isCompletingPrescription, setIsCompletingPrescription] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [sideEffects, setSideEffects] = useState('');
  const [completionNote, setCompletionNote] = useState('');
  
  useEffect(() => {
    // Fetch ongoing prescriptions
    const fetchPrescriptions = async () => {
      try {
        // Using the doctor's email - replace 'guga' with the actual logged-in doctor's email
        // In a real app, you'd get this from context/auth state
        const response = await axios.get('http://localhost:3000/get-prescripts-not-expired-by-doctor/guga');
        setPrescriptions(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
        setError('Failed to load prescriptions. Please try again later.');
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  // Open the completion modal for a prescription
  const openCompletionModal = (prescription) => {
    setSelectedPrescription(prescription);
    setCompletionNote('');
    setSideEffects('');
    setIsCompletingPrescription(true);
  };

  // Close the completion modal
  const closeCompletionModal = () => {
    setIsCompletingPrescription(false);
    setSelectedPrescription(null);
  };

  // Handle marking a prescription as complete
  const handleCompletePrescription = async () => {
    if (!selectedPrescription) return;
    
    try {
      setLoading(true);
      
      // Parse side effects from comma-separated string to array
      const sideEffectsArray = sideEffects.split(',')
        .map(effect => effect.trim())
        .filter(effect => effect.length > 0);
      
      await axios.put(`http://localhost:3000/complete-prescript/${selectedPrescription._id}`, {
        note: completionNote,
        side_effects: sideEffectsArray
      });
      
      // Close the modal
      closeCompletionModal();
      
      // Refresh the list after completing
      const response = await axios.get('http://localhost:3000/get-prescripts-not-expired-by-doctor/guga');
      setPrescriptions(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error completing prescription:', err);
      setError('Failed to complete prescription. Please try again.');
      setLoading(false);
    }
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate days remaining until end date
  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
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
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Ongoing Prescriptions</h1>
            
            {loading && <p className="text-gray-500">Loading prescriptions...</p>}
            
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {!loading && !error && prescriptions.length === 0 && (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">No ongoing prescriptions found.</p>
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
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            {getDaysRemaining(prescription.medication_end_date)} days left
                          </span>
                          <button 
                            onClick={() => openCompletionModal(prescription)}
                            className="px-3 py-1 bg-teal-500 text-white text-xs rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          >
                            Complete
                          </button>
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
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                          <p className="mt-1 text-sm text-gray-900">{formatDate(prescription.medication_end_date)}</p>
                        </div>
                        
                        {prescription.notes && (
                          <div className="md:col-span-2">
                            <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                            <p className="mt-1 text-sm text-gray-900">{prescription.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="px-5 py-3 bg-gray-50 text-right border-t border-gray-200">
                      <button
                        onClick={() => navigate(`/prescription/${prescription._id}`)}
                        className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded"
                      >
                        View Full Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Completion Modal */}
      {isCompletingPrescription && selectedPrescription && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Complete Prescription
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        You are completing the prescription for <span className="font-medium">{selectedPrescription.name}</span>.
                        Please add any notes and side effects observed during the treatment.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="completionNote">
                      Completion Note
                    </label>
                    <textarea
                      id="completionNote"
                      rows="3"
                      className="shadow-sm focus:ring-teal-500 focus:border-teal-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Add notes about treatment outcome"
                      value={completionNote}
                      onChange={(e) => setCompletionNote(e.target.value)}
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="sideEffects">
                      Side Effects (if any)
                    </label>
                    <input
                      type="text"
                      id="sideEffects"
                      className="shadow-sm focus:ring-teal-500 focus:border-teal-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Enter side effects separated by commas (e.g., Nausea, Headache)"
                      value={sideEffects}
                      onChange={(e) => setSideEffects(e.target.value)}
                    />
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={handleCompletePrescription}
                    >
                      Complete Prescription
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={closeCompletionModal}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OngoingPrescriptions;