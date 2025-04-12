// DoctorVerificationPage.jsx
import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';

const VerifyDoctor = () => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    age: '',
    licenseNumber: '',
    licenseType: 'medical',
    licenseFile: null,
    specialization: '',
    hospital: '',
    verificationStatus: 'pending'
  });
  
  const [previewUrl, setPreviewUrl] = useState(null);

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
    
    // Create FormData object to handle file upload
    const data = new FormData();
    for (const key in formData) {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    }
    
    // Here you would send the data to your backend
    console.log('Form submitted:', formData);
    
    // Implement your API call here
    // const response = await fetch('/api/doctor-verification', {
    //   method: 'POST',
    //   body: data
    // });
    
    // Show success message (this is just a placeholder)
    alert('Verification request submitted successfully. Our team will review your information shortly.');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Doctor Verification</h1>
          <p className="text-blue-100">
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
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                Specialization
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="specialization"
                  id="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
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
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
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

          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Submit for Verification
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyDoctor;