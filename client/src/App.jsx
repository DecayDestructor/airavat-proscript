// App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import Login from './pages/Login'
import DoctorVerification from './pages/VerifyDoctor'
import Dashboard from './pages/Dashboard'
import CreatePrescription from './pages/CreatePrescription'
import OngoingPrescriptions from './pages/OngoingPrescription'
import Prescription from './pages/Prescription'
import ExpiredPrescription from './pages/ExpiredPrescription'
import PatientHistory from './pages/PatientHistory'
import PatientList from './pages/PatientList'


function App() {
  return (
    <div className="font-Inter">
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/sign-in/*" element={<Login />} />
          <Route path="/sign-up/*" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />}></Route>
          <Route
            path="/create-prescription"
            element={<CreatePrescription />}
          ></Route>
          <Route
            path="/ongoing-prescriptions"
            element={<OngoingPrescriptions />}
          >
            {' '}
          </Route>

          <Route path="/prescription/:id" element={<Prescription />} />
          <Route path="/doctor-verification" element={<DoctorVerification />} />
          <Route
            path="/expired-prescriptions"
            element={<ExpiredPrescription />}
          />
          <Route path="/patient-list" element={<PatientList />} />
          <Route path="/patient-history/:email" element={<PatientHistory />} />
          
        </Routes>
      </Router>
    </div>
  )
}

export default App
