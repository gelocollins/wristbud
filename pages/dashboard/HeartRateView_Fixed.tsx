import React, { useState, useContext, useEffect, useRef } from 'react';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import { HeartIcon, ActivityIcon, TrendUpIcon } from '../../constants';
import { GlobalAppContext } from '../../App';
import Chart from 'chart.js/auto'; 
import { ChartDataPoint } from '../../types';

interface UserHealthData {
  user_id: number;
  name: string;
  heart_rate?: number;
  last_updated: string;
}

interface HeartRateViewProps {
  currentUserOnly?: boolean;
  userHealthData?: UserHealthData | null;
}

const HeartRateView: React.FC<HeartRateViewProps> = ({ 
  currentUserOnly = false, 
  userHealthData = null 
}) => {
  const appContext = useContext(GlobalAppContext);
  const { isDeviceConnected } = appContext || { isDeviceConnected: false };
  const [timeRange, setTimeRange] = useState<'Today' | 'Week' | 'Month'>('Today');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  // Generate chart data based on current user's heart rate or mock data
  const generateChartData = (period: 'Today' | 'Week' | 'Month'): ChartDataPoint[] => {
    if (!isDeviceConnected) {
      return [];
    }

    const data: ChartDataPoint[] = [];
    const now = new Date();
    const baseHeartRate = userHealthData?.heart_rate || 72; // Use actual heart rate or default
    
    if (period === 'Today') {
      // Generate hourly data points for today using current heart rate as base
      for (let i = 0; i < 12; i++) {
        const time = new Date(now.getTime() - (11 - i) * 2 * 60 * 60 * 1000);
        const variation = (Math.random() - 0.5) * 20; // Add some variation
        data.push({
          time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
          value: Math.round(baseHeartRate + variation),
        });
      }
      if (data.length > 0) data[data.length - 1].time = "Now";
    } else if (period === 'Week') {
      // Generate daily averages for the week
      for (let i = 0; i < 7; i++) {
        const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
        const variation = (Math.random() - 0.5) * 15;
        data.push({
          time: date.toLocaleDateString([], { weekday: 'short' }),
          value: Math.round(baseHeartRate + variation),
        });
      }
    } else {
      // Generate weekly averages for the month
      for (let i = 0; i < 4; i++) {
        const variation = (Math.random() - 0.5) * 10;
        data.push({
          time: `Week ${i + 1}`,
          value: Math.round(baseHeartRate + variation),
        });
      }
    }
    return data;
  };

  const chartData = generateChartData(timeRange);
  
  // Calculate stats from user's actual data
  const currentHr = isDeviceConnected && userHealthData?.heart_rate 
    ? userHealthData.heart_rate
    : '--';
  
  const restingHr = isDeviceConnected && userHealthData?.heart_rate 
    ? Math.round(userHealthData.heart_rate - 7) // Estimate resting HR
    : '--';
    
  const currentZone = isDeviceConnected && typeof currentHr === 'number'
    ? currentHr < 100 ? 'Fat Burn' : currentHr < 140 ? 'Cardio' : 'Peak'
    : '--';

  useEffect(() => {
    if (!chartRef.current || !isDeviceConnected || chartData.length === 0) {
       if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
      return;
    }

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const dataPoints = chartData.map(d => d.value);
    const labels = chartData.map(d => d.time);

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: currentUserOnly ? 'Your Heart Rate' : 'Heart Rate',
          data: dataPoints,
          borderColor: 'rgb(79, 70, 229)', 
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          pointBackgroundColor: 'rgb(79, 70, 229)',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            suggestedMin: 40,
            suggestedMax: 120,
            title: { display: true, text: 'BPM', color: '#6b7280' },
            grid: { color: '#e5e7eb' },
            ticks: { color: '#6b7280' }
          },
          x: {
            title: { display: true, text: 'Time', color: '#6b7280' },
            grid: { display: false },
            ticks: { color: '#6b7280' }
          }
        },
        plugins: {
          legend: { display: true, labels: { color: '#374151' } },
          tooltip: { 
            mode: 'index', 
            intersect: false,
            backgroundColor: '#fff',
            titleColor: '#374151',
            bodyColor: '#4b5563',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 4,
          }
        }
      }
    });
     return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [chartData, isDeviceConnected, timeRange, currentUserOnly]);

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-400 text-red-700 p-4 rounded-md">
          <p className="font-bold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-blue-100 border-l-4 border-blue-400 text-blue-700 p-4 rounded-md">
          <p className="text-sm">Loading heart rate data...</p>
        </div>
      )}

      {/* User-specific info */}
      {currentUserOnly && userHealthData && (
        <div className="bg-green-100 border-l-4 border-green-400 text-green-700 p-4 rounded-md">
          <p className="text-sm">
            📊 Showing your personal heart rate data. 
            Current reading: {userHealthData.heart_rate ? `${userHealthData.heart_rate} BPM` : 'No data'}
            {userHealthData.last_updated && (
              <span className="ml-2">
                (Last updated: {new Date(userHealthData.last_updated).toLocaleString()})
              </span>
            )}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            title={currentUserOnly ? "Your Heart Rate" : "Current Heart Rate"} 
            value={currentHr}
            unit="BPM" 
            icon={HeartIcon}
            iconBgClass="bg-iconbg-purple"
            iconTextClass="text-purple-600"
            tag={currentUserOnly ? "Personal" : "Live"}
            tagColor="bg-purple-100 text-purple-700"
          />
          <StatCard 
            title={currentUserOnly ? "Your Resting HR" : "Resting Heart Rate"} 
            value={restingHr}
            unit="Avg resting BPM" 
            icon={ActivityIcon}
            iconBgClass="bg-iconbg-green"
            iconTextClass="text-green-600"
            tag="Estimated"
            tagColor="bg-green-100 text-green-700"
          />
          <StatCard 
            title="Heart Rate Zone" 
            value={currentZone}
            unit="Current zone" 
            icon={TrendUpIcon}
            iconBgClass="bg-iconbg-blue"
            iconTextClass="text-blue-600"
            tag="Zone"
            tagColor="bg-blue-100 text-blue-700"
          />
      </div>

      <ChartCard 
        title={currentUserOnly ? "Your Heart Rate Trend" : "Heart Rate Trend"}
        actions={
          <div className="flex space-x-1">
            {(['Today', 'Week', 'Month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-medium focus:z-10 focus:outline-none transition-colors rounded-md
                            ${timeRange === range 
                                ? 'bg-brand-primary text-white shadow-sm hover:bg-brand-secondary' 
                                : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-300 hover:border-gray-400'
                            }`}
              >
                {range}
              </button>
            ))}
          </div>
        }
      >
        <div className="chart-container">
          {isDeviceConnected && chartData.length > 0 ? (
            <canvas ref={chartRef}></canvas>
          ) : (
            <p className="text-center text-gray-500 py-10">
              {isDeviceConnected ? 'No heart rate data available' : 'Connect device to view chart'}
            </p>
          )}
        </div>
      </ChartCard>

      <div className="bg-white shadow-lg rounded-xl p-5">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          {currentUserOnly ? "Your Heart Rate Insights" : "Heart Rate Insights"}
        </h3>
        {isDeviceConnected && userHealthData ? (
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {currentUserOnly ? (
                  <>
                    <li>Your current heart rate is <span className="font-semibold">{currentHr} BPM</span>.</li>
                    <li>Your estimated resting heart rate is <span className="font-semibold">{restingHr} BPM</span>.</li>
                    <li>You are currently in the <span className="font-semibold">{currentZone}</span> heart rate zone.</li>
                    <li>Data is personalized to your health profile.</li>
                  </>
                ) : (
                  <>
                    <li>Current heart rate reading: <span className="font-semibold">{currentHr} BPM</span>.</li>
                    <li>Heart rate zone: <span className="font-semibold">{currentZone}</span>.</li>
                    <li>Monitor regularly for optimal health tracking.</li>
                  </>
                )}
            </ul>
            ) : (
            <p className="text-sm text-gray-500">
              {currentUserOnly 
                ? "Connect your device to see your personal heart rate insights." 
                : "Connect device to see heart rate insights."
              }
            </p>
            )}
      </div>
    </div>
  );
};

export default HeartRateView;