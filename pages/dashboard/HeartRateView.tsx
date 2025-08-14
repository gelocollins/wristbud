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

interface HealthHistory {
  heart_rate?: number;
  last_updated: string;
}

interface HeartRateViewProps {
  currentUserOnly?: boolean;
  userHealthData?: UserHealthData | null;
  healthHistory?: HealthHistory[];
}

const HeartRateView: React.FC<HeartRateViewProps> = ({ 
  currentUserOnly = false, 
  userHealthData = null,
  healthHistory = []
}) => {
  const appContext = useContext(GlobalAppContext);
  const { isDeviceConnected } = appContext || { isDeviceConnected: false };
  const [timeRange, setTimeRange] = useState<'Today' | 'Week' | 'Month'>('Today');
  
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  // Generate chart data ONLY from real database data
  const generateChartData = (period: 'Today' | 'Week' | 'Month'): ChartDataPoint[] => {
    if (!isDeviceConnected || !healthHistory || healthHistory.length === 0) {
      return [];
    }

    // Filter health history for heart rate data
    const heartRateData = healthHistory.filter(h => h.heart_rate && h.heart_rate > 0);
    
    if (heartRateData.length === 0) {
      return [];
    }

    const data: ChartDataPoint[] = [];
    const now = new Date();
    
    if (period === 'Today') {
      // Use actual heart rate readings from today
      heartRateData.forEach((reading, index) => {
        const time = new Date(reading.last_updated);
        data.push({
          time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: reading.heart_rate!,
        });
      });
      
      // If we have current data, mark the latest as "Now"
      if (data.length > 0 && userHealthData?.heart_rate) {
        data[data.length - 1].time = "Now";
      }
    } else if (period === 'Week') {
      // Group by day and calculate daily averages
      const dailyData: { [key: string]: number[] } = {};
      
      heartRateData.forEach(reading => {
        const date = new Date(reading.last_updated);
        const dayKey = date.toLocaleDateString([], { weekday: 'short' });
        
        if (!dailyData[dayKey]) {
          dailyData[dayKey] = [];
        }
        dailyData[dayKey].push(reading.heart_rate!);
      });
      
      // Calculate averages for each day
      Object.keys(dailyData).forEach(day => {
        const average = dailyData[day].reduce((sum, hr) => sum + hr, 0) / dailyData[day].length;
        data.push({
          time: day,
          value: Math.round(average),
        });
      });
    } else {
      // Group by week and calculate weekly averages
      const weeklyData: { [key: string]: number[] } = {};
      
      heartRateData.forEach(reading => {
        const date = new Date(reading.last_updated);
        const weekNumber = Math.ceil(date.getDate() / 7);
        const weekKey = `Week ${weekNumber}`;
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = [];
        }
        weeklyData[weekKey].push(reading.heart_rate!);
      });
      
      // Calculate averages for each week
      Object.keys(weeklyData).forEach(week => {
        const average = weeklyData[week].reduce((sum, hr) => sum + hr, 0) / weeklyData[week].length;
        data.push({
          time: week,
          value: Math.round(average),
        });
      });
    }
    
    return data.sort((a, b) => {
      // Sort by time for proper chart display
      if (period === 'Today') {
        return a.time === "Now" ? 1 : b.time === "Now" ? -1 : 0;
      }
      return 0;
    });
  };

  const chartData = generateChartData(timeRange);
  
  // Calculate stats from user's ACTUAL data only
  const currentHr = isDeviceConnected && userHealthData?.heart_rate 
    ? userHealthData.heart_rate
    : null;
  
  // Calculate resting HR from historical data
  const restingHr = isDeviceConnected && healthHistory && healthHistory.length > 0
    ? (() => {
        const heartRates = healthHistory
          .filter(h => h.heart_rate && h.heart_rate > 0)
          .map(h => h.heart_rate!);
        if (heartRates.length === 0) return null;
        
        // Get the lowest 10% of readings as resting HR estimate
        const sorted = heartRates.sort((a, b) => a - b);
        const restingCount = Math.max(1, Math.floor(sorted.length * 0.1));
        const restingReadings = sorted.slice(0, restingCount);
        return Math.round(restingReadings.reduce((sum, hr) => sum + hr, 0) / restingReadings.length);
      })()
    : null;
    
  const currentZone = currentHr
    ? currentHr < 100 ? 'Fat Burn' : currentHr < 140 ? 'Cardio' : 'Peak'
    : null;

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
          borderColor: 'rgb(239, 68, 68)', // Red color for heart rate
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: 'rgb(239, 68, 68)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            suggestedMin: Math.max(40, Math.min(...dataPoints) - 10),
            suggestedMax: Math.max(...dataPoints) + 10,
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
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y} BPM`;
              }
            }
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
      {/* User-specific info */}
      {currentUserOnly && userHealthData && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md">
          <p className="text-sm">
            ❤️ Showing your personal heart rate data from database. 
            Current reading: {userHealthData.heart_rate ? `${userHealthData.heart_rate} BPM` : 'No data'}
            {userHealthData.last_updated && (
              <span className="ml-2">
                (Last updated: {new Date(userHealthData.last_updated).toLocaleString()})
              </span>
            )}
          </p>
        </div>
      )}

      {/* No data warning */}
      {isDeviceConnected && (!userHealthData?.heart_rate && (!healthHistory || healthHistory.length === 0)) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded-md">
          <p className="text-sm">
            ⚠️ No heart rate data found in database. Please ensure your device is recording health data.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            title={currentUserOnly ? "Your Heart Rate" : "Current Heart Rate"} 
            value={currentHr || '--'}
            unit="BPM" 
            icon={HeartIcon}
            iconBgClass="bg-red-100"
            iconTextClass="text-red-600"
            tag={currentUserOnly ? "Personal" : "Live"}
            tagColor="bg-red-100 text-red-700"
          />
          <StatCard 
            title={currentUserOnly ? "Your Resting HR" : "Resting Heart Rate"} 
            value={restingHr || '--'}
            unit="BPM" 
            icon={ActivityIcon}
            iconBgClass="bg-green-100"
            iconTextClass="text-green-600"
            tag="From History"
            tagColor="bg-green-100 text-green-700"
          />
          <StatCard 
            title="Heart Rate Zone" 
            value={currentZone || '--'}
            unit="Current zone" 
            icon={TrendUpIcon}
            iconBgClass="bg-blue-100"
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
            <div className="text-center text-gray-500 py-10">
              {!isDeviceConnected ? (
                <p>Connect device to view chart</p>
              ) : (
                <div>
                  <p>No heart rate data available for {timeRange.toLowerCase()}</p>
                  <p className="text-sm mt-2">Charts show ONLY real database data - no mock data</p>
                </div>
              )}
            </div>
          )}
        </div>
      </ChartCard>

      <div className="bg-white shadow-lg rounded-xl p-5">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          {currentUserOnly ? "Your Heart Rate Insights" : "Heart Rate Insights"}
        </h3>
        {isDeviceConnected && (currentHr || (healthHistory && healthHistory.length > 0)) ? (
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {currentUserOnly ? (
                  <>
                    {currentHr && <li>Your current heart rate is <span className="font-semibold">{currentHr} BPM</span>.</li>}
                    {restingHr && <li>Your estimated resting heart rate is <span className="font-semibold">{restingHr} BPM</span> (calculated from your history).</li>}
                    {currentZone && <li>You are currently in the <span className="font-semibold">{currentZone}</span> heart rate zone.</li>}
                    <li>All data comes directly from your device readings stored in the database.</li>
                    {healthHistory && healthHistory.length > 0 && (
                      <li>We have <span className="font-semibold">{healthHistory.filter(h => h.heart_rate).length}</span> heart rate readings in your history.</li>
                    )}
                  </>
                ) : (
                  <>
                    {currentHr && <li>Current heart rate reading: <span className="font-semibold">{currentHr} BPM</span>.</li>}
                    {currentZone && <li>Heart rate zone: <span className="font-semibold">{currentZone}</span>.</li>}
                    <li>Data is sourced directly from database records.</li>
                  </>
                )}
            </ul>
            ) : (
            <p className="text-sm text-gray-500">
              {currentUserOnly 
                ? "No heart rate data found in your profile. Connect your device and ensure it's recording health data." 
                : "No heart rate data available. Connect device and ensure data is being recorded."
              }
            </p>
            )}
      </div>
    </div>
  );
};

export default HeartRateView;