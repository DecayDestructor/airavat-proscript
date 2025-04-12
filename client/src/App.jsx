// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import DoctorVerification from './pages/VerifyDoctor';




const ProtectedRoute = ({ children }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

function App() {
  return (
   
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/sign-in/*" element={<Login />} />
          <Route path="/sign-up/*" element={<Login />} />
          
          {/* Protected routes */}
          <Route 
            path="/doctor-verification" 
            element={
              <ProtectedRoute>
                <DoctorVerification />
              </ProtectedRoute>
            } 
          />
          
          {/* Add your other routes here */}
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
   
  );
}

export default App;