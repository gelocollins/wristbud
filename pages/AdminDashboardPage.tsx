import React, { useState, useContext, useEffect, useMemo } from 'react';
import { GlobalAppContext } from '../App';
import { ExclamationCircleIcon, EyeIcon, UserCircleIcon, HeartIcon, UserCircleIcon as ProfileIcon, CogIcon } from '../constants';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

// PDF styles
const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 24, marginBottom: 20 },
  section: { marginBottom: 10 },
  header: { fontSize: 18, marginBottom: 10 },
  tableView: { width: 'auto', marginBottom: 10 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' },
  tableCol: { width: '25%', padding: 5 },
  tableCell: { fontSize: 10 },
  text: { fontSize: 12, marginBottom: 5 },
});

// PDF Document Component
interface HealthReportProps {
  user: User;
  healthData: UserHealthData[];
  alerts: UserAlert[];
}

const UserHealthReport: React.FC<HealthReportProps> = ({ user, healthData, alerts }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Health Data Report</Text>
      
      {/* User Info */}
      <View style={styles.section}>
        <Text style={styles.header}>User Information</Text>
        <Text style={styles.text}>Name: {user.name}</Text>
        <Text style={styles.text}>Email: {user.email}</Text>
        <Text style={styles.text}>Emergency Contact: {user.emergency_contact1 || 'Not set'}</Text>
        <Text style={styles.text}>Emergency Phone: {user.emergency_phone1 || 'Not set'}</Text>
      </View>

      {/* Health Data */}
      <View style={styles.section}>
        <Text style={styles.header}>Health Data History</Text>
        <View style={styles.tableView}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Date</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Heart Rate</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Blood Pressure</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Status</Text></View>
          </View>
          {healthData.map((record) => (
            <View style={styles.tableRow} key={record.id}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{new Date(record.recorded_at).toLocaleDateString()}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{record.heart_rate} BPM</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{record.systolic}/{record.diastolic}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{record.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Alerts */}
      <View style={styles.section}>
        <Text style={styles.header}>Recent Alerts</Text>
        {alerts.map((alert) => (
          <View key={alert.id} style={styles.text}>
            <Text>Type: {alert.alert_type}</Text>
            <Text>Message: {alert.message}</Text>
            <Text>Date: {new Date(alert.created_at).toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

interface User {
  id: number;
  name: string;
  email: string;
  emergency_contact1: string;
  emergency_phone1: string;
  emergency_contact2: string;
  emergency_phone2: string;
  emergency_contact3?: string;
  emergency_phone3?: string;
  created_at: string;
}

interface UserHealthData {
  id: number;
  user_id: number;
  heart_rate: number;
  systolic: number;
  diastolic: number;
  spo2: number;
  temperature: number;
  status: string;
  activity: string;
  context_tag: string;
  location_address: string;
  recorded_at: string;
}

interface UserAlert {
  id: number;
  user_id: number;
  alert_type: string;
  message: string;
  severity: string;
  location_address: string;
  created_at: string;
}

const AdminDashboardPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userHealthData, setUserHealthData] = useState<UserHealthData[]>([]);
  const [userAlerts, setUserAlerts] = useState<UserAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const appContext = useContext(GlobalAppContext);

  // --- Live Monitor State ---
  const [liveUsers, setLiveUsers] = useState<any[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState('');

  // --- Live Monitor Polling ---
  useEffect(() => {
    let interval;
    const fetchLiveUsers = async () => {
      setLiveLoading(true);
      setLiveError('');
      try {
        const res = await fetch('http://localhost:5000/api/admin/users');
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        const usersWithStatus = data.users.map((user) => {
          const latest = user.health_history && user.health_history[0];
          return {
            ...user,
            status: latest ? latest.status : 'unknown',
            last_updated: latest ? latest.recorded_at : null,
            heart_rate: latest ? latest.heart_rate : null,
          };
        });
        setLiveUsers(usersWithStatus);
      } catch (err) {
        setLiveError('Failed to load live user data');
      } finally {
        setLiveLoading(false);
      }
    };
    fetchLiveUsers();
    interval = setInterval(fetchLiveUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  const ADMIN_TABS = useMemo(() => [
    { name: 'Live Monitor', icon: UserCircleIcon },
    { name: 'Dashboard', icon: UserCircleIcon },
    { name: 'Profile', icon: ProfileIcon },
    { name: 'Settings', icon: CogIcon },
  ], []);

  // Fetch all users from local server
  const fetchAllUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔄 Admin fetching all users from local server...');
      
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        setError('Admin not authenticated');
        return;
      }

      // First, get all users (we'll need to create this endpoint)
      const response = await fetch('http://localhost:5000/api/admin/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      console.log('📡 Admin users response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Admin users response:', data);
        
        setUsers(data.users || []);
        console.log('✅ Admin loaded all users:', data.users?.length || 0);
      } else {
        const errorData = await response.json();
        console.error('❌ HTTP Error:', response.status, errorData);
        setError(errorData.error || `HTTP ${response.status}: Failed to fetch users`);
      }
    } catch (error) {
      console.error('🚨 Error fetching users:', error);
      setError('Connection error. Please make sure the server is running on localhost:5000.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific user's health data and alerts
  const fetchUserDetails = async (user: User) => {
    setLoading(true);
    setSelectedUser(user);
    setUserHealthData([]);
    setUserAlerts([]);
    
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        setError('Admin not authenticated');
        return;
      }

      // Fetch user's health data
      const healthResponse = await fetch(`http://localhost:5000/api/admin/user/${user.id}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setUserHealthData(healthData.data || []);
      }

      // Fetch user's alerts
      const alertsResponse = await fetch(`http://localhost:5000/api/admin/user/${user.id}/alerts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setUserAlerts(alertsData.alerts || []);
      }

      setShowUserDetails(true);
    } catch (error) {
      console.error('🚨 Error fetching user details:', error);
      setError('Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (appContext?.isAdminLoggedIn) {
      fetchAllUsers();
    }
  }, [appContext?.isAdminLoggedIn]);

  if (!appContext?.isAdminLoggedIn) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ExclamationCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Admin Access Required</h2>
          <p className="text-gray-600">You must be logged in as an administrator to view this page.</p>
        </div>
      </div>
    );
  }

  // Profile Tab Content
  const ProfileTab = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" defaultValue="Admin User" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" defaultValue="admin@wristbud.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input type="tel" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <input type="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input type="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input type="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Save Changes
        </button>
      </div>
    </div>
  );

  // Settings Tab Content
  const SettingsTab = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300" defaultChecked />
              <span className="ml-2 text-sm text-gray-700">Email notifications for critical alerts</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300" defaultChecked />
              <span className="ml-2 text-sm text-gray-700">SMS notifications for critical alerts</span>
            </label>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Preferences</h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="ml-2 text-sm text-gray-700">Enable dark mode</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="ml-2 text-sm text-gray-700">Enable auto-updates</span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Save Settings
        </button>
      </div>
    </div>
  );

  const LiveMonitorTab = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Live User Monitor</h2>
      {liveError && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">{liveError}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {liveUsers.map(user => {
          let borderColor = 'border-gray-300';
          if (user.status === 'critical') borderColor = 'border-red-500';
          else if (user.status === 'abnormal') borderColor = 'border-yellow-500';
          else if (user.status === 'normal') borderColor = 'border-green-500';
          return (
            <div key={user.id} className={`border-4 ${borderColor} rounded-xl p-4 shadow flex flex-col items-center transition-colors duration-300 bg-white`}>
              <UserCircleIcon className="w-10 h-10 text-blue-400 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
              <p className="text-xs text-gray-500 mb-1">{user.email}</p>
              <div className="text-sm font-medium mb-1">
                Status: <span className={`capitalize ${user.status === 'critical' ? 'text-red-600' : user.status === 'abnormal' ? 'text-yellow-600' : user.status === 'normal' ? 'text-green-600' : 'text-gray-500'}`}>{user.status || 'unknown'}</span>
              </div>
              {user.heart_rate && <div className="text-xs text-gray-700">HR: {user.heart_rate} BPM</div>}
              {user.last_updated && <div className="text-xs text-gray-400">{new Date(user.last_updated).toLocaleTimeString()}</div>}
            </div>
          );
        })}
        {liveUsers.length === 0 && !liveLoading && <div className="col-span-full text-center text-gray-400">No users found.</div>}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Live Monitor':
        return <LiveMonitorTab />;
      case 'Dashboard':
        return (
          <>
            {/* Search, Users List, User Details Modal, etc. */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border rounded-md"
                  />
                  <button
                    onClick={fetchAllUsers}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Refresh
                  </button>
                </div>
              </div>
              {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
                  {error}
                </div>
              )}
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center">
                              <UserCircleIcon className="w-6 h-6" />
                            </div>
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{user.name}</h4>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-xs text-gray-400">
                              Registered: {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Emergency Contacts</div>
                            <div className="text-xs text-gray-700">
                              <div><strong>1:</strong> {user.emergency_contact1} <span className="text-gray-500">{user.emergency_phone1}</span></div>
                              <div><strong>2:</strong> {user.emergency_contact2} <span className="text-gray-500">{user.emergency_phone2}</span></div>
                              {user.emergency_contact3 && user.emergency_phone3 && (
                                <div><strong>3:</strong> {user.emergency_contact3} <span className="text-gray-500">{user.emergency_phone3}</span></div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => fetchUserDetails(user)}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                          >
                            <EyeIcon className="w-4 h-4" />
                            <span>View Health Data</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && !loading && (
                    <div className="p-6 text-center text-gray-500">
                      {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                    </div>
                  )}
                </ul>
              </div>
            </div>
            {/* User Details Modal */}
            {showUserDetails && selectedUser && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-medium text-gray-900">
                        Health Data for {selectedUser.name}
                      </h3>
                      <button
                        onClick={() => setShowUserDetails(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <span className="text-2xl">&times;</span>
                      </button>
                    </div>
                    {/* User Info */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <strong>Email:</strong> {selectedUser.email}
                        </div>
                        <div>
                          <strong>Emergency Contact 1:</strong> {selectedUser.emergency_contact1} <span className="text-xs text-gray-500">{selectedUser.emergency_phone1}</span>
                        </div>
                        <div>
                          <strong>Emergency Contact 2:</strong> {selectedUser.emergency_contact2} <span className="text-xs text-gray-500">{selectedUser.emergency_phone2}</span>
                        </div>
                        {selectedUser.emergency_contact3 && selectedUser.emergency_phone3 && (
                          <div>
                            <strong>Emergency Contact 3:</strong> {selectedUser.emergency_contact3} <span className="text-xs text-gray-500">{selectedUser.emergency_phone3}</span>
                          </div>
                        )}
                        <div>
                          <strong>Registered:</strong> {new Date(selectedUser.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {/* Health Data */}
                    <div className="mb-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <HeartIcon className="w-5 h-5 mr-2 text-red-500" />
                        Health Data History ({userHealthData.length} records)
                      </h4>
                      {userHealthData.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Heart Rate</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Blood Pressure</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SpO2</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Temperature</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {userHealthData.slice(0, 10).map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    {new Date(record.recorded_at).toLocaleString()}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    {record.heart_rate} BPM
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    {record.systolic}/{record.diastolic}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    {record.spo2}%
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    {record.temperature}°F
                                  </td>
                                  <td className="px-4 py-2">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      record.status === 'critical' ? 'bg-red-100 text-red-800' :
                                      record.status === 'abnormal' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {record.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-500">
                                    {record.location_address || 'Unknown'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No health data found for this user.</p>
                      )}
                    </div>
                    {/* Alerts */}
                    <div className="mb-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">
                        🚨 Recent Alerts ({userAlerts.length})
                      </h4>
                      {userAlerts.length > 0 ? (
                        <div className="space-y-3">
                          {userAlerts.slice(0, 5).map((alert) => (
                            <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                              alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                              alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                              'border-yellow-500 bg-yellow-50'
                            }`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-medium text-gray-900">
                                    {alert.alert_type.replace('_', ' ').toUpperCase()}
                                  </h5>
                                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                                  {alert.location_address && (
                                    <p className="text-xs text-gray-500 mt-1">📍 {alert.location_address}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                    alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {alert.severity}
                                  </span>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {new Date(alert.created_at).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No alerts found for this user.</p>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <PDFDownloadLink
                        document={<UserHealthReport user={selectedUser} healthData={userHealthData} alerts={userAlerts} />}
                        fileName={`${selectedUser.name}_Health_Report.pdf`}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        {({ loading }) => (loading ? 'Generating PDF...' : 'Download PDF')}
                      </PDFDownloadLink>
                      <button
                        onClick={() => setShowUserDetails(false)}
                        className="ml-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        );
      case 'Profile':
        return <ProfileTab />;
      case 'Settings':
        return <SettingsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-lg">
        <div className="px-4 sm:px-6 pt-3">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
            {ADMIN_TABS.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm
                  focus:outline-none transition-colors duration-150
                  ${
                    tab.name === activeTab
                      ? 'border-brand-primary text-brand-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                aria-current={tab.name === activeTab ? 'page' : undefined}
              >
                <tab.icon className={`w-5 h-5 mr-2 ${tab.name === activeTab ? 'text-brand-primary' : 'text-gray-400 group-hover:text-gray-500'}`} />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 sm:p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;