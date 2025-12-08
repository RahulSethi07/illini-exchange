import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Login = () => {
  const handleGoogleLogin = () => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
    window.location.href = `${apiBaseUrl}/auth/google`;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-illini-orange to-illini-orange-dark rounded-xl flex items-center justify-center">
                <span className="text-white font-display font-bold text-2xl">I</span>
              </div>
            </Link>
            <h1 className="text-3xl font-display font-bold text-illini-blue mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 mb-2">
              Sign in with your UIUC Google account
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Shield size={16} className="text-green-500" />
              <span>Verified with your @illinois.edu email</span>
            </div>
          </div>

          {/* Info Box */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800 text-center">
              <strong>Secure Sign In:</strong> We use Google OAuth to verify your UIUC email address. 
              This ensures only verified UIUC students and staff can access the marketplace.
            </p>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors mb-6 shadow-sm"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-semibold text-gray-700 text-lg">Sign in with Google</span>
          </button>

          <div className="text-center text-sm text-gray-500 mb-6">
            <p>By signing in, you agree to use your official @illinois.edu email address</p>
          </div>

          <p className="text-center text-gray-600 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-illini-orange font-semibold hover:text-illini-orange-dark">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Image/Graphic */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-illini-blue to-illini-blue-light items-center justify-center p-12">
        <div className="max-w-lg text-center text-white">
          <div className="mb-8">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">🏛️</span>
            </div>
            <h2 className="text-3xl font-display font-bold mb-4">
              Trusted by the UIUC Community
            </h2>
            <p className="text-gray-300 text-lg">
              Join thousands of students and staff who use Illini Exchange to buy and sell safely on campus.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-illini-orange">5000+</div>
              <div className="text-sm text-gray-400">Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-illini-orange">1000+</div>
              <div className="text-sm text-gray-400">Listings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-illini-orange">100%</div>
              <div className="text-sm text-gray-400">Verified</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

