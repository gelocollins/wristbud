import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { GlobalAppContext } from '../App';
import { ADMIN_SIDEBAR_NAV_ITEMS, WristCareLogoIcon, BoltIcon, LogoutIcon, UserCircleIcon } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const appContext = useContext(GlobalAppContext);
  if (!appContext) return null;
  
  const { currentUserProfile, isDeviceConnected, toggleDeviceConnection, logoutAdmin } = appContext;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 z-20 bg-black opacity-50 md:hidden" onClick={() => setIsOpen(false)}></div>}

      <aside 
        className={`fixed inset-y-0 left-0 z-30 flex flex-col w-64 px-4 py-8 space-y-6 overflow-y-auto
                   bg-sidebar text-indigo-100 transform transition-transform duration-300 ease-in-out 
                   md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Link to="/admin/dashboard" className="flex items-center px-2 text-white hover:text-brand-light transition-colors">
          <WristCareLogoIcon className="w-8 h-8 mr-2" />
          <span className="text-2xl font-semibold">WristBud</span>
        </Link>

        <div className="flex flex-col items-center space-y-2 border-b border-indigo-500 pb-4">
          <UserCircleIcon className="w-16 h-16 text-brand-light" />
          <h2 className="text-lg font-medium">{currentUserProfile.name}</h2>
          <span className={`px-2 py-0.5 text-xs rounded-full ${isDeviceConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            System: {isDeviceConnected ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        {/* Device Connection Section */}
        <div className="px-2 space-y-2">
            <p className="text-sm">
                Device Status: 
                <span className={`ml-1 font-semibold ${isDeviceConnected ? 'text-green-400' : 'text-red-400'}`}>
                    {isDeviceConnected ? 'Connected' : 'Disconnected'}
                </span>
            </p>
            <button
                onClick={toggleDeviceConnection}
                className={`w-full flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sidebar focus:ring-brand-primary
                            ${isDeviceConnected 
                                ? 'bg-red-600 hover:bg-red-500 text-white' 
                                : 'bg-green-600 hover:bg-green-500 text-white'}`}
            >
                <BoltIcon className="w-5 h-5 mr-2" />
                {isDeviceConnected ? 'Disconnect Watch' : 'Connect to Smartwatch'}
            </button>
        </div>


        <nav className="flex-1 space-y-2">
          {ADMIN_SIDEBAR_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)} // Close sidebar on mobile nav click
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg transition-colors duration-200 transform hover:bg-sidebar-hover hover:text-white ${
                  isActive ? 'bg-sidebar-active text-white font-medium' : 'text-indigo-200'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="mx-4 text-sm">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto">
           <button
            onClick={() => logoutAdmin()}
            className="w-full flex items-center px-3 py-2.5 text-indigo-200 rounded-lg transition-colors duration-200 transform hover:bg-red-600 hover:text-white focus:outline-none"
          >
            <LogoutIcon className="w-5 h-5" />
            <span className="mx-4 text-sm">Logout</span>
          </button>
          <p className="mt-4 text-xs text-center text-indigo-400">&copy; {new Date().getFullYear()} WristBud.</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;