import React from 'react';
import { DashboardTab } from '../types';

interface TabSelectorProps {
  tabs: { name: DashboardTab, icon: (props: { className?: string }) => React.ReactNode }[];
  selectedTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
}

const TabSelector: React.FC<TabSelectorProps> = ({ tabs, selectedTab, onSelectTab }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-4" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => onSelectTab(tab.name)}
            className={`group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm
                        focus:outline-none transition-colors duration-150
                        ${
                          tab.name === selectedTab
                            ? 'border-brand-primary text-brand-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
            aria-current={tab.name === selectedTab ? 'page' : undefined}
          >
            <tab.icon 
                className={`w-5 h-5 mr-2 ${ tab.name === selectedTab ? 'text-brand-primary' : 'text-gray-400 group-hover:text-gray-500'}`} 
            />
            {tab.name}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabSelector;