// CreatePrescription.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Sidebar from '../components/Sidebar' // Assuming Sidebar component is in the same directory
import Header from '../components/Header'

const CreatePrescription = () => {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)

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
          ? formData.dosages
              .split(',')
              .map((d) => d.trim())
              .map(Number)
          : formData.dosages

      // Prepare form data for submission
      const prescriptionData = {
        name: formData.name,
        age: parseInt(formData.age),
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
        side_effects: [], // Initialize as empty array as per backend requirements
      }

      // If there's an image, handle it (you might want to upload it separately)
      if (formData.prescriptionImage) {
        // For image upload, you would typically use FormData
        // This is a placeholder - implement according to your backend requirements
        console.log(
          'Prescription image attached:',
          formData.prescriptionImage.name
        )

        // Example of how you might handle image upload:
        // const imageFormData = new FormData();
        // imageFormData.append('prescriptionImage', formData.prescriptionImage);
        // await axios.post('http://localhost:3000/upload-prescription-image', imageFormData);
      }
      console.log(prescriptionData)

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
        prescriptionImage: null,
      })
      setUploadedImage(null)
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

                  {/* Added Phone and Email Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="phone"
                      >
                        Phone Number *
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-teal-500"
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="email"
                      >
                        Email Address *
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-teal-500"
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
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

              {/* Submit Button */}
              <div className="flex items-center justify-end mt-6">
                <button
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>
                <button
                  className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePrescription
