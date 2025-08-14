import React, { useState, useCallback, createContext, useContext, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AdminDashboardPage from './pages/AdminDashboardPage';
import UserDashboardPage from './pages/UserDashboardPage';
import HealthTrendsPage from './pages/HealthTrendsPage';
import ActivityLogPage from './pages/ActivityLogPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import { UserProfile } from './types';

export const GlobalAppContext = createContext<{
  isAdminLoggedIn: boolean;
  isUserLoggedIn: boolean;
  userRole: 'user' | 'admin' | null;
  loginAdmin: (callback?: () => void) => void;
  loginUser: (callback?: () => void) => void;
  logoutAdmin: (callback?: () => void) => void;
  logoutUser: (callback?: () => void) => void;
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
      case '/dashboard': return 'Admin Dashboard - User Management';
      case '/health-trends': return 'Health Trends Analysis';
      case '/activity-log': return 'System Activity Log';
      case '/profile': return 'Admin Profile';
      case '/settings': return 'System Settings';
      default: return 'WristBud Admin Panel';
    }
  };
  
  if (!appContext?.isAdminLoggedIn || appContext?.userRole !== 'admin') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header pageTitle={getPageTitle()} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const UserLayout: React.FC = () => {
  const location = useLocation();
  const appContext = useContext(GlobalAppContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname.replace('/user', '');
    switch (path) {
      case '/dashboard': return 'My Health Dashboard';
      case '/profile': return 'My Profile';
      case '/settings': return 'My Settings';
      default: return 'WristBud - My Health';
    }
  };
  
  if (!appContext?.isUserLoggedIn || appContext?.userRole !== 'user') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isUserMode={true} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header pageTitle={getPageTitle()} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'admin' | null>(null);
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile>({
    name: 'Guest User',
    email: 'guest@wristbud.com',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    const userEmail = localStorage.getItem('userEmail');
    const userType = localStorage.getItem('userType') as 'user' | 'admin' | null;
    
    if (authToken && (userData || userEmail) && userType) {
      try {
        let user = null;
        if (userData) {
          user = JSON.parse(userData);
        }
        
        if (userType === 'admin') {
          setIsAdminLoggedIn(true);
          setUserRole('admin');
        } else {
          setIsUserLoggedIn(true);
          setUserRole('user');
        }
        
        setIsDeviceConnected(true);
        setCurrentUserProfile({
          name: user?.name || userEmail?.split('@')[0] || 'User',
          email: user?.email || userEmail || 'user@wristbud.com',
        });
        
        console.log(`Auto-login successful for ${userType}:`, user?.name || userEmail);
        
        if (userType === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/user/dashboard');
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('userType');
        localStorage.removeItem('userEmail');
      }
    }
  }, [navigate]);

  const loginAdmin = useCallback((callback?: () => void) => {
    const userData = localStorage.getItem('userData');
    const userEmail = localStorage.getItem('userEmail');
    const userType = localStorage.getItem('userType');
    
    if (userType !== 'admin') {
      console.error('Attempted admin login but user type is:', userType);
      return;
    }
    
    setIsAdminLoggedIn(true);
    setUserRole('admin');
    setIsDeviceConnected(true);
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUserProfile({
          name: user.name || 'Admin',
          email: user.email || userEmail || 'admin@wristbud.com',
        });
        console.log('Admin login successful for:', user.name);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setCurrentUserProfile({
          name: userEmail?.split('@')[0] || 'Admin',
          email: userEmail || 'admin@wristbud.com',
        });
      }
    } else if (userEmail) {
      setCurrentUserProfile({
        name: userEmail.split('@')[0] || 'Admin',
        email: userEmail,
      });
      console.log('Admin login successful for:', userEmail);
    }
    
    if (callback) callback();
    else navigate('/admin/dashboard');
  }, [navigate]);

  const loginUser = useCallback((callback?: () => void) => {
    const userData = localStorage.getItem('userData');
    const userEmail = localStorage.getItem('userEmail');
    const userType = localStorage.getItem('userType');
    
    if (userType !== 'user') {
      console.error('Attempted user login but user type is:', userType);
      return;
    }
    
    setIsUserLoggedIn(true);
    setUserRole('user');
    setIsDeviceConnected(true);
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUserProfile({
          name: user.name || 'User',
          email: user.email || userEmail || 'user@wristbud.com',
        });
        console.log('User login successful for:', user.name);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setCurrentUserProfile({
          name: userEmail?.split('@')[0] || 'User',
          email: userEmail || 'user@wristbud.com',
        });
      }
    } else if (userEmail) {
      setCurrentUserProfile({
        name: userEmail.split('@')[0] || 'User',
        email: userEmail,
      });
      console.log('User login successful for:', userEmail);
    }
    
    if (callback) callback();
    else navigate('/user/dashboard');
  }, [navigate]);

  const logoutAdmin = useCallback((callback?: () => void) => {
    console.log('Logging out admin:', currentUserProfile.name);
    
    setIsAdminLoggedIn(false);
    setUserRole(null);
    setIsDeviceConnected(false);
    setCurrentUserProfile({
      name: 'Guest User',
      email: 'guest@wristbud.com',
    });
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    
    if (callback) callback();
    else navigate('/login');
  }, [navigate, currentUserProfile.name]);

  const logoutUser = useCallback((callback?: () => void) => {
    console.log('Logging out user:', currentUserProfile.name);
    
    setIsUserLoggedIn(false);
    setUserRole(null);
    setIsDeviceConnected(false);
    setCurrentUserProfile({
      name: 'Guest User',
      email: 'guest@wristbud.com',
    });
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    
    if (callback) callback();
    else navigate('/login');
  }, [navigate, currentUserProfile.name]);

  const toggleDeviceConnection = useCallback(() => {
    setIsDeviceConnected(prev => !prev);
  }, []);

  return (
    <GlobalAppContext.Provider value={{ 
        isAdminLoggedIn,
        isUserLoggedIn,
        userRole,
        loginAdmin,
        loginUser,
        logoutAdmin,
        logoutUser,
        isDeviceConnected, 
        toggleDeviceConnection, 
        currentUserProfile, 
        setCurrentUserProfile 
    }}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="health-trends" element={<HealthTrendsPage />} />
          <Route path="activity-log" element={<ActivityLogPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
        <Route path="/user" element={<UserLayout />}>
          <Route path="dashboard" element={<UserDashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} /> 
      </Routes>
    </GlobalAppContext.Provider>
  );
};

export default App;