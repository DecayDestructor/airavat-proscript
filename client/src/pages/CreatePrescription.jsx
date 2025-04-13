import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const CreatePrescription = () => {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [mlAnalysisResult, setMlAnalysisResult] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    sex: 'Male',
    phone: '',
    email: '',
    doctor: '',
    symptoms: '',
    diagnosis: '',
    medicines: '',
    dosages: '',
    medication_end_date: '',
    notes: '',
    allergy: '',
    frequency: '',
    pregnant: 'No',
    prescriptionImage: null,
  })

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, prescriptionImage: file })
      setUploadedImage(URL.createObjectURL(file))
    }
  }

  // Separate ML Analysis function for backend compatibility
  const handleMLAnalysis = async () => {
    try {
      const payload = {
        patient_name: formData.name,
        age: parseInt(formData.age) || 0,
        sex: formData.sex,
        condition: formData.diagnosis,
        drugs: formData.medicines, 
        dosage: formData.dosages, 
        frequency: formData.frequency, 
        allergy: formData.allergy || '', 
        pregnancy_category: formData.pregnant === 'Yes' ? 1 : 0,
      }

      console.log('Sending payload to ML service:', payload)
      const response = await axios.post(
        'http://localhost:8000/check-prescription',
        payload
      )
      console.log('ML analysis response:', response.data)
      return response.data
    } catch (err) {
      console.error('ML Analysis error:', err)
      // Don't throw here, just return the error to handle in calling function
      return { error: err.message || 'Error in ML analysis' }
    }
  }

  // Function to determine severity based on flag value
  const getSeverityColor = (flag) => {
    if (flag === 0) return 'text-green-600';
    if (flag <= 0.3) return 'text-yellow-600';
    if (flag <= 0.7) return 'text-orange-600';
    return 'text-red-600';
  }

  // Function to get recommendation text color
  const getRecommendationColor = (text) => {
    if (text.includes('High')) return 'text-red-600';
    if (text.includes('Low')) return 'text-blue-600';
    return 'text-yellow-600';
  }

  // Request prescription analysis - DEBUGGING VERSION
  const handleAnalyzeClick = async (e) => {
    e.preventDefault() // Prevent form submission
   
    try {
      // Clear previous errors and results
      setError(null)
      setMlAnalysisResult(null)
      
      // Validate required fields
      if (!formData.email) {
        setError('Please fill in email before analyzing')
        return
      }
      if (!formData.symptoms) {
        setError('Please fill in symptoms before analyzing')
        return
      }
      if (!formData.diagnosis) {
        setError('Please fill in diagnosis before analyzing')
        return
      }
      if (!formData.medicines) {
        setError('Please fill in medicines before analyzing')
        return
      }  
       
      // Set analyzing state to true
      setAnalyzing(true)
      
      // Only run ML analysis if all required data is available
      if (formData.medicines && formData.dosages && formData.frequency) {
        try {
          const payload = {
            patient_name: formData.name || 'Unknown',
            age: parseInt(formData.age) || 0,
            sex: formData.sex || 'Unknown',
            condition: formData.diagnosis || 'Unknown',
            drugs: formData.medicines || '', 
            dosage: formData.dosages || '', 
            frequency: formData.frequency || '', 
            allergy: formData.allergy || '', 
            pregnancy_category: formData.pregnant === 'Yes' ? 1 : 0,
          }
  
          console.log('ML analysis payload:', JSON.stringify(payload))
          
          // Use a try/catch specifically for this API call
          try {
            console.log('Making API call to check-prescription')
            const response = await axios.post(
              'http://localhost:8000/check-prescription',
              payload
            )
            console.log('ML analysis response:', response.data)
            setMlAnalysisResult(response.data)
          } catch (mlError) {
            console.error('ML API call failed:', mlError.message)
            setError(`ML Analysis Error: ${mlError.message}`)
          }
        } catch (prepError) {
          console.error('Error preparing ML analysis:', prepError.message)
          setError(`Error preparing data: ${prepError.message}`)
        }
      } else {
        console.log('Skipping ML analysis due to missing data')
        setError('Please provide medicines, dosages, and frequency to perform analysis')
      }
      
      // Try the prescription analysis API regardless of ML results
      console.log('Preparing data for prescription analysis')
      try {
        const symptoms = 
          typeof formData.symptoms === 'string' && formData.symptoms
            ? formData.symptoms.split(',').map((s) => s.trim())
            : [formData.symptoms || 'Unknown']
  
        const medicines =
          typeof formData.medicines === 'string' && formData.medicines
            ? formData.medicines.split(',').map((m) => m.trim())
            : [formData.medicines || 'Unknown']
  
        const dosages =
          typeof formData.dosages === 'string' && formData.dosages
            ? formData.dosages.split(',').map((d) => d.trim()).map(d => Number(d) || 0)
            : [0]
  
        const frequency =
          typeof formData.frequency === 'string' && formData.frequency
            ? formData.frequency.split(',').map((f) => f.trim()).map(f => Number(f) || 0)
            : [0]
  
        console.log('Converted data:')
        console.log('- Symptoms:', JSON.stringify(symptoms))
        console.log('- Medicines:', JSON.stringify(medicines))
        console.log('- Dosages:', JSON.stringify(dosages))
        console.log('- Frequency:', JSON.stringify(frequency))
  
        // Create medication array for analysis
        const currentPrescription = []
        if (Array.isArray(medicines)) {
          for (let i = 0; i < medicines.length; i++) {
            currentPrescription.push({
              medicine: medicines[i],
              dosage: (Array.isArray(dosages) && i < dosages.length) ? dosages[i] : 0,
              frequency: (Array.isArray(frequency) && i < frequency.length) ? frequency[i] : 0,
            })
          }
        }
  
        console.log('Current prescription data:', JSON.stringify(currentPrescription))
        
        // Prepare the API payload
        const apiPayload = {
          currentPrescription,
          symptoms,
          diagnosis: formData.diagnosis || 'Unknown',
        }
        
        console.log('Prescription analysis payload:', JSON.stringify(apiPayload))
        
        // Make the prescription analysis API call
        const apiUrl = `http://localhost:3000/prescription-analysis/${formData.email}`
        console.log(`Making API call to: ${apiUrl}`)
        
        try {
          const response = await axios.post(apiUrl, apiPayload)
          console.log('Prescription analysis response received')
          console.log('Response status:', response.status)
          console.log('Response data:', JSON.stringify(response.data))
  
          if (response.data) {
            setAnalysisResult(response.data)
          } else {
            console.log('Empty response from server')
            setError('Received empty response from analysis server')
          }
        } catch (apiError) {
          // Detailed API error handling
          console.error('API call failed:', apiError.message)
          
          if (apiError.response) {
            console.error('Server error status:', apiError.response.status)
            console.error('Server error data:', JSON.stringify(apiError.response.data))
            setError(`Server error (${apiError.response.status}): ${apiError.response.data?.message || JSON.stringify(apiError.response.data)}`)
          } else if (apiError.request) {
            console.error('No response received from server')
            setError('Cannot connect to the server. Please check if the server is running at http://localhost:3000')
          } else {
            console.error('Request setup error:', apiError.message)
            setError(`Error: ${apiError.message}`)
          }
        }
      } catch (dataError) {
        console.error('Error processing data:', dataError.message)
        setError(`Error preparing data: ${dataError.message}`)
      }
    } catch (outerError) {
      console.error('Unexpected error in analyze process:', outerError.message)
      setError(`Unexpected error: ${outerError.message}`)
    } finally {
      console.log('Analysis process completed, setting analyzing state to false')
      setAnalyzing(false)
    }
  }

  // Handle send via email
  const handleSendEmail = () => {
    // This would typically connect to your backend email service
    alert('Prescription email functionality would be implemented here')
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Convert symptoms, medicines, dosages to arrays if they're strings
      const symptoms =
        typeof formData.symptoms === 'string'
          ? formData.symptoms.split(',').map((s) => s.trim())
          : formData.symptoms

      const medicines =
        typeof formData.medicines === 'string'
          ? formData.medicines.split(',').map((m) => m.trim())
          : formData.medicines

      const dosages =
        typeof formData.dosages === 'string'
          ? formData.dosages.split(',').map((d) => d.trim()).map(Number)
          : formData.dosages
          
      const frequency =
        typeof formData.frequency === 'string'
          ? formData.frequency.split(',').map((d) => d.trim()).map(Number)
          : formData.frequency

      // Prepare form data for submission
      const prescriptionData = {
        name: formData.name,
        age: parseInt(formData.age) || 0,
        sex: formData.sex,
        phone: formData.phone,
        email: formData.email,
        doctor: '67fa571f278672962c7d12e8',
        symptoms,
        diagnosis: formData.diagnosis,
        medicines,
        dosages,
        medication_end_date: formData.medication_end_date,
        notes: formData.notes,
        allergy: formData.allergy,
        frequency,
        pregnant: formData.pregnant === 'Yes',
        side_effects: [], // Initialize as empty array as per backend requirements
      }

      // If there's an image, handle it (you might want to upload it separately)
      if (formData.prescriptionImage) {
        console.log('Prescription image attached:', formData.prescriptionImage.name)
      }
      
      console.log('Sending prescription data:', prescriptionData)

      // Make API call to create prescription using axios
      const response = await axios.post(
        'http://localhost:3000/create-prescript',
        prescriptionData
      )

      console.log('Prescription created:', response.data)

      // Show success message and reset form
      setSuccess(true)
      setFormData({
        name: '',
        age: '',
        sex: 'Male',
        phone: '',
        email: '',
        doctor: '67fa571f278672962c7d12e8',
        symptoms: '',
        diagnosis: '',
        medicines: '',
        dosages: '',
        medication_end_date: '',
        notes: '',
        allergy: '',
        frequency: '',
        pregnant: 'No',
        prescriptionImage: null,
      })
      setUploadedImage(null)
      setAnalysisResult(null)
      setMlAnalysisResult(null)
    } catch (err) {
      console.error('Error creating prescription:', err)
      setError(
        err.response?.data?.message ||
          err.message ||
          'An error occurred while creating the prescription'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen ">
      <Header setSidebarOpen={() => {}} />
      {/* Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 hidden md:block">
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <div className="py-6 px-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              Create Prescription
            </h1>

            {/* Success message */}
            {success && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                Prescription created successfully! Redirecting...
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Information */}
                <div className="col-span-2">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Patient Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="mb-4">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="name"
                      >
                        Patient Name*
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-teal-500"
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Patient Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="age"
                      >
                        Age*
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-teal-500"
                        id="age"
                        name="age"
                        type="number"
                        placeholder="Age"
                        min="0"
                        max="120"
                        value={formData.age}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="sex"
                      >
                        Sex*
                      </label>
                      <select
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-teal-500"
                        id="sex"
                        name="sex"
                        value={formData.sex}
                        onChange={handleChange}
                        required
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Phone and Email Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="phone"
                      >
                        Phone Number*
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-teal-500"
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="email"
                      >
                        Email Address*
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-teal-500"
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="col-span-2">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Medical Information
                  </h2>

                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="symptoms"
                    >
                      Symptoms*
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-teal-500"
                      id="symptoms"
                      name="symptoms"
                      type="text"
                      placeholder="Enter symptoms separated by commas (e.g., Fever, Cough, Headache)"
                      value={formData.symptoms}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="diagnosis"
                    >
                      Diagnosis*
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-teal-500"
                      id="diagnosis"
                      name="diagnosis"
                      type="text"
                      placeholder="Diagnosis"
                      value={formData.diagnosis}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Added allergies field */}
                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="allergy"
                    >
                      Allergies
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-teal-500"
                      id="allergy"
                      name="allergy"
                      type="text"
                      placeholder="Enter any known allergies"
                      value={formData.allergy}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Added pregnancy field */}
                  {formData.sex === 'Female' && (
                    <div className="mb-4">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="pregnant"
                      >
                        Pregnancy Status
                      </label>
                      <select
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-teal-500"
                        id="pregnant"
                        name="pregnant"
                        value={formData.pregnant}
                        onChange={handleChange}
                      >
                        <option value="No">Not Pregnant</option>
                        <option value="Yes">Pregnant</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Medication Information */}
                <div className="col-span-2">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Medication Information
                  </h2>

                  <div className="flex flex-wrap -mx-2">
                    <div className="w-full md:w-1/2 px-2 mb-4">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="medicines"
                      >
                        Medicines*
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-teal-500"
                        id="medicines"
                        name="medicines"
                        type="text"
                        placeholder="Enter medicines separated by commas (e.g., Paracetamol, Ibuprofen)"
                        value={formData.medicines}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="w-full md:w-1/2 px-2 mb-4">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="dosages"
                      >
                        Dosages (mg)*
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-teal-500"
                        id="dosages"
                        name="dosages"
                        type="text"
                        placeholder="Enter dosages in mg separated by commas (e.g., 500, 200)"
                        value={formData.dosages}
                        onChange={handleChange}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Note: Dosages exceeding 100mg will be capped at 100mg
                      </p>
                    </div>
                  </div>

                  {/* Added frequency field */}
                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="frequency"
                    >
                      Frequency*
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-teal-500"
                      id="frequency"
                      name="frequency"
                      type="text"
                      placeholder="Medication frequency (e.g., 2, 3)"
                      value={formData.frequency}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="medication_end_date"
                    >
                      Medication End Date*
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-teal-500"
                      id="medication_end_date"
                      name="medication_end_date"
                      type="date"
                      value={formData.medication_end_date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="col-span-2">
                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="notes"
                    >
                      Notes
                    </label>
                    <textarea
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-teal-500"
                      id="notes"
                      name="notes"
                      rows="3"
                      placeholder="Additional notes or instructions (optional)"
                      value={formData.notes}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>

                {/* Prescription Image Upload */}
                <div className="col-span-2">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Upload Prescription Image
                  </h2>
                  <div className="mb-4">
                    <div className="flex items-center justify-center w-full">
                      <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-teal-500 rounded-lg shadow-lg tracking-wide uppercase border border-teal-500 cursor-pointer hover:bg-teal-500 hover:text-white">
                        <svg
                          className="w-8 h-8"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                        >
                          <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
                        </svg>
                        <span className="mt-2 text-base leading-normal">
                          Upload Written Prescription
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>

                    {/* Image preview */}
                    {uploadedImage && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Preview:</p>
                        <img
                          src={uploadedImage}
                          alt="Prescription preview"
                          className="max-w-full h-auto max-h-48 border rounded"
                        />
                      </div>
                    )}

                    <div className="mt-3 text-sm text-gray-600">
                      <p>Please ensure that the handwritten prescription is:</p>
                      <ul className="list-disc list-inside mt-1">
                        <li>Written clearly in block letters</li>
                        <li>Well-lit and properly focused</li>
                        <li>
                          Contains all medication details, including dosages
                        </li>
                        <li>Follows the standard prescription format</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between mt-6">
                <div className="mb-4 md:mb-0">
                  {/* Analyze Button - FIXED with proper onClick handler */}
                  <button
                    className="bg-teal-500 hover:bg-teal-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                    type="button"
                    onClick={handleAnalyzeClick}
                    disabled={analyzing}
                  >
                    {analyzing ? 'Analyzing...' : 'Analyze Prescription'}
                  </button>

                  {/* Send Email Button */}
                  <button
                    className="bg-teal-500 hover:bg-teal-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="button"
                    onClick={handleSendEmail}
                  >
                    Send via Email
                  </button>
                </div>

                <div>
                  {/* Cancel Button */}
                  <button
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline"
                    type="button"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </button>

                  {/* Submit Button */}
                  <button
                    className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Prescription'}
                  </button>
                </div>
              </div>
            </form>

            {/* Analysis Results Section - Moved to Bottom */}
            {(mlAnalysisResult || analysisResult) && (
              <div className="mt-8 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Prescription Analysis Results
                </h2>
                
                {/* ML Analysis Result */}
                {mlAnalysisResult && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-300 text-blue-800 rounded">                
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-semibold mb-2">ML Safety Assessment:</h4>
                        <div className="bg-white p-3 rounded shadow-sm">
                          <div className="flex justify-between items-center mb-2 border-b pb-1">
                            <span className="font-medium">Overall Risk:</span>
                            <span className={`font-bold ${getSeverityColor(mlAnalysisResult.flag)}`}>
                              {(mlAnalysisResult.flag * 100).toFixed(1)}%
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex justify-between">
                              <span>Age Risk:</span>
                              <span className={getSeverityColor(mlAnalysisResult.age_flag)}>
                                {mlAnalysisResult.age_flag ? 'Yes' : 'No'}
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span>Allergy Risk:</span>
                              <span className={getSeverityColor(mlAnalysisResult.allergy_flag)}>
                                {mlAnalysisResult.allergy_flag ? 'Yes' : 'No'}
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span>Dosage Risk:</span>
                              <span className={getSeverityColor(mlAnalysisResult.dosage_flag)}>
                                {mlAnalysisResult.dosage_flag ? 'Yes' : 'No'}
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span>Drug Risk:</span>
                              <span className={getSeverityColor(mlAnalysisResult.drugs_flag)}>
                                {mlAnalysisResult.drugs_flag ? 'Yes' : 'No'}
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span>Frequency Risk:</span>
                              <span className={getSeverityColor(mlAnalysisResult.frequency_flag)}>
                                {mlAnalysisResult.frequency_flag ? 'Yes' : 'No'}
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span>Pregnancy Risk:</span>
                              <span className={getSeverityColor(mlAnalysisResult.pregnancy_flag)}>
                                {mlAnalysisResult.pregnancy_flag ? 'Yes' : 'No'}
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span>Sex-related Risk:</span>
                              <span className={getSeverityColor(mlAnalysisResult.sex_flag)}>
                                {mlAnalysisResult.sex_flag ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Safety Recommendations:</h4>
                        {mlAnalysisResult.messages && mlAnalysisResult.messages.length > 0 ? (
                          <div className="bg-white p-3 rounded shadow-sm">
                            <ul className="list-disc pl-5 space-y-2">
                              {mlAnalysisResult.messages.map((message, index) => (
                                <li key={index} className={getRecommendationColor(message)}>
                                  {message}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="bg-white p-3 rounded shadow-sm text-green-600">
                            <p>No recommendations - all parameters within safe ranges.</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3 bg-white p-3 rounded shadow-sm">
                      <h4 className="font-semibold mb-2">Clinical Significance:</h4>
                      <p className="text-sm">
                        {mlAnalysisResult.flag === 0 
                          ? "The prescription appears to be safe with no significant risks detected."
                          : mlAnalysisResult.flag < 0.3
                            ? "Low risk detected. Consider the recommendations for optimizing this prescription."
                            : mlAnalysisResult.flag < 0.7
                              ? "Moderate risk detected. Carefully review the recommendations before proceeding."
                              : "High risk detected. Strongly consider alternative medications or dosages."
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* Patient History Analysis */}
                {analysisResult && (
                  <div className={`mb-4 p-4 ${mlAnalysisResult ? 'bg-gray-50 border border-gray-300 text-gray-800' : 'bg-teal-50 border border-teal-300 text-teal-800'} rounded`}>
                    <h4 className="font-semibold mb-2">Patient History Analysis:</h4>
                    {analysisResult.ai_insight ? (
                      <div>
                        <p className="mb-2">{analysisResult.ai_insight}</p>
                        {analysisResult.similar_cases && analysisResult.similar_cases.length > 0 && (
                          <p className="text-sm text-gray-600">
                            Based on {analysisResult.similar_cases.length} similar case(s) in patient history.
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        {analysisResult.message || "No similar historical prescriptions found for this patient."}
                      </p>
                    )}
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

export default CreatePrescription