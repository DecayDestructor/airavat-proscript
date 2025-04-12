// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dashboard data
  const [activePrescriptions, setActivePrescriptions] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [expiringSoon, setExpiringSoon] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        // Using the doctor's email - replace 'guga' with the actual logged-in doctor's email
        const doctorEmail = 'guga'; // This should come from your auth context or similar

        // Get active prescriptions (not expired, not completed)
        const activePrescriptionsResponse = await axios.get(
          `http://localhost:3000/get-prescripts-not-expired-by-doctor/${doctorEmail}`
        );
        
        // Get all prescriptions to calculate total unique patients
        const allPrescriptionsResponse = await axios.get(
          `http://localhost:3000/get-prescripts-by-doctor/${doctorEmail}`
        );
        
        // Process data
        const activePrescs = activePrescriptionsResponse.data;
        const allPrescs = allPrescriptionsResponse.data;
        
        // Store active prescriptions
        setActivePrescriptions(activePrescs);
        
        // Calculate total unique patients
        const uniquePatients = new Set();
        allPrescs.forEach(prescription => {
          uniquePatients.add(prescription.patient_email);
        });
        setTotalPatients(uniquePatients.size);
        
        // Calculate prescriptions expiring soon (in the next 7 days)
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        const expiring = activePrescs.filter(prescription => {
          const endDate = new Date(prescription.medication_end_date);
          return endDate <= nextWeek && endDate >= today;
        });
        
        setExpiringSoon(expiring);
        
        // Create recent activity list
        // We'll combine and sort the most recent events (newest first)
        const sortedActivity = [...allPrescs]
          .sort((a, b) => new Date(b.createdAt || b.medication_start_date) - new Date(a.createdAt || a.medication_start_date))
          .slice(0, 10) // Get the 10 most recent activities
          .map(prescription => {
            // Determine the action and status
            let action, status;
            const endDate = new Date(prescription.medication_end_date);
            
            if (prescription.completed) {
              action = 'Prescription completed';
              status = 'Completed';
            } else if (endDate < today) {
              action = 'Prescription expired';
              status = 'Expired';
            } else {
              action = 'Prescription created';
              status = 'Active';
            }
            
            // Format the time
            const date = new Date(prescription.createdAt || prescription.medication_start_date);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            
            let timeAgo;
            if (diffDays > 0) {
              timeAgo = diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
            } else if (diffHours > 0) {
              timeAgo = `${diffHours} hours ago`;
            } else if (diffMinutes > 0) {
              timeAgo = `${diffMinutes} minutes ago`;
            } else {
              timeAgo = 'Just now';
            }
            
            return {
              id: prescription._id,
              patient: prescription.name,
              action,
              time: timeAgo,
              status,
              diagnosis: prescription.diagnosis,
              date // Keep the original date for sorting
            };
          });
        
        setRecentActivity(sortedActivity);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <Header setSidebarOpen={() => setSidebarOpen(true)} />
      
      {/* Main Content */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar for mobile */}
        <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`} role="dialog" aria-modal="true">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50" 
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          ></div>
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Sidebar mobile={true} />
          </div>
        </div>

        {/* Static sidebar for desktop */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 h-full border-r border-gray-200">
            <Sidebar />
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Welcome section with gradient background */}
            <div className="mb-8 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg shadow-lg p-6 text-white">
              <h2 className="text-3xl font-bold">{getGreeting()}, Doctor</h2>
              <p className="mt-2 text-teal-100">
                Here's what's happening with your patients today.
              </p>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 border-t-teal-500 animate-spin"></div>
                <p className="text-center text-gray-600">Loading your dashboard...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && (
              <>
                {/* Dashboard Summary Cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                  {/* Active Prescriptions Card */}
                  <div className="bg-white overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
                    <div className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-md">
                          <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="ml-5">
                          <p className="text-gray-500 text-sm">Active Prescriptions</p>
                          <div className="flex items-baseline">
                            <p className="text-2xl font-semibold text-gray-800">{activePrescriptions.length}</p>
                            <p className="ml-2 text-sm text-gray-600">prescriptions</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Link to="/ongoing-prescriptions" className="text-teal-600 hover:text-teal-700 font-medium text-sm inline-flex items-center">
                          View details
                          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Patients Card */}
                  <div className="bg-white overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
                    <div className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-md">
                          <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div className="ml-5">
                          <p className="text-gray-500 text-sm">Total Patients</p>
                          <div className="flex items-baseline">
                            <p className="text-2xl font-semibold text-gray-800">{totalPatients}</p>
                            <p className="ml-2 text-sm text-gray-600">patients</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Link to="/patient-list" className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center">
                          View details
                          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Expiring Soon Card */}
                  <div className="bg-white overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
                    <div className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md">
                          <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-5">
                          <p className="text-gray-500 text-sm">Expiring Soon</p>
                          <div className="flex items-baseline">
                            <p className="text-2xl font-semibold text-gray-800">{expiringSoon.length}</p>
                            <p className="ml-2 text-sm text-gray-600">prescriptions</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Link to="/ongoing-prescriptions" className="text-amber-600 hover:text-amber-700 font-medium text-sm inline-flex items-center">
                          View details
                          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to="/create-prescription" className="flex flex-col items-center p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors">
                      <div className="p-2 bg-teal-100 rounded-full text-teal-600 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">New Prescription</span>
                    </Link>
                    
                    <Link to="/patient-list" className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                      <div className="p-2 bg-blue-100 rounded-full text-blue-600 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">View Patients</span>
                    </Link>
                    
                    <Link to="/ongoing-prescriptions" className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                      <div className="p-2 bg-indigo-100 rounded-full text-indigo-600 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Active Treatments</span>
                    </Link>
                    
                    <Link to="/expired-prescriptions" className="flex flex-col items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                      <div className="p-2 bg-red-100 rounded-full text-red-600 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Expired Treatments</span>
                    </Link>
                  </div>
                </div>

                {/* Recent Activity Section */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
                  </div>
                  
                  {recentActivity.length === 0 ? (
                    <div className="py-10 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                      </svg>
                      <p className="mt-2 text-gray-500">No recent activity found.</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {recentActivity.map((activity) => (
                        <li key={activity.id + activity.action} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                activity.status === 'Active' ? 'bg-green-100 text-green-600' : 
                                activity.status === 'Expired' ? 'bg-red-100 text-red-600' :
                                'bg-blue-100 text-blue-600'
                              }`}>
                                {activity.status === 'Active' && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                                {activity.status === 'Expired' && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                                {activity.status === 'Completed' && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">{activity.patient}</p>
                                <p className="text-sm text-gray-500">{activity.time}</p>
                              </div>
                              <div className="mt-1">
                                <p className="text-sm text-gray-600">
                                  {activity.action} - <span className="font-medium">{activity.diagnosis}</span>
                                </p>
                              </div>
                            </div>
                            <div className="ml-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                activity.status === 'Active' ? 'bg-green-100 text-green-800' :
                                activity.status === 'Expired' ? 'bg-red-100 text-red-800' :
                                activity.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {activity.status}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                    <div className="text-sm">
                      <Link to="/patient-list" className="font-medium text-gray-700 hover:text-gray-900 inline-flex items-center">
                        View all patient history
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;