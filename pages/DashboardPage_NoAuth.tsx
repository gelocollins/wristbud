import React, { useState, useContext, useEffect, useRef } from 'react';
import TabSelector from '../components/TabSelector';
import { DashboardTab } from '../types';
import { DASHBOARD_TABS, ExclamationCircleIcon } from '../constants';
import HeartRateView from './dashboard/HeartRateView';
import StepsView from './dashboard/StepsView';
import SleepView from './dashboard/SleepView';
import BloodOxygenView from './dashboard/BloodOxygenView';
import TemperatureView from './dashboard/TemperatureView';
import { GlobalAppContext } from '../App';

interface HealthData {
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
  sms_alerts_enabled: boolean;
  device_status?: string;
}

const DashboardPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<DashboardTab>(DashboardTab.HeartRate);
  const [healthData, setHealthData] = useState<HealthData[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastAlertSent, setLastAlertSent] = useState<{[key: string]: number}>({});
  const [apiError, setApiError] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<string>('Checking...');
  const monitoringInterval = useRef<NodeJS.Timeout | null>(null);
  const appContext = useContext(GlobalAppContext);

  // SMS Alert Configuration
  const SMS_API_ENDPOINT = 'http://localhost:8080/send-sms';

  // Fetch health data from database (NO AUTHENTICATION REQUIRED)
  const fetchHealthData = async () => {
    try {
      console.log('🔄 Fetching health data from database (no auth)...');
      setConnectionStatus('Connecting to database...');
      
      // Use the no-auth version of the API
      const response = await fetch('https://nocollateralloan.org/auth/api/get-all-health-data.php', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Health data response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Health data response:', data);
        
        if (data.success) {
          setHealthData(data.users || []);
          setApiError('');
          setConnectionStatus(`Connected - ${data.users?.length || 0} users found`);
          console.log('✅ Health data loaded successfully:', data.statistics);
          return data.users || [];
        } else {
          console.error('❌ API Error:', data.message);
          setApiError(data.message || 'Failed to fetch health data');
          setConnectionStatus('API Error');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, response.statusText, errorText);
        setApiError(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        setConnectionStatus(`HTTP ${response.status} Error`);
      }
    } catch (error) {
      console.error('🚨 Error fetching health data:', error);
      setApiError('Connection error. API file may not be uploaded to server.');
      setConnectionStatus('Connection Failed');
    }
    return [];
  };

  // Send SMS alert to emergency contact
  const sendSMSAlert = async (user: HealthData, alertType: string) => {
    if (!user.sms_alerts_enabled) {
      console.log(`📱 SMS alerts disabled for ${user.name}`);
      return;
    }

    const alertKey = `${user.user_id}_${alertType}`;
    const now = Date.now();
    
    // Prevent spam - only send alert once every 30 minutes
    if (lastAlertSent[alertKey] && (now - lastAlertSent[alertKey]) < 30 * 60 * 1000) {
      return;
    }

    try {
      const message = generateAlertMessage(user, alertType);
      
      const smsData = {
        to: user.emergency_contact_phone,
        message: message,
        contactName: user.emergency_contact_name,
        patientName: user.name,
        alertType: alertType,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(SMS_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smsData),
      });

      if (response.ok) {
        console.log(`📱 SMS alert sent to ${user.emergency_contact_name} for ${user.name}`);
        setLastAlertSent(prev => ({
          ...prev,
          [alertKey]: now
        }));
        
        // Log the alert in database (optional)
        await logHealthAlert(user, alertType, message);
      } else {
        console.error('❌ Failed to send SMS alert');
      }
    } catch (error) {
      console.error('🚨 Error sending SMS alert:', error);
    }
  };

  // Generate alert message
  const generateAlertMessage = (user: HealthData, alertType: string): string => {
    const timestamp = new Date().toLocaleString();
    const relationship = user.emergency_contact_relationship || 'Emergency Contact';
    
    let message = `🚨 WRISTBUD HEALTH ALERT 🚨\n\n`;
    message += `Dear ${user.emergency_contact_name} (${relationship}),\n\n`;
    message += `${user.name} has a ${alertType} health status detected at ${timestamp}.\n\n`;
    
    if (alertType === 'CRITICAL') {
      message += `⚠️ CRITICAL CONDITION DETECTED ⚠️\n`;
      message += `This requires immediate medical attention.\n\n`;
    } else if (alertType === 'ABNORMAL') {
      message += `⚠️ ABNORMAL READINGS DETECTED ⚠️\n`;
      message += `Please check on ${user.name} and consider medical consultation.\n\n`;
    }
    
    // Add vital signs if available
    if (user.systolic_bp && user.diastolic_bp) {
      message += `Blood Pressure: ${user.systolic_bp}/${user.diastolic_bp} mmHg\n`;
    }
    if (user.heart_rate) {
      message += `Heart Rate: ${user.heart_rate} BPM\n`;
    }
    if (user.oxygen_level) {
      message += `Oxygen Level: ${user.oxygen_level}%\n`;
    }
    if (user.body_temperature) {
      message += `Body Temperature: ${user.body_temperature}°C\n`;
    }
    
    message += `\nAnalysis: ${user.analysis_report || 'Health monitoring detected concerning readings.'}\n\n`;
    message += `Please contact ${user.name} immediately or call emergency services if needed.\n\n`;
    message += `- WristBud Health Monitoring System`;
    
    return message;
  };

  // Log health alert to database (optional, may fail without auth)
  const logHealthAlert = async (user: HealthData, alertType: string, message: string) => {
    try {
      // This may fail without authentication, but that's okay
      await fetch('https://nocollateralloan.org/log-health-alert.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.user_id,
          alert_type: alertType,
          title: `${alertType} Health Alert`,
          message: message,
          emergency_contact_notified: true
        }),
      });
    } catch (error) {
      console.log('ℹ️ Could not log health alert (auth required):', error);
    }
  };

  // Monitor health data for alerts
  const monitorHealthData = async () => {
    const users = await fetchHealthData();
    
    users.forEach((user: HealthData) => {
      if (user.health_status === 'CRITICAL' || user.health_status === 'ABNORMAL') {
        sendSMSAlert(user, user.health_status);
      }
    });
  };

  // Start/stop health monitoring
  useEffect(() => {
    if (appContext?.isDeviceConnected) {
      setIsMonitoring(true);
      
      // Initial fetch
      fetchHealthData();
      
      // Set up monitoring interval (check every 2 minutes)
      monitoringInterval.current = setInterval(() => {
        monitorHealthData();
      }, 2 * 60 * 1000);
      
      return () => {
        if (monitoringInterval.current) {
          clearInterval(monitoringInterval.current);
        }
        setIsMonitoring(false);
      };
    } else {
      setIsMonitoring(false);
      if (monitoringInterval.current) {
        clearInterval(monitoringInterval.current);
      }
    }
  }, [appContext?.isDeviceConnected]);

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
              <p className="font-bold">🔗 Database Connection Status (No Auth Required)</p>
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
              <p className="font-bold">🚨 Database Connection Error</p>
              <p className="text-sm">{apiError}</p>
              <div className="mt-2 text-xs">
                <p><strong>Troubleshooting:</strong></p>
                <ul className="list-disc list-inside">
                  <li>Ensure <code>get-all-health-data_no_auth.php</code> is uploaded to server</li>
                  <li>Check if database schema is updated with emergency contact fields</li>
                  <li>Verify CORS settings allow localhost connections</li>
                  <li>Check browser console for detailed error logs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Health Monitoring Status */}
      <div className={`border-l-4 p-4 rounded-md ${
        isMonitoring 
          ? 'bg-green-100 border-green-500 text-green-700' 
          : 'bg-yellow-100 border-yellow-500 text-yellow-700'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="py-1">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
              }`}></div>
            </div>
            <div>
              <p className="font-bold">
                {isMonitoring ? '🔄 Health Monitoring Active' : '⏸️ Health Monitoring Paused'}
              </p>
              <p className="text-sm">
                {isMonitoring 
                  ? `Monitoring ${healthData.length} users. SMS alerts enabled for abnormal/critical conditions.`
                  : 'Health monitoring is currently paused. Connect device to start monitoring.'
                }
              </p>
            </div>
          </div>
          {isMonitoring && (
            <div className="text-sm">
              <span className="font-medium">Last Check:</span> {new Date().toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Critical Health Alerts */}
      {healthData.filter(user => user.health_status === 'CRITICAL' || user.health_status === 'ABNORMAL').length > 0 && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
          <div className="flex">
            <div className="py-1">
              <ExclamationCircleIcon className="w-6 h-6 text-red-500 mr-3"/>
            </div>
            <div>
              <p className="font-bold">🚨 Active Health Alerts</p>
              <div className="text-sm mt-2 space-y-1">
                {healthData
                  .filter(user => user.health_status === 'CRITICAL' || user.health_status === 'ABNORMAL')
                  .map(user => (
                    <div key={user.user_id} className="flex justify-between items-center">
                      <span>
                        <strong>{user.name}</strong> - {user.health_status} 
                        {user.emergency_contact_name && (
                          <span className="text-xs ml-2">
                            (Emergency contact: {user.emergency_contact_name})
                          </span>
                        )}
                      </span>
                      <span className="text-xs">
                        {new Date(user.last_updated).toLocaleString()}
                      </span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Database Users Display */}
      {healthData.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">📊 Database Users ({healthData.length}) - No Auth Required</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthData.map(user => (
              <div key={user.user_id} className={`p-4 rounded-lg border-2 ${
                user.health_status === 'CRITICAL' ? 'border-red-500 bg-red-50' :
                user.health_status === 'ABNORMAL' ? 'border-yellow-500 bg-yellow-50' :
                'border-green-500 bg-green-50'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{user.name}</h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className={`text-sm font-medium ${
                      user.health_status === 'CRITICAL' ? 'text-red-600' :
                      user.health_status === 'ABNORMAL' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {user.health_status}
                    </p>
                    {/* Health metrics */}
                    <div className="mt-2 text-xs text-gray-600">
                      {user.heart_rate && <div>❤️ {user.heart_rate} BPM</div>}
                      {user.systolic_bp && user.diastolic_bp && <div>🩸 {user.systolic_bp}/{user.diastolic_bp}</div>}
                      {user.oxygen_level && <div>🫁 {user.oxygen_level}%</div>}
                      {user.body_temperature && <div>🌡️ {user.body_temperature}°C</div>}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(user.last_updated).toLocaleString()}
                  </div>
                </div>
                {user.emergency_contact_name && (
                  <div className="mt-2 text-xs text-gray-600">
                    🚨 Emergency: {user.emergency_contact_name} ({user.emergency_contact_phone})
                    {user.sms_alerts_enabled ? ' ✅ SMS' : ' ❌ SMS'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

       {!appContext?.isDeviceConnected && (
         <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md" role="alert">
            <div className="flex">
                <div className="py-1"><ExclamationCircleIcon className="w-6 h-6 text-yellow-500 mr-3"/></div>
                <div>
                    <p className="font-bold">Device Disconnected</p>
                    <p className="text-sm">Connect device to start health monitoring and view dashboard data.</p>
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