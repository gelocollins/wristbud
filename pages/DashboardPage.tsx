import React, { useState, useContext } from 'react';
import TabSelector from '../components/TabSelector';
import { DashboardTab } from '../types';
import { DASHBOARD_TABS, ExclamationCircleIcon } from '../constants';
import HeartRateView from './dashboard/HeartRateView';
import StepsView from './dashboard/StepsView';
import SleepView from './dashboard/SleepView';
import BloodOxygenView from './dashboard/BloodOxygenView';
import TemperatureView from './dashboard/TemperatureView';
import { GlobalAppContext } from '../App';

const DashboardPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<DashboardTab>(DashboardTab.HeartRate);
  const appContext = useContext(GlobalAppContext);

  const renderTabContent = () => {
    if (!appContext?.isDeviceConnected) {
       return null; 
    }
    switch (selectedTab) {
      case DashboardTab.HeartRate:
        return <HeartRateView />;
      case DashboardTab.Steps:
        return <StepsView />;
      case DashboardTab.Sleep:
        return <SleepView />;
      case DashboardTab.BloodOxygen:
        return <BloodOxygenView />;
      case DashboardTab.Temperature:
        return <TemperatureView />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
       {!appContext?.isDeviceConnected && (
         <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
            <div className="flex">
                <div className="py-1"><ExclamationCircleIcon className="w-6 h-6 text-red-500 mr-3"/></div>
                <div>
                    <p className="font-bold">System Inactive!</p>
                    <p className="text-sm">Admin not logged in or system is inactive. Please login and connect device to view dashboard data.</p>
                </div>
            </div>
          </div>
      )}
      <div className="bg-white shadow-md rounded-lg">
        <div className="px-4 sm:px-6 pt-3">
            <TabSelector tabs={DASHBOARD_TABS} selectedTab={selectedTab} onSelectTab={setSelectedTab} />
        </div>
        <div className="p-4 sm:p-6">
            {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;