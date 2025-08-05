import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GlobalAppContext } from '../App';
import { WristCareLogoIcon, LoginIcon, ExclamationCircleIcon } from '../constants'; // Use SVG icons

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('test@wristbud.com');
  const [password, setPassword] = useState('password'); 
  const [error, setError] = useState('');
  const appContext = useContext(GlobalAppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const { loginAdmin, isAdminLoggedIn } = appContext || {};
  
  const from = location.state?.from?.pathname || "/admin/dashboard";

  useEffect(() => {
    if (isAdminLoggedIn) {
      navigate(from, { replace: true });
    }
  }, [isAdminLoggedIn, navigate, from]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (email === 'test@wristbud.com' && password === 'password') {
      if (loginAdmin) {
        loginAdmin(() => navigate(from, { replace: true }));
      }
    } else {
      setError('Invalid email or password. Please try again.');
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
            <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
            <p className="text-sm text-gray-600 mt-1">Access the WristBud Management Panel.</p>
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
            
            <div className="text-xs text-gray-500">
              <p>Demo credentials: <span className="font-medium">test@wristbud.com</span> / <span className="font-medium">password</span></p>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
              >
                <LoginIcon className="w-5 h-5 mr-2 -ml-1" />
                Sign In
              </button>
            </div>
          </form>
          <div className="text-center mt-6">
              <Link to="/" className="text-sm font-medium text-brand-primary hover:text-brand-secondary">
                &larr; Back to Homepage
              </Link>
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