import React, { useContext, useState, useEffect } from 'react';
import { GlobalAppContext } from '../App';
import { UserCircleIcon } from '../constants';
import { UserProfile } from '../types';
import { Navigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const appContext = useContext(GlobalAppContext);
  const [editableProfile, setEditableProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Auth check: redirect if not logged in
  if (!appContext || (!appContext.isUserLoggedIn && !appContext.isAdminLoggedIn)) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    if (appContext?.currentUserProfile) {
      setEditableProfile(appContext.currentUserProfile);
    }
  }, [appContext?.currentUserProfile]);

  // Fetch user profile from server
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        const res = await fetch('http://localhost:5000/api/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          const serverProfile: UserProfile = {
            name: data.user.name,
            email: data.user.email,
            emergency_contact: data.user.emergency_contact,
            emergency_phone: data.user.emergency_phone,
          };
          setEditableProfile(serverProfile);
          if (appContext?.setCurrentUserProfile) {
            appContext.setCurrentUserProfile(serverProfile);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, [appContext?.setCurrentUserProfile]);

  if (!editableProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
        <UserCircleIcon className="w-20 h-20 mb-4 text-gray-400" />
        <p>Loading profile...</p>
      </div>
    );
  }

  const { setCurrentUserProfile, userRole } = appContext;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableProfile(prev => prev ? {
      ...prev,
      [name]: value
    } : null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('authToken');
      if (!token || !editableProfile) return;
      const res = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editableProfile)
      });
      if (res.ok) {
        setCurrentUserProfile(editableProfile);
        setIsEditing(false);
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await res.json();
        setMessage(errorData.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (appContext.currentUserProfile) {
      setEditableProfile(appContext.currentUserProfile);
    }
    setIsEditing(false);
    setMessage('');
  };

  const getInitials = (name: string): string => {
    const names = name.split(' ');
    const firstInitial = names[0] ? names[0][0] : '';
    const lastInitial = names.length > 1 && names[names.length -1] ? names[names.length -1][0] : (names[0] && names[0].length > 1 ? names[0][1] : '');
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const ProfileField: React.FC<{
    label: string;
    value: string | undefined;
    name: keyof UserProfile;
    type?: string;
    isEditing: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    disabled?: boolean;
  }> = ({ label, value, name, type = "text", isEditing, onChange, placeholder, disabled = false }) => (
    <div className="sm:col-span-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      {isEditing && !disabled ? (
        <input
          type={type}
          name={name}
          id={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
        />
      ) : (
        <p className="mt-1 text-sm text-gray-900 py-2">{value || '-'}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-md ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Image Card */}
        <div className="md:col-span-1 bg-white shadow-lg rounded-xl p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-brand-primary text-white rounded-full flex items-center justify-center text-3xl font-semibold mb-4">
            {getInitials(editableProfile.name)}
          </div>
          <h3 className="text-xl font-semibold text-gray-900">{editableProfile.name}</h3>
          <p className="text-sm text-gray-500">
            {userRole === 'admin' ? 'Administrator' : 'User'}
          </p>
          <ul className="mt-4 text-sm text-gray-700 space-y-1 w-full">
            <li className="flex justify-between border-t pt-2">
              <span>Email:</span>
              <span className="font-medium truncate">{editableProfile.email}</span>
            </li>
          </ul>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
            >
              Edit Profile
            </button>
          )}
        </div>
        {/* Profile Information Form Card */}
        <div className="md:col-span-2 bg-white shadow-lg rounded-xl">
          <form onSubmit={handleSave}>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Profile Information {isEditing ? '(Editing)' : ''}
                </h3>
                {isEditing && (
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="py-2 px-3 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                      className="py-2 px-3 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <ProfileField
                  label="Full Name"
                  name="name"
                  value={editableProfile.name}
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <ProfileField
                  label="Emergency Contact"
                  name="emergency_contact"
                  value={editableProfile.emergency_contact}
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <ProfileField
                  label="Emergency Phone"
                  name="emergency_phone"
                  value={editableProfile.emergency_phone}
                  isEditing={isEditing}
                  onChange={handleChange}
                />
              </div>
            </div>
            {isEditing && (
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 rounded-b-xl">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50"
                >
                  {isLoading ? 'Saving Profile...' : 'Save Profile'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;