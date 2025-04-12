// VerifyDoctor.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VerifyDoctor = () => {
  const navigate = useNavigate();
  
  // Get doctorId from localStorage (set during login)
  const doctorId = localStorage.getItem('doctorId') || "67fa571f278672962c7d12e8"; // Fallback to hardcoded ID
 
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    licenseNumber: '',
    licenseType: 'medical',
    licenseFile: null,
    specialization: '',
    hospital: '',
    verificationStatus: 'pending',
    doctorId: doctorId // Include the doctor ID in the form data
  });
  
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prevData => ({
        ...prevData,
        licenseFile: file
      }));
      
      // Create a preview URL for the uploaded file
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create FormData object to handle file upload
      const data = new FormData();
      for (const key in formData) {
        if (formData[key] !== null) {
          data.append(key, formData[key]);
        }
      }
      
      // For demo, just log the data instead of making an actual API call
      console.log('Form submitted:', formData);
      console.log('Doctor ID included:', doctorId);
      
      // Simulate API call with a timeout
      setTimeout(() => {
        // Redirect to dashboard after "successful" submission
        navigate('/dashboard');
      }, 1500);
      
      // In a real application, you would make an API call like this:
      // const response = await fetch('/api/doctor-verification', {
      //   method: 'POST',
      //   body: data
      // });
      // if (response.ok) {
      //   navigate('/dashboard');
      // }
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-teal-600 px-6 py-4">
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h1 className="text-2xl font-bold text-white">Doctor Verification</h1>
          </div>
          <p className="text-teal-100">
            Complete the form below to verify your medical credentials
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Dr. John Doe"
                  className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                Age
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="age"
                  id="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min="18"
                  max="100"
                  placeholder="35"
                  className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                Specialization
              </label>
              <div className="mt-1">
                <select
                  name="specialization"
                  id="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select a specialization</option>
                  <option value="general-medicine">General Medicine</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="dermatology">Dermatology</option>
                  <option value="neurology">Neurology</option>
                  <option value="pediatrics">Pediatrics</option>
                  <option value="orthopedics">Orthopedics</option>
                  <option value="psychiatry">Psychiatry</option>
                  <option value="oncology">Oncology</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="hospital" className="block text-sm font-medium text-gray-700">
                Hospital/Clinic Affiliation
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="hospital"
                  id="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  required
                  placeholder="Mayo Clinic"
                  className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label htmlFor="licenseType" className="block text-sm font-medium text-gray-700">
                ID/License Type
              </label>
              <div className="mt-1">
                <select
                  id="licenseType"
                  name="licenseType"
                  value={formData.licenseType}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="medical">Medical License</option>
                  <option value="government">Government ID</option>
                  <option value="passport">Passport</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                ID/License Number
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="licenseNumber"
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  required
                  placeholder="MD-12345"
                  className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="licenseFile" className="block text-sm font-medium text-gray-700">
                Upload ID/License Document
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  name="licenseFile"
                  id="licenseFile"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  required
                  className="sr-only"
                />
                <label
                  htmlFor="licenseFile"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none"
                >
                  <div className="px-4 py-2 border border-gray-300 border-dashed rounded-md">
                    <span>{formData.licenseFile ? formData.licenseFile.name : 'Choose file'}</span>
                    <p className="text-xs text-gray-500">PDF, JPG, or PNG up to 10MB</p>
                  </div>
                </label>
              </div>
              
              {previewUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Document preview:</p>
                  <div className="mt-1 h-32 w-full border rounded-md overflow-hidden">
                    {formData.licenseFile?.type.includes('image') ? (
                      <img src={previewUrl} alt="License preview" className="h-full object-contain" />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100">
                        <p className="text-sm text-gray-600">
                          {formData.licenseFile?.name} (PDF document)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Information note */}
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-teal-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 text-sm text-gray-600">
                <p>
                  This is a demo form. For testing purposes, all verification requests will be automatically approved.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                onClick={() => navigate('/')}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${isSubmitting ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Submit for Verification'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyDoctor;