import React, { useContext } from 'react';
import { GlobalAppContext } from '../App';
import { MOCK_ACTIVITIES, DocumentTextIcon } from '../constants'; 
import { Activity } from '../types';

const ActivityLogPage: React.FC = () => {
  const appContext = useContext(GlobalAppContext);
  const { isDeviceConnected } = appContext || { isDeviceConnected: false };

  if (!isDeviceConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
        <DocumentTextIcon className="w-20 h-20 mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold mb-2">No Activities Logged</h2>
        <p>Please log in as admin and connect a device to view activity logs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-lg rounded-xl">
        <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent System Activities (Mock Data)</h3>
        </div>
        <div className="flow-root">
        {MOCK_ACTIVITIES.length === 0 ? (
          <p className="p-4 sm:p-6 text-gray-500">No activities recorded yet.</p>
        ) : (
          <ul role="list" className="divide-y divide-gray-200">
            {MOCK_ACTIVITIES.map((activity: Activity) => (
              <li key={activity.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <span className="p-2 bg-brand-primary text-white rounded-full inline-flex items-center justify-center w-10 h-10">
                      <activity.icon className="w-5 h-5" />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.type}</p>
                    <p className="text-sm text-gray-500 truncate">
                      Duration: {activity.duration} | Calories: ~{activity.caloriesBurned} kcal
                    </p>
                  </div>
                  <div className="inline-flex items-center text-sm text-gray-500">
                    {activity.date}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        </div>
      </div>
       <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Activity Insights</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>Regular physical activity is key to maintaining good health.</li>
            <li>Try to vary your activities to work different muscle groups.</li>
            <li>Listen to your body and rest when needed.</li>
        </ul>
      </div>
    </div>
  );
};

export default ActivityLogPage;