import React, { useContext, useState, useEffect } from 'react';
import { GlobalAppContext } from '../App';
import { UserCircleIcon } from '../constants';
import { UserProfile } from '../types';

const ProfilePage: React.FC = () => {
  const appContext = useContext(GlobalAppContext);
  
  const [editableProfile, setEditableProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (appContext?.currentUserProfile) {
      setEditableProfile(appContext.currentUserProfile);
    }
  }, [appContext?.currentUserProfile]);

  if (!appContext || !editableProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
        <UserCircleIcon className="w-20 h-20 mb-4 text-gray-400" />
        <p>Loading admin profile...</p>
      </div>
    );
  }
  
  const { setCurrentUserProfile, isDeviceConnected } = appContext;

  if (!isDeviceConnected) {
     return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
        <UserCircleIcon className="w-20 h-20 mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold mb-2">Profile Unavailable</h2>
        <p>Please log in as admin and connect a device to view or edit the profile.</p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableProfile(prev => prev ? { ...prev, [name]: name === 'age' || name === 'weight' || name === 'height' ? Number(value) || 0 : value } : null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editableProfile) {
      setCurrentUserProfile(editableProfile); 
    }
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    setEditableProfile(appContext.currentUserProfile);
    setIsEditing(false);
  }
  
  const getInitials = (name: string): string => {
    const names = name.split(' ');
    const firstInitial = names[0] ? names[0][0] : '';
    const lastInitial = names.length > 1 && names[names.length -1] ? names[names.length -1][0] : (names[0] && names[0].length > 1 ? names[0][1] : '');
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }

  const ProfileField: React.FC<{ label: string; value: string | number | undefined; name: keyof UserProfile; type?: string; isEditing: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; unit?: string }> = 
    ({ label, value, name, type = "text", isEditing, onChange, placeholder, unit }) => (
    <div className="sm:col-span-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      {isEditing ? (
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
        <p className="mt-1 text-sm text-gray-900 py-2">{value}{unit && value ? ` ${unit}`: (value ? '' : '-')}</p>
      )}
    </div>
  );


  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Image Card */}
            <div className="md:col-span-1 bg-white shadow-lg rounded-xl p-6 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-brand-primary text-white rounded-full flex items-center justify-center text-3xl font-semibold mb-4">
                    {getInitials(editableProfile.name)}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{editableProfile.name}</h3>
                <p className="text-sm text-gray-500">Administrator</p>
                <ul className="mt-4 text-sm text-gray-700 space-y-1 w-full">
                    <li className="flex justify-between border-t pt-2"><span>Email:</span> <span className="font-medium truncate">{editableProfile.email}</span></li>
                    <li className="flex justify-between border-t pt-2"><span>Age:</span> <span className="font-medium">{editableProfile.age}</span></li>
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

            {/* Admin Information Form Card */}
            <div className="md:col-span-2 bg-white shadow-lg rounded-xl">
                <form onSubmit={handleSave}>
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="text-lg leading-6 font-medium text-gray-900">Admin Information {isEditing ? '(Editing)' : ''}</h3>
                             {isEditing && (
                                <div className="flex space-x-2">
                                    <button 
                                        type="submit"
                                        className="py-2 px-3 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        Save
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleCancelEdit}
                                        className="py-2 px-3 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                                    >
                                        Cancel
                                    </button>
                                </div>
                             )}
                        </div>
                       
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <ProfileField label="Full Name" name="name" value={editableProfile.name} isEditing={isEditing} onChange={handleChange} />
                            <ProfileField label="Email Address" name="email" type="email" value={editableProfile.email} isEditing={isEditing} onChange={handleChange} />
                            <ProfileField label="Age" name="age" type="number" value={editableProfile.age} isEditing={isEditing} onChange={handleChange} />
                            <ProfileField label="Weight (Mock)" name="weight" type="number" value={editableProfile.weight} unit="kg" isEditing={isEditing} onChange={handleChange} placeholder="e.g., 70" />
                            <ProfileField label="Height (Mock)" name="height" type="number" value={editableProfile.height} unit="cm" isEditing={isEditing} onChange={handleChange} placeholder="e.g., 175" />
                        </div>
                    </div>
                    {isEditing && (
                        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 rounded-b-xl">
                            <button 
                                type="button" 
                                onClick={handleCancelEdit}
                                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                            >
                                Save Profile
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