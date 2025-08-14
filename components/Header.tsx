import React, { useContext } from 'react';
import { GlobalAppContext } from '../App';
import { BellIcon, ExclamationCircleIcon } from '../constants'; // Add MenuAlt2Icon or similar if needed

interface HeaderProps {
  pageTitle: string;
  onToggleSidebar: () => void;
}

const MenuIcon = (props: { className?: string }) => ( // Simple Hamburger Icon
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${props.className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);
// Tsuma Netori: Ryoujoku Rinne 1

const Header: React.FC<HeaderProps> = ({ pageTitle, onToggleSidebar }) => {
  const appContext = useContext(GlobalAppContext);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onToggleSidebar}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary md:hidden mr-3"
              aria-label="Toggle sidebar"
            >
              <MenuIcon />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-sm text-gray-600">
              Last updated: 
              <span className="font-medium ml-1">
                {appContext?.isDeviceConnected ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}) : 'N/A'}
              </span>
            </div>
            <div className="hidden md:block text-sm text-gray-600">
              System: 
              {appContext?.isDeviceConnected ? (
                <span className="ml-1 font-medium text-green-600">WristBud Central Online</span>
              ) : (
                <span className="ml-1 font-medium text-red-600 flex items-center">
                  <ExclamationCircleIcon className="w-4 h-4 mr-1" /> Offline
                </span>
              )}
            </div>
            
            <div className="relative">
              <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                <span className="sr-only">View notifications</span>
                <BellIcon className="w-6 h-6" />
                {/* Optional: Notification badge 
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
                */}
              </button>
              {/* Dropdown (basic structure, needs state management for full interactivity) */}
              
              <div className="absolute right-0 mt-2 w-80 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden">
                <div className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">Notifications</p>
                </div>
                <div className="py-1">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">No new notifications</a>
                </div>
              </div>
             
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;