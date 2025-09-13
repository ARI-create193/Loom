import React, { useState, useEffect } from 'react';
import Login from './Login';
import Signup from './Signup';
import { useAuth } from '../contexts/AuthContext';

const AuthWrapper: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const { sessionExpired } = useAuth();

  useEffect(() => {
    if (sessionExpired) {
      setShowSessionExpired(true);
      // Hide the message after 5 seconds
      const timer = setTimeout(() => {
        setShowSessionExpired(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [sessionExpired]);

  return (
    <>
      {showSessionExpired && (
        <div className="fixed top-4 right-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                Your session has expired. Please log in again.
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setShowSessionExpired(false)}
                className="inline-flex text-yellow-400 hover:text-yellow-600"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isLogin ? (
        <Login onSwitchToSignup={() => setIsLogin(false)} />
      ) : (
        <Signup onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </>
  );
};

export default AuthWrapper;

