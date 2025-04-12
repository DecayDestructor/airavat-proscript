// App.jsx

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Login from './pages/Login';
import VerifyDoctor from './pages/VerifyDoctor'
// Import your other pages here

// Replace with your actual Clerk publishable key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

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
    <ClerkProvider publishableKey={clerkPubKey}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/sign-in/*" element={<Login />} />
          <Route path="/sign-up/*" element={<Login />} />
          
          {/* Protected routes */}
          <Route 
            path="/doctor-verification" 
            element={
              <ProtectedRoute>
                <VerifyDoctor />
              </ProtectedRoute>
            } 
          />
          
          {/* Add your other routes here */}
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ClerkProvider>
  );
}

export default App;