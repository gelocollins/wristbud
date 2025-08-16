import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { WristCareLogoIcon, ExclamationCircleIcon, CheckCircleIcon } from '../constants';

const RegistrationPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'user' as 'user' | 'admin',
    emergency_contact1: '',
    emergency_phone1: '',
    emergency_contact2: '',
    emergency_phone2: '',
    emergency_contact3: '',
    emergency_phone3: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserTypeChange = (userType: 'user' | 'admin') => {
    setFormData(prev => ({
      ...prev,
      userType
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Full name is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email address is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (!formData.emergency_contact1.trim() || !formData.emergency_phone1.trim() || !formData.emergency_contact2.trim() || !formData.emergency_phone2.trim()) {
      setError('At least 2 emergency contacts (name and phone) are required');
      return false;
    }
    
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(formData.emergency_phone1.replace(/[\s\-\(\)]/g, '')) || !phoneRegex.test(formData.emergency_phone2.replace(/[\s\-\(\)]/g, ''))) {
      setError('Please enter valid phone numbers for the first two emergency contacts');
      return false;
    }
    
    if (formData.emergency_phone3 && !phoneRegex.test(formData.emergency_phone3.replace(/[\s\-\(\)]/g, ''))) {
      setError('Please enter a valid phone number for the third emergency contact');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          emergency_contact1: formData.emergency_contact1.trim(),
          emergency_phone1: formData.emergency_phone1.trim(),
          emergency_contact2: formData.emergency_contact2.trim(),
          emergency_phone2: formData.emergency_phone2.trim(),
          emergency_contact3: formData.emergency_contact3.trim() || undefined,
          emergency_phone3: formData.emergency_phone3.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && (data.success || data.message === 'User registered successfully')) {
        setSuccess('Registration successful! You can now login with your credentials.');
        // Clear form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          userType: 'user',
          emergency_contact1: '',
          emergency_phone1: '',
          emergency_contact2: '',
          emergency_phone2: '',
          emergency_contact3: '',
          emergency_phone3: ''
        });
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
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
              {formData.userType === 'admin' ? 'Admin Registration' : 'User Registration'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {formData.userType === 'admin' 
                ? 'Create an administrator account' 
                : 'Create your WristBud account'
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

          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 text-green-700 p-4 mb-6 rounded-md" role="alert">
              <div className="flex">
                <div className="py-1">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
                </div>
                <div>
                  <p className="text-sm font-medium">{success}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Account Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="user"
                    checked={formData.userType === 'user'}
                    onChange={() => handleUserTypeChange('user')}
                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Regular User</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="admin"
                    checked={formData.userType === 'admin'}
                    onChange={() => handleUserTypeChange('admin')}
                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Administrator</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters long</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact Information</h3>
              <p className="text-sm text-gray-600 mb-4">2 contacts required, 3rd is optional</p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="emergency_contact1" className="block text-sm font-medium text-gray-700">
                    Emergency Contact 1 Name *
                  </label>
                  <div className="mt-1">
                    <input
                      id="emergency_contact1"
                      name="emergency_contact1"
                      type="text"
                      required
                      value={formData.emergency_contact1}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                      placeholder="Full name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="emergency_phone1" className="block text-sm font-medium text-gray-700">
                    Emergency Contact 1 Phone *
                  </label>
                  <div className="mt-1">
                    <input
                      id="emergency_phone1"
                      name="emergency_phone1"
                      type="tel"
                      required
                      value={formData.emergency_phone1}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="emergency_contact2" className="block text-sm font-medium text-gray-700">
                    Emergency Contact 2 Name *
                  </label>
                  <div className="mt-1">
                    <input
                      id="emergency_contact2"
                      name="emergency_contact2"
                      type="text"
                      required
                      value={formData.emergency_contact2}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                      placeholder="Full name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="emergency_phone2" className="block text-sm font-medium text-gray-700">
                    Emergency Contact 2 Phone *
                  </label>
                  <div className="mt-1">
                    <input
                      id="emergency_phone2"
                      name="emergency_phone2"
                      type="tel"
                      required
                      value={formData.emergency_phone2}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="emergency_contact3" className="block text-sm font-medium text-gray-700">
                    Emergency Contact 3 Name (Optional)
                  </label>
                  <div className="mt-1">
                    <input
                      id="emergency_contact3"
                      name="emergency_contact3"
                      type="text"
                      value={formData.emergency_contact3}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                      placeholder="Full name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="emergency_phone3" className="block text-sm font-medium text-gray-700">
                    Emergency Contact 3 Phone (Optional)
                  </label>
                  <div className="mt-1">
                    <input
                      id="emergency_phone3"
                      name="emergency_phone3"
                      type="tel"
                      value={formData.emergency_phone3}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
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
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>
          
          <div className="text-center mt-6 space-y-2">
            <Link to="/login" className="text-sm font-medium text-brand-primary hover:text-brand-secondary">
              Already have an account? Sign in
            </Link>
            <br />
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

export default RegistrationPage;