// frontend/src/pages/auth/VerifyEmail.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, MailCheck, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const emailParam = searchParams.get('email');
    
    if (emailParam) setEmail(emailParam);
    
    if (success === 'true') {
      setStatus('success');
      setMessage('Email verified successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }
    
    if (error === 'no-token') {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }
    
    if (error === 'expired') {
      setStatus('expired');
      setMessage('Your verification link has expired.');
      return;
    }
    
    if (error === 'already-verified') {
      setStatus('success');
      setMessage('Your email is already verified! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    if (error === 'invalid') {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }
    
    // If no params, try to verify with token from URL
    const token = searchParams.get('token');
    if (token) {
      // Redirect to backend verification endpoint
      window.location.href = `http://localhost:5000/api/auth/verify-email?token=${token}`;
    } else {
      setStatus('error');
      setMessage('No verification token provided.');
    }
  }, [searchParams, navigate]);

  const handleResendVerification = async () => {
    if (!email) {
      // Prompt for email if not available
      const userEmail = prompt('Please enter your email address:');
      if (!userEmail) return;
      setEmail(userEmail);
      email = userEmail;
    }
    
    try {
      const response = await api.post('/auth/resend-verification', { email });
      setStatus('info');
      setMessage(response.data.message);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to resend verification email');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email...</h2>
            <p className="text-gray-500">Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified! 🎉</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </>
        )}

        {status === 'expired' && (
          <>
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-10 w-10 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={handleResendVerification}
              className="w-full mb-3 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Resend Verification Email
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Back to Login
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/login')}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Go to Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Sign Up
              </button>
            </div>
          </>
        )}

        {status === 'info' && (
          <>
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MailCheck className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Sent!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Please check your inbox (and spam folder).</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;