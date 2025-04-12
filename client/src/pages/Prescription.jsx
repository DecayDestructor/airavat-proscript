// Prescription.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

const Prescription = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [prescription, setPrescription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [completionNote, setCompletionNote] = useState('')
  const [sideEffects, setSideEffects] = useState('')
  const [effectiveness, setEffectiveness] = useState(7) // Default value of 7 (good)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Fetch prescription details
    const fetchPrescriptionDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/get-prescript/${id}`
        )
        setPrescription(response.data)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching prescription details:', err)
        setError('Failed to load prescription details. Please try again later.')
        setLoading(false)
      }
    }

    fetchPrescriptionDetails()
  }, [id])

  // Handle completing the prescription
  const handleCompletePrescription = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Parse side effects from comma-separated string to array
      const sideEffectsArray = sideEffects
        .split(',')
        .map((effect) => effect.trim())
        .filter((effect) => effect.length > 0)

      // Call the API to complete the prescription
      await axios.put(`http://localhost:3000/complete-prescript/${id}`, {
        note: completionNote,
        side_effects: sideEffectsArray,
        effectiveness: parseInt(effectiveness), // Include effectiveness rating
      })

      setSuccess(true)

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/ongoing-prescriptions')
      }, 2000)
    } catch (err) {
      console.error('Error completing prescription:', err)
      setError(
        err.response?.data?.message ||
          'Failed to complete prescription. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Calculate days remaining until end date
  const getDaysRemaining = (endDate) => {
    const today = new Date()
    const end = new Date(endDate)
    const diffTime = end - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

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
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">
                Prescription Details
              </h1>
              <button
                onClick={() => navigate('/ongoing-prescriptions')}
                className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
              >
                Back to Prescriptions
              </button>
            </div>

            {loading && (
              <p className="text-gray-500">Loading prescription details...</p>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                Prescription completed successfully! Redirecting...
              </div>
            )}

            {!loading && prescription && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Patient information header */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-xl font-medium text-gray-900">
                        {prescription.name}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {prescription.age} years,{' '}
                        {prescription.sex.charAt(0).toUpperCase() +
                          prescription.sex.slice(1)}
                      </p>
                      {/* Display contact information if available */}
                      {(prescription.patient_phone ||
                        prescription.patient_email) && (
                        <div className="mt-2 space-y-1">
                          {prescription.patient_phone && (
                            <p className="text-sm flex items-center text-gray-600">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              {prescription.patient_phone}
                            </p>
                          )}
                          {prescription.patient_email && (
                            <p className="text-sm flex items-center text-gray-600">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              {prescription.patient_email}
                            </p>
                          )}
                          {prescription.pregnant && (
                            <p className="text-sm flex items-center text-gray-600">
                              Pregnant
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 md:mt-0">
                      <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {getDaysRemaining(prescription.medication_end_date)}{' '}
                        days remaining
                      </span>
                    </div>
                  </div>
                </div>

                {/* Prescription details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-base font-medium text-gray-900 mb-2">
                        Diagnosis
                      </h3>
                      <p className="text-gray-800">{prescription.diagnosis}</p>
                    </div>
                    {/* Add allergy information it is an array of strings   */}
                    {prescription.allergy && (
                      <div>
                        <h3 className="text-base font-medium text-gray-900 mb-2">
                          Allergies
                        </h3>
                        <p className="text-gray-800">
                          {prescription.allergy.join(', ')}
                        </p>
                      </div>
                    )}

                    <div>
                      <h3 className="text-base font-medium text-gray-900 mb-2">
                        Symptoms
                      </h3>
                      <p className="text-gray-800">
                        {prescription.symptoms.join(', ')}
                      </p>
                    </div>

                    {/* Contact Information Section (only if available) */}
                    {(prescription.patient_phone ||
                      prescription.patient_email) && (
                      <div className="md:col-span-2">
                        <h3 className="text-base font-medium text-gray-900 mb-2">
                          Contact Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Phone
                            </p>
                            <p className="text-gray-800">
                              {prescription.patient_phone || 'Not provided'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Email
                            </p>
                            <p className="text-gray-800">
                              {prescription.patient_email || 'Not provided'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="md:col-span-2">
                      <h3 className="text-base font-medium text-gray-900 mb-2">
                        Medication
                      </h3>
                      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Medicine
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Dosage (mg)
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Frequency
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {prescription.medication.map((med, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {med.medicine}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {med.dosage} mg
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {med.frequency}
                                  {/* {console.log(med)} */}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-medium text-gray-900 mb-2">
                        Start Date
                      </h3>
                      <p className="text-gray-800">
                        {formatDate(prescription.createdAt)}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-base font-medium text-gray-900 mb-2">
                        End Date
                      </h3>
                      <p className="text-gray-800">
                        {formatDate(prescription.medication_end_date)}
                      </p>
                    </div>

                    {prescription.notes && (
                      <div className="md:col-span-2">
                        <h3 className="text-base font-medium text-gray-900 mb-2">
                          Notes
                        </h3>
                        <p className="text-gray-800 bg-gray-50 p-4 rounded-lg border border-gray-200">
                          {prescription.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Complete prescription form */}
                {!prescription.completed && (
                  <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      End Prescription
                    </h3>
                    <form onSubmit={handleCompletePrescription}>
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="completionNote"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Completion Notes{' '}
                            <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            id="completionNote"
                            name="completionNote"
                            rows="3"
                            required
                            className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Add notes about treatment outcome, patient response, etc."
                            value={completionNote}
                            onChange={(e) => setCompletionNote(e.target.value)}
                          ></textarea>
                        </div>

                        {/* Effectiveness Rating */}
                        <div>
                          <label
                            htmlFor="effectiveness"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Treatment Effectiveness (0-10){' '}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1">
                            <div className="flex items-center">
                              <input
                                type="range"
                                id="effectiveness"
                                name="effectiveness"
                                min="0"
                                max="10"
                                step="1"
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                value={effectiveness}
                                onChange={(e) =>
                                  setEffectiveness(e.target.value)
                                }
                              />
                              <span className="ml-3 text-sm font-medium text-gray-700 w-8">
                                {effectiveness}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 px-1 mt-1">
                              <span>Not effective</span>
                              <span>Very effective</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="sideEffects"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Side Effects (if any)
                          </label>
                          <input
                            type="text"
                            name="sideEffects"
                            id="sideEffects"
                            className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Enter side effects separated by commas (e.g., Nausea, Headache, Dizziness)"
                            value={sideEffects}
                            onChange={(e) => setSideEffects(e.target.value)}
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Separate multiple side effects with commas.
                          </p>
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                            onClick={() => navigate('/ongoing-prescriptions')}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                          >
                            {isSubmitting
                              ? 'Completing...'
                              : 'Complete Prescription'}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* If prescription is already completed, show completion details */}
                {prescription.completed && (
                  <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <div className="rounded-md bg-green-50 p-4 mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-green-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">
                            Prescription Completed
                          </h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>
                              This prescription has been marked as completed.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <h3 className="text-base font-medium text-gray-900 mb-2">
                          Completion Notes
                        </h3>
                        <p className="text-gray-800 bg-white p-4 rounded-lg border border-gray-200">
                          {prescription.notes ||
                            'No completion notes provided.'}
                        </p>
                      </div>

                      {/* Display effectiveness rating if available */}
                      {prescription.effectiveness !== undefined && (
                        <div>
                          <h3 className="text-base font-medium text-gray-900 mb-2">
                            Treatment Effectiveness
                          </h3>
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-teal-600 h-2.5 rounded-full"
                                  style={{
                                    width: `${
                                      (prescription.effectiveness / 10) * 100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <span className="ml-3 font-medium">
                                {prescription.effectiveness}/10
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              {prescription.effectiveness >= 8
                                ? 'Very effective treatment'
                                : prescription.effectiveness >= 5
                                ? 'Moderately effective treatment'
                                : 'Less effective treatment'}
                            </p>
                          </div>
                        </div>
                      )}

                      {prescription.side_effects &&
                        prescription.side_effects.length > 0 && (
                          <div
                            className={
                              prescription.effectiveness !== undefined
                                ? ''
                                : 'md:col-span-2'
                            }
                          >
                            <h3 className="text-base font-medium text-gray-900 mb-2">
                              Side Effects Reported
                            </h3>
                            <div className="flex flex-wrap gap-2 bg-white p-4 rounded-lg border border-gray-200">
                              {prescription.side_effects.map(
                                (effect, index) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                                  >
                                    {effect}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Prescription
