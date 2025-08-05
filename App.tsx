import React, { useState, useCallback, createContext, useContext, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import HealthTrendsPage from './pages/HealthTrendsPage';
import ActivityLogPage from './pages/ActivityLogPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import { UserProfile } from './types';

export const GlobalAppContext = createContext<{
  isAdminLoggedIn: boolean;
  loginAdmin: (callback?: () => void) => void;
  logoutAdmin: (callback?: () => void) => void;
  isDeviceConnected: boolean;
  toggleDeviceConnection: () => void;
  currentUserProfile: UserProfile;
  setCurrentUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
} | null>(null);

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const appContext = useContext(GlobalAppContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname.replace('/admin', '');
    switch (path) {
      case '/dashboard': return 'Health Dashboard';
      case '/health-trends': return 'Health Trends';
      case '/activity-log': return 'Activity Log';
      case '/profile': return 'Admin Profile';
      case '/settings': return 'Settings';
      default: return 'WristCare Admin';
    }
  };
  
  if (!appContext?.isAdminLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header pageTitle={getPageTitle()} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
          <Routes>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="health-trends" element={<HealthTrendsPage />} />
            <Route path="activity-log" element={<ActivityLogPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile>({
    name: 'Admin User',
    age: 0,
    email: 'admin@wrist.care',
  });

  const navigate = useNavigate();

  const loginAdmin = useCallback((callback?: () => void) => {
    setIsAdminLoggedIn(true);
    setIsDeviceConnected(true); 
    setCurrentUserProfile({
        name: 'Admin User',
        age: 42,
        email: 'admin@wrist.care',
        weight: 70,
        height: 175
    });
    if (callback) callback();
    else navigate('/admin/dashboard');
  }, [navigate]);

  const logoutAdmin = useCallback((callback?: () => void) => {
    setIsAdminLoggedIn(false);
    setIsDeviceConnected(false); 
    if (callback) callback();
    else navigate('/login');
  }, [navigate]);

  const toggleDeviceConnection = useCallback(() => {
    setIsDeviceConnected(prev => !prev);
  }, []);

  return (
    <GlobalAppContext.Provider value={{ 
        isAdminLoggedIn, 
        loginAdmin, 
        logoutAdmin, 
        isDeviceConnected, 
        toggleDeviceConnection, 
        currentUserProfile, 
        setCurrentUserProfile 
    }}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="*" element={<Navigate to="/" replace />} /> 
      </Routes>
    </GlobalAppContext.Provider>
  );
};

export default App;