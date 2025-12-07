import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (token) {
        const result = await loginWithToken(token);
        if (result.success) {
          navigate('/marketplace');
        } else {
          setError('Failed to authenticate. Please try again.');
          setTimeout(() => navigate('/login'), 3000);
        }
      } else {
        setError('No authentication token received.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, loginWithToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cloud">
      <div className="text-center">
        {error ? (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{error}</h2>
            <p className="text-gray-600">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="spinner w-12 h-12 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Completing sign in...</h2>
            <p className="text-gray-600">Please wait while we verify your credentials.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;

