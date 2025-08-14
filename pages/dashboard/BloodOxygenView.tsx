import React, { useState, useContext, useEffect, useRef } from 'react';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import { DropletIcon, ActivityIcon, ChevronDownIcon } from '../../constants'; 
import { GlobalAppContext } from '../../App';
import Chart from 'chart.js/auto';
import { ChartDataPoint } from '../../types';

interface UserHealthData {
  user_id: number;
  name: string;
  oxygen_level?: number;
  last_updated: string;
}

interface HealthHistory {
  oxygen_level?: number;
  last_updated: string;
}

interface BloodOxygenViewProps {
  currentUserOnly?: boolean;
  userHealthData?: UserHealthData | null;
  healthHistory?: HealthHistory[];
}

const BloodOxygenView: React.FC<BloodOxygenViewProps> = ({ 
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

    // Filter health history for oxygen level data
    const oxygenData = healthHistory.filter(h => h.oxygen_level && h.oxygen_level > 0);
    
    if (oxygenData.length === 0) {
      return [];
    }

    const data: ChartDataPoint[] = [];
    
    if (period === 'Today') {
      // Use actual oxygen level readings from today
      oxygenData.forEach((reading, index) => {
        const time = new Date(reading.last_updated);
        data.push({
          time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: reading.oxygen_level!,
        });
      });
      
      // If we have current data, mark the latest as "Now"
      if (data.length > 0 && userHealthData?.oxygen_level) {
        data[data.length - 1].time = "Now";
      }
    } else if (period === 'Week') {
      // Group by day and calculate daily averages
      const dailyData: { [key: string]: number[] } = {};
      
      oxygenData.forEach(reading => {
        const date = new Date(reading.last_updated);
        const dayKey = date.toLocaleDateString([], { weekday: 'short' });
        
        if (!dailyData[dayKey]) {
          dailyData[dayKey] = [];
        }
        dailyData[dayKey].push(reading.oxygen_level!);
      });
      
      // Calculate averages for each day
      Object.keys(dailyData).forEach(day => {
        const average = dailyData[day].reduce((sum, level) => sum + level, 0) / dailyData[day].length;
        data.push({
          time: day,
          value: Math.round(average * 10) / 10, // Round to 1 decimal
        });
      });
    } else {
      // Group by week and calculate weekly averages
      const weeklyData: { [key: string]: number[] } = {};
      
      oxygenData.forEach(reading => {
        const date = new Date(reading.last_updated);
        const weekNumber = Math.ceil(date.getDate() / 7);
        const weekKey = `Week ${weekNumber}`;
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = [];
        }
        weeklyData[weekKey].push(reading.oxygen_level!);
      });
      
      // Calculate averages for each week
      Object.keys(weeklyData).forEach(week => {
        const average = weeklyData[week].reduce((sum, level) => sum + level, 0) / weeklyData[week].length;
        data.push({
          time: week,
          value: Math.round(average * 10) / 10, // Round to 1 decimal
        });
      });
    }
    
    return data.sort((a, b) => {
      if (period === 'Today') {
        return a.time === "Now" ? 1 : b.time === "Now" ? -1 : 0;
      }
      return 0;
    });
  };

  const chartData = generateChartData(timeRange);
  
  // Calculate stats from user's ACTUAL data only
  const currentSpO2 = isDeviceConnected && userHealthData?.oxygen_level 
    ? userHealthData.oxygen_level
    : null;
  
  // Calculate average from historical data
  const averageSpO2 = isDeviceConnected && healthHistory && healthHistory.length > 0
    ? (() => {
        const oxygenReadings = healthHistory
          .filter(h => h.oxygen_level && h.oxygen_level > 0)
          .map(h => h.oxygen_level!);
        if (oxygenReadings.length === 0) return null;
        
        const average = oxygenReadings.reduce((sum, level) => sum + level, 0) / oxygenReadings.length;
        return Math.round(average * 10) / 10; // Round to 1 decimal
      })()
    : null;
    
  // Calculate lowest from historical data
  const lowestSpO2 = isDeviceConnected && healthHistory && healthHistory.length > 0
    ? (() => {
        const oxygenReadings = healthHistory
          .filter(h => h.oxygen_level && h.oxygen_level > 0)
          .map(h => h.oxygen_level!);
        if (oxygenReadings.length === 0) return null;
        
        return Math.min(...oxygenReadings);
      })()
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
          label: currentUserOnly ? 'Your SpO2 (%)' : 'SpO2 (%)',
          data: dataPoints,
          borderColor: 'rgb(14, 165, 233)', // Sky blue color for oxygen
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: 'rgb(14, 165, 233)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            suggestedMin: Math.max(85, Math.min(...dataPoints) - 2),
            suggestedMax: Math.min(100, Math.max(...dataPoints) + 2),
            title: { display: true, text: 'SpO2 (%)', color: '#6b7280' },
            grid: { color: '#e5e7eb' },
            ticks: { 
              color: '#6b7280',
              callback: function(value) {
                return value + '%';
              }
            }
          },
          x: {
            title: { display: true, text: 'Time', color: '#6b7280' },
            grid: { display: false },
            ticks: { color: '#6b7280' }
          }
        },
        plugins: {
          tooltip: { 
            callbacks: { 
              label: (context) => `${context.dataset.label}: ${context.parsed.y}%` 
            },
            backgroundColor: '#fff',
            titleColor: '#374151',
            bodyColor: '#4b5563',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 4,
          },
          legend: { labels: { color: '#374151'}}
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
        <div className="bg-sky-50 border-l-4 border-sky-400 text-sky-700 p-4 rounded-md">
          <p className="text-sm">
            🫁 Showing your personal blood oxygen data from database. 
            Current SpO2: {userHealthData.oxygen_level ? `${userHealthData.oxygen_level}%` : 'No data'}
            {userHealthData.last_updated && (
              <span className="ml-2">
                (Last updated: {new Date(userHealthData.last_updated).toLocaleString()})
              </span>
            )}
          </p>
        </div>
      )}

      {/* No data warning */}
      {isDeviceConnected && (!userHealthData?.oxygen_level && (!healthHistory || healthHistory.length === 0)) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded-md">
          <p className="text-sm">
            ⚠️ No blood oxygen data found in database. Please ensure your device is recording SpO2 data.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title={currentUserOnly ? "Your Current SpO2" : "Current SpO2"} 
          value={currentSpO2 ? `${currentSpO2}%` : '--'}
          unit=""
          icon={DropletIcon}
          iconBgClass="bg-sky-100"
          iconTextClass="text-sky-600"
          tag={currentUserOnly ? "Personal" : "Live"}
          tagColor="bg-sky-100 text-sky-700"
        />
        <StatCard 
          title={`Avg. SpO2 (${timeRange})`}
          value={averageSpO2 ? `${averageSpO2}%` : '--'}
          unit=""
          icon={ActivityIcon} 
          iconBgClass="bg-blue-100" 
          iconTextClass="text-blue-600"
          tag="From History"
          tagColor="bg-blue-100 text-blue-700"
        />
        <StatCard 
          title={`Lowest SpO2 (${timeRange})`} 
          value={lowestSpO2 ? `${lowestSpO2}%` : '--'}
          unit=""
          icon={ChevronDownIcon} 
          iconBgClass="bg-orange-100"
          iconTextClass="text-orange-600"
          tag="Minimum"
          tagColor="bg-orange-100 text-orange-700"
        />
      </div>

      <ChartCard 
        title={currentUserOnly ? "Your Blood Oxygen Trend" : "Blood Oxygen Trend"}
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
                <p>{currentUserOnly ? 'Connect your device to view your blood oxygen chart.' : 'Connect device to view chart.'}</p>
              ) : (
                <div>
                  <p>No blood oxygen data available for {timeRange.toLowerCase()}</p>
                  <p className="text-sm mt-2">Charts show ONLY real database data - no mock data</p>
                </div>
              )}
            </div>
          )}
        </div>
      </ChartCard>
      
      <div className="bg-white shadow-lg rounded-xl p-5">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          {currentUserOnly ? "Your Blood Oxygen Insights" : "Blood Oxygen Insights"}
        </h3>
        {isDeviceConnected && (currentSpO2 || (healthHistory && healthHistory.length > 0)) ? (
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            {currentUserOnly ? (
              <>
                {currentSpO2 && (
                  <li>Your current SpO2 level is <span className="font-semibold">{currentSpO2}%</span>
                    {currentSpO2 >= 95 ? ', which is in the normal range (95-100%).' : ', which is below normal. Consider consulting a healthcare provider.'}
                  </li>
                )}
                {averageSpO2 && (
                  <li>Your average SpO2 is <span className="font-semibold">{averageSpO2}%</span> based on your history.</li>
                )}
                {lowestSpO2 && lowestSpO2 < 95 && (
                  <li className="text-red-600 font-medium">⚠️ Your lowest SpO2 was <span className="font-bold">{lowestSpO2}%</span>. If this persists or you feel unwell, consult a doctor.</li>
                )}
                {lowestSpO2 && lowestSpO2 >= 95 && (
                  <li>✅ Your SpO2 levels have remained in the healthy range.</li>
                )}
                <li>All data comes directly from your device readings stored in the database.</li>
                {healthHistory && healthHistory.length > 0 && (
                  <li>We have <span className="font-semibold">{healthHistory.filter(h => h.oxygen_level).length}</span> SpO2 readings in your history.</li>
                )}
              </>
            ) : (
              <>
                {currentSpO2 && <li>Current SpO2: <span className="font-semibold">{currentSpO2}%</span></li>}
                {averageSpO2 && <li>Average SpO2: <span className="font-semibold">{averageSpO2}%</span></li>}
                <li>Data is sourced directly from database records.</li>
              </>
            )}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">
            {currentUserOnly 
              ? "No blood oxygen data found in your profile. Connect your device and ensure it's recording SpO2 data." 
              : "No blood oxygen data available. Connect device and ensure data is being recorded."
            }
          </p>
        )}
      </div>
    </div>
  );
};

export default BloodOxygenView;