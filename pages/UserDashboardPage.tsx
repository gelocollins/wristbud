import React, { useState, useContext, useEffect } from 'react';
import TabSelector from '../components/TabSelector';
import { ExclamationCircleIcon, UserCircleIcon, CogIcon } from '../constants';
import HeartRateView from './dashboard/HeartRateView';
import StepsView from './dashboard/StepsView';
import SleepView from './dashboard/SleepView';
import BloodOxygenView from './dashboard/BloodOxygenView';
import TemperatureView from './dashboard/TemperatureView';
import { GlobalAppContext } from '../App';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';

interface UserHealthData {
  user_id: number;
  name: string;
  email: string;
  health_status: 'NORMAL' | 'ABNORMAL' | 'CRITICAL' | 'ERROR';
  systolic_bp?: number;
  diastolic_bp?: number;
  heart_rate?: number;
  oxygen_level?: number;
  body_temperature?: number;
  steps?: number;
  calories_burned?: number;
  distance_walked?: number;
  sleep_hours?: number;
  stress_level?: string;
  analysis_report?: string;
  last_updated: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship?: string;
  device_status?: string;
}

interface HealthHistory {
  heart_rate?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  oxygen_level?: number;
  body_temperature?: number;
  steps?: number;
  sleep_hours?: number;
  health_status: string;
  last_updated: string;
}

interface RecentAlert {
  alert_type: string;
  title: string;
  message: string;
  emergency_contact_notified: boolean;
  created_at: string;
}

const USER_TABS = [
  { name: 'Heart Rate', icon: UserCircleIcon },
  { name: 'Steps', icon: UserCircleIcon },
  { name: 'Sleep', icon: UserCircleIcon },
  { name: 'Blood Oxygen', icon: UserCircleIcon },
  { name: 'Temperature', icon: UserCircleIcon },
  { name: 'Profile', icon: UserCircleIcon },
  { name: 'Settings', icon: CogIcon },
];

const UserDashboardPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>(USER_TABS[0].name);
  const [userHealthData, setUserHealthData] = useState<UserHealthData | null>(null);
  const [healthHistory, setHealthHistory] = useState<HealthHistory[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<RecentAlert[]>([]);
  const [apiError, setApiError] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<string>('Checking...');
  const appContext = useContext(GlobalAppContext);

  // Get current user's health data from local server
  const fetchUserHealthData = async () => {
    try {
      console.log('🔄 Fetching current user health data...');
      setConnectionStatus('Connecting to local server...');
      
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        setApiError('User not logged in - no auth token');
        setConnectionStatus('Not logged in');
        return;
      }

      // Fetch health data from local server
      const response = await fetch('http://localhost:5000/api/health_data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      console.log('📡 Health data response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Health data response:', data);
        
        if (data.data && data.data.length > 0) {
          // Transform the health data to match the expected format
          const latestData = data.data[0]; // Most recent entry
          const transformedUserData: UserHealthData = {
            user_id: latestData.user_id,
            name: appContext?.currentUserProfile.name || 'User',
            email: appContext?.currentUserProfile.email || '',
            health_status: latestData.status?.toUpperCase() as 'NORMAL' | 'ABNORMAL' | 'CRITICAL' | 'ERROR',
            heart_rate: latestData.heart_rate,
            systolic_bp: latestData.systolic,
            diastolic_bp: latestData.diastolic,
            oxygen_level: latestData.spo2,
            body_temperature: latestData.temperature,
            last_updated: latestData.recorded_at,
            emergency_contact_name: '',
            emergency_contact_phone: ''
          };

          // Transform health history
          const transformedHistory: HealthHistory[] = data.data.map((item: any) => ({
            heart_rate: item.heart_rate,
            systolic_bp: item.systolic,
            diastolic_bp: item.diastolic,
            oxygen_level: item.spo2,
            body_temperature: item.temperature,
            health_status: item.status,
            last_updated: item.recorded_at
          }));

          setUserHealthData(transformedUserData);
          setHealthHistory(transformedHistory);
          setApiError('');
          setConnectionStatus(`Connected - Health data loaded (${data.data.length} records)`);
          console.log('✅ User health data loaded successfully');
        } else {
          console.log('ℹ️ No health data found for user');
          setApiError('No health data found. Try generating some demo data first.');
          setConnectionStatus('No data available');
        }
      } else {
        const errorData = await response.json();
        console.error('❌ HTTP Error:', response.status, errorData);
        setApiError(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        setConnectionStatus(`HTTP ${response.status} Error`);
      }
    } catch (error) {
      console.error('🚨 Error fetching user health data:', error);
      setApiError('Connection error. Please make sure the server is running on localhost:5000.');
      setConnectionStatus('Connection Failed');
    }
  };

  // Fetch alerts from local server
  const fetchUserAlerts = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        return;
      }

      const response = await fetch('http://localhost:5000/api/alerts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Alerts response:', data);
        
        if (data.alerts && data.alerts.length > 0) {
          // Transform alerts to match expected format
          const transformedAlerts: RecentAlert[] = data.alerts.map((alert: any) => ({
            alert_type: alert.alert_type?.toUpperCase() || 'SYSTEM',
            title: alert.alert_type === 'health_critical' ? 'Health Alert' : 
                   alert.alert_type === 'emergency' ? 'Emergency Alert' : 'System Alert',
            message: alert.message,
            emergency_contact_notified: alert.severity === 'critical',
            created_at: alert.created_at
          }));

          setRecentAlerts(transformedAlerts);
          console.log('✅ User alerts loaded successfully');
        }
      }
    } catch (error) {
      console.error('🚨 Error fetching user alerts:', error);
    }
  };

  // FIXED: Check for user login, not admin login
  useEffect(() => {
    if (appContext?.isUserLoggedIn && appContext?.isDeviceConnected) {
      fetchUserHealthData();
      fetchUserAlerts();
      
      // Refresh every 30 seconds
      const interval = setInterval(() => {
        fetchUserHealthData();
        fetchUserAlerts();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [appContext?.isUserLoggedIn, appContext?.isDeviceConnected]);

  const renderTabContent = () => {
    if (!appContext?.isDeviceConnected && selectedTab !== 'Profile' && selectedTab !== 'Settings') {
      return null;
    }
    switch (selectedTab) {
      case 'Heart Rate':
        return <HeartRateView currentUserOnly={true} userHealthData={userHealthData} healthHistory={healthHistory} />;
      case 'Steps':
        return <StepsView currentUserOnly={true} userHealthData={userHealthData} healthHistory={healthHistory} />;
      case 'Sleep':
        return <SleepView currentUserOnly={true} userHealthData={userHealthData} healthHistory={healthHistory} />;
      case 'Blood Oxygen':
        return <BloodOxygenView currentUserOnly={true} userHealthData={userHealthData} healthHistory={healthHistory} />;
      case 'Temperature':
        return <TemperatureView currentUserOnly={true} userHealthData={userHealthData} healthHistory={healthHistory} />;
      case 'Profile':
        return <ProfilePage />;
      case 'Settings':
        return <SettingsPage />;
      default:
        return null;
    }
  };

  // Utility to group health history by hour and get the latest entry for each hour
  function groupByHour(history: HealthHistory[]) {
    const map = new Map<string, HealthHistory>();
    history.forEach((item) => {
      const date = new Date(item.last_updated);
      // Format as 'YYYY-MM-DD HH:00' for grouping
      const hourKey = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:00`;
      if (!map.has(hourKey) || date > new Date(map.get(hourKey)!.last_updated)) {
        map.set(hourKey, item);
      }
    });
    // Sort by time descending
    return Array.from(map.values()).sort((a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime());
  }

  // Utility to filter health history for the last 24 hours
  function filterLast24Hours(history: HealthHistory[]) {
    const now = Date.now();
    return history.filter(h => (now - new Date(h.last_updated).getTime()) < 24 * 60 * 60 * 1000);
  }

  // Utility to format hour as '3:00 PM'
  function formatHour(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  // Utility to download health data as a formal PDF report
  async function downloadPDF(history: HealthHistory[]) {
    if (!history.length) return;
    const jsPDF = (await import('jspdf')).jsPDF;
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();
    // Header
    doc.setFontSize(18);
    doc.text('Wristbud Health Report', 105, 18, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Patient Name: ${userHealthData?.name || 'N/A'}`, 14, 30);
    doc.text(`Email: ${userHealthData?.email || 'N/A'}`, 14, 38);
    doc.text(`Date Generated: ${new Date().toLocaleString()}`, 14, 46);
    // Most recent data summary
    if (userHealthData) {
      doc.setFontSize(13);
      doc.text('Most Recent Data:', 14, 58);
      doc.setFontSize(11);
      let y = 64;
      const summary = [
        [`Status`, userHealthData.health_status],
        userHealthData.heart_rate ? ["Heart Rate (BPM)", String(userHealthData.heart_rate)] : null,
        userHealthData.systolic_bp && userHealthData.diastolic_bp ? ["Blood Pressure", `${userHealthData.systolic_bp}/${userHealthData.diastolic_bp}`] : null,
        userHealthData.oxygen_level ? ["Oxygen Level (%)", String(userHealthData.oxygen_level)] : null,
        userHealthData.body_temperature ? ["Temperature (°C)", String(userHealthData.body_temperature)] : null,
        userHealthData.steps ? ["Steps Today", String(userHealthData.steps)] : null,
        userHealthData.calories_burned ? ["Calories Burned", String(userHealthData.calories_burned)] : null,
        userHealthData.sleep_hours ? ["Sleep Hours", String(userHealthData.sleep_hours)] : null,
        userHealthData.analysis_report ? ["Analysis", userHealthData.analysis_report] : null,
        ["Last Updated", new Date(userHealthData.last_updated).toLocaleString()]
      ].filter(Boolean) as [string, string][];
      summary.forEach(([label, value]) => {
        doc.text(`${label}: ${value}`, 18, y);
        y += 7;
      });
    }
    // Table of last 24h data
    doc.setFontSize(13);
    doc.text('24-Hour Health Data (Hourly)', 14, 110);
    const headers = Object.keys(history[0]);
    const rows = history.map(row => headers.map(h => row[h as keyof HealthHistory] ?? ''));
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 115,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 14, right: 14 },
      tableWidth: 'auto',
    });
    doc.save(`wristbud_health_report_${new Date().toISOString().slice(0,10)}.pdf`);
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className={`border-l-4 p-4 rounded-md ${
        connectionStatus.includes('Connected') 
          ? 'bg-green-100 border-green-500 text-green-700' 
          : connectionStatus.includes('Error') || connectionStatus.includes('Failed')
          ? 'bg-red-100 border-red-500 text-red-700'
          : 'bg-yellow-100 border-yellow-500 text-yellow-700'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="py-1">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                connectionStatus.includes('Connected') ? 'bg-green-500' :
                connectionStatus.includes('Error') || connectionStatus.includes('Failed') ? 'bg-red-500' :
                'bg-yellow-500 animate-pulse'
              }`}></div>
            </div>
            <div>
              <p className="font-bold">🔗 Your Health Data Status</p>
              <p className="text-sm">{connectionStatus}</p>
            </div>
          </div>
        </div>
      </div>

      {/* API Error Display */}
      {apiError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
          <div className="flex">
            <div className="py-1">
              <ExclamationCircleIcon className="w-6 h-6 text-red-500 mr-3"/>
            </div>
            <div>
              <p className="font-bold">🚨 Health Data Error</p>
              <p className="text-sm">{apiError}</p>
              <div className="mt-2 text-xs">
                <p><strong>Troubleshooting:</strong></p>
                <ul className="list-disc list-inside">
                  <li>Ensure <code>get-user-health-data.php</code> is uploaded to server</li>
                  <li>Check if you have health data in the database</li>
                  <li>Verify your user account is active</li>
                  <li>Check browser console for detailed error logs</li>
                  <li><strong>Charts now show ONLY real database data - no mock data!</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current User Health Status */}
      {userHealthData && (
        <div className={`border-l-4 p-4 rounded-md ${
          userHealthData.health_status === 'CRITICAL' ? 'bg-red-100 border-red-500 text-red-700' :
          userHealthData.health_status === 'ABNORMAL' ? 'bg-yellow-100 border-yellow-500 text-yellow-700' :
          'bg-green-100 border-green-500 text-green-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="py-1">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  userHealthData.health_status === 'CRITICAL' ? 'bg-red-500' :
                  userHealthData.health_status === 'ABNORMAL' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}></div>
              </div>
              <div>
                <p className="font-bold">
                  🏥 Your Health Status: {userHealthData.health_status}
                </p>
                <p className="text-sm">
                  Last updated: {new Date(userHealthData.last_updated).toLocaleString()}
                </p>
                {userHealthData.device_status && (
                  <p className="text-xs">
                    Device: {userHealthData.device_status}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Health Alerts */}
      {recentAlerts.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🚨 Recent Health Alerts</h3>
          <div className="space-y-3">
            {recentAlerts.slice(0, 3).map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                alert.alert_type === 'CRITICAL' ? 'border-red-500 bg-red-50' :
                alert.alert_type === 'EMERGENCY' ? 'border-red-600 bg-red-100' :
                'border-yellow-500 bg-yellow-50'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{alert.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    {alert.emergency_contact_notified && (
                      <p className="text-xs text-green-600 mt-1">✅ Emergency contact notified</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(alert.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Your Health Summary */}
      {userHealthData && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">📊 Your Health Summary (Real Database Data)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {userHealthData.heart_rate && (
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{userHealthData.heart_rate}</div>
                <div className="text-sm text-gray-600">❤️ Heart Rate (BPM)</div>
              </div>
            )}
            {userHealthData.systolic_bp && userHealthData.diastolic_bp && (
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{userHealthData.systolic_bp}/{userHealthData.diastolic_bp}</div>
                <div className="text-sm text-gray-600">🩸 Blood Pressure</div>
              </div>
            )}
            {userHealthData.oxygen_level && (
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{userHealthData.oxygen_level}%</div>
                <div className="text-sm text-gray-600">🫁 Oxygen Level</div>
              </div>
            )}
            {userHealthData.body_temperature && (
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{userHealthData.body_temperature}°C</div>
                <div className="text-sm text-gray-600">🌡️ Temperature</div>
              </div>
            )}
          </div>
          
          {/* Additional metrics */}
          {(userHealthData.steps || userHealthData.calories_burned || userHealthData.sleep_hours) && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {userHealthData.steps && (
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{userHealthData.steps.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">👟 Steps Today</div>
                </div>
              )}
              {userHealthData.calories_burned && (
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{userHealthData.calories_burned}</div>
                  <div className="text-sm text-gray-600">🔥 Calories Burned</div>
                </div>
              )}
              {userHealthData.sleep_hours && (
                <div className="text-center p-3 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">{userHealthData.sleep_hours}h</div>
                  <div className="text-sm text-gray-600">😴 Sleep Hours</div>
                </div>
              )}
            </div>
          )}
          
          {userHealthData.analysis_report && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">📋 Health Analysis</h4>
              <p className="text-sm text-gray-700">{userHealthData.analysis_report}</p>
            </div>
          )}

          {/* Emergency Contact Info */}
          {userHealthData.emergency_contact_name && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">🚨 Emergency Contact</h4>
              <div className="text-sm text-gray-700">
                <p><strong>{userHealthData.emergency_contact_name}</strong></p>
                <p>{userHealthData.emergency_contact_phone}</p>
                {userHealthData.emergency_contact_relationship && (
                  <p className="text-gray-600">Relationship: {userHealthData.emergency_contact_relationship}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Health History Chart */}
      {healthHistory.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">📈 Your Health Trends (Real Database History)</h3>
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              onClick={() => downloadPDF(filterLast24Hours(healthHistory))}
            >
              Download My Health Data (24h PDF)
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Heart Rate Readings (Hourly)</h4>
              <div className="space-y-1">
                {groupByHour(healthHistory.filter(h => h.heart_rate)).slice(0, 24).map((reading, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{formatHour(reading.last_updated)}</span>
                    <span className="font-medium">{reading.heart_rate} BPM</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Blood Pressure Readings (Hourly)</h4>
              <div className="space-y-1">
                {groupByHour(healthHistory.filter(h => h.systolic_bp && h.diastolic_bp)).slice(0, 24).map((reading, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{formatHour(reading.last_updated)}</span>
                    <span className="font-medium">{reading.systolic_bp}/{reading.diastolic_bp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

       {!appContext?.isDeviceConnected && (
         <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md" role="alert">
            <div className="flex">
                <div className="py-1"><ExclamationCircleIcon className="w-6 h-6 text-yellow-500 mr-3"/></div>
                <div>
                    <p className="font-bold">Device Disconnected</p>
                    <p className="text-sm">Connect your device to start monitoring your health data.</p>
                </div>
            </div>
          </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg">
        <div className="px-4 sm:px-6 pt-3">
            <TabSelector tabs={USER_TABS} selectedTab={selectedTab} onSelectTab={setSelectedTab} />
        </div>
        <div className="p-4 sm:p-6">
            {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;