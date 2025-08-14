import React, { useState, useContext, useEffect } from 'react';
import { GlobalAppContext } from '../App';
import { CogIcon } from '../constants'; // Using SVG icons

interface AppSettings {
  notifications: {
    email: boolean;
    push: boolean;
    healthAlerts: boolean;
  };
  units: 'metric' | 'imperial';
  theme: 'light' | 'dark' | 'system';
}

const SettingsPage: React.FC = () => {
  const appContext = useContext(GlobalAppContext);
  const { logoutAdmin, isDeviceConnected } = appContext || { logoutAdmin: () => {}, isDeviceConnected: false };

  const [settings, setSettings] = useState<AppSettings>({
    notifications: {
      email: true,
      push: false,
      healthAlerts: true,
    },
    units: 'metric',
    theme: 'system',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch settings from server on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        const res = await fetch('http://localhost:5000/api/settings', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings);
        } else {
          setError('Failed to fetch settings');
        }
      } catch (err) {
        setError('Connection error');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Update settings in server
  const updateSettings = async (newSettings: AppSettings) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      const res = await fetch('http://localhost:5000/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newSettings),
      });
      if (!res.ok) setError('Failed to update settings');
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof AppSettings['notifications']) => {
    const newSettings = {
      ...settings,
      notifications: { ...settings.notifications, [key]: !settings.notifications[key] }
    };
    setSettings(newSettings);
    updateSettings(newSettings);
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSettings = { ...settings, units: e.target.value as 'metric' | 'imperial' };
    setSettings(newSettings);
    updateSettings(newSettings);
  };
  
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value as AppSettings['theme'];
    const newSettings = { ...settings, theme: newTheme };
    setSettings(newSettings);
    updateSettings(newSettings);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const SettingSection: React.FC<{title: string; children: React.ReactNode}> = ({ title, children }) => (
    <div className="bg-white shadow-lg rounded-xl mb-6">
      <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
      </div>
      <div className="p-4 sm:p-6 space-y-4">
        {children}
      </div>
    </div>
  );

  const ToggleSwitch: React.FC<{label: string; enabled: boolean; onChange: () => void; id: string}> = 
    ({label, enabled, onChange, id}) => (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
      <button
        type="button"
        id={id}
        onClick={onChange}
        className={`${
          enabled ? 'bg-brand-primary' : 'bg-gray-200'
        } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary`}
        role="switch"
        aria-checked={enabled}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={`${
            enabled ? 'translate-x-5' : 'translate-x-0'
          } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
        />
      </button>
    </div>
  );

  if (!isDeviceConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
        <CogIcon className="w-20 h-20 mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold mb-2">Settings Unavailable</h2>
        <p>Please log in as admin and connect a device to manage settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        <SettingSection title="Notification Preferences">
            <ToggleSwitch id="pushNotif" label="Push Notifications" enabled={settings.notifications.push} onChange={() => handleNotificationChange('push')} />
            <ToggleSwitch id="healthAlertsNotif" label="Critical System Alerts" enabled={settings.notifications.healthAlerts} onChange={() => handleNotificationChange('healthAlerts')} />
        </SettingSection>

        <SettingSection title="Display Settings">
            <div>
                <label htmlFor="units" className="block text-sm font-medium text-gray-700">Measurement Units</label>
                <select
                id="units"
                name="units"
                value={settings.units}
                onChange={handleUnitChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md shadow-sm"
                >
                <option value="metric">Metric (kg, cm, °C)</option>
                <option value="imperial">Imperial (lb, ft, °F)</option>
                </select>
            </div>
            <div>
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700">App Theme</label>
                <select
                id="theme"
                name="theme"
                value={settings.theme}
                onChange={handleThemeChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md shadow-sm"
                >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System Default</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">Note: Dark mode applies to the overall page.</p>
            </div>
        </SettingSection>

        <SettingSection title="System Management">
            <p className="text-sm text-gray-600">Current Monitoring System: <span className="font-semibold text-brand-primary">WristBud Central v1.0</span></p>
            <div className="mt-4 space-x-3">
                <button 
                    onClick={() => logoutAdmin()}
                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Log Out
                </button>
            </div>
        </SettingSection>
            
        <div className="text-right mt-8 mb-4">
            <button
                type="button"
                className="py-2 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={() => alert('Settings saved (mock)! These settings are local to this session.')}
            >
                Save All Settings
            </button>
        </div>
    </div>
  );
};

export default SettingsPage;