import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GlobalAppContext } from '../App';
import { WristCareLogoIcon, LoginIcon, ExclamationCircleIcon } from '../constants'; // Use SVG icons

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [userType, setUserType] = useState<'user' | 'admin'>('user');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const appContext = useContext(GlobalAppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const { loginAdmin, isAdminLoggedIn } = appContext || {};
  
  const from = location.state?.from?.pathname || (userType === 'admin' ? "/admin/dashboard" : "/admin/dashboard");

  useEffect(() => {
    if (isAdminLoggedIn) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAdminLoggedIn, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('https://nocollateralloan.org/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          userType: userType,
          app: 'wristbud'
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store authentication token and user info
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userEmail', email);
          localStorage.setItem('userType', userType);
          localStorage.setItem('userData', JSON.stringify(data.user));
        }
        
        // For now, both user types go to admin dashboard since we don't have separate user dashboard
        if (loginAdmin) {
          loginAdmin(() => navigate("/admin/dashboard", { replace: true }));
        } else {
          navigate("/admin/dashboard", { replace: true });
        }
        
      } else {
        setError(data.message || 'Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Connection error. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-lg p-8 sm:p-10">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-4">
              <WristCareLogoIcon className="h-12 w-auto text-brand-primary" />
            </Link>
            <h2 className="text-2xl font-bold text-gray-900">
              {userType === 'admin' ? 'Admin Login' : 'User Login'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {userType === 'admin' 
                ? 'Access the WristBud Management Panel' 
                : 'Access your WristBud Dashboard'
              }
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mb-6 rounded-md" role="alert">
              <div className="flex">
                <div className="py-1">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-3" />
                </div>
                <div>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Login As
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="user"
                    checked={userType === 'user'}
                    onChange={(e) => setUserType(e.target.value as 'user' | 'admin')}
                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Regular User</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="admin"
                    checked={userType === 'admin'}
                    onChange={(e) => setUserType(e.target.value as 'user' | 'admin')}
                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Administrator</span>
                </label>
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </>
                ) : (
                  <>
                    <LoginIcon className="w-5 h-5 mr-2 -ml-1" />
                    Sign In
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="text-center mt-6 space-y-2">
            <Link to="/register" className="text-sm font-medium text-brand-primary hover:text-brand-secondary">
              Don't have an account? Sign up
            </Link>
            <br />
            <Link to="/" className="text-sm font-medium text-brand-primary hover:text-brand-secondary">
              &larr; Back to Homepage
            </Link>
          </div>
          
          {/* Debug info - remove in production */}
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
            <p><strong>Debug Info:</strong></p>
            <p>User Type: {userType}</p>
            <p>Is Admin Logged In: {isAdminLoggedIn ? 'Yes' : 'No'}</p>
            <p>Test Credentials: admin@wristbud.com / admin123</p>
          </div>
        </div>
        
         <footer className="text-center mt-6 text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} WristBud.
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;