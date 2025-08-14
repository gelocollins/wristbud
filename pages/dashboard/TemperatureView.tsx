import React, { useState, useContext, useEffect, useRef } from 'react';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import { ThermometerIcon, ActivityIcon, TrendUpIcon } from '../../constants';
import { GlobalAppContext } from '../../App';
import Chart from 'chart.js/auto';
import { ChartDataPoint } from '../../types';

interface UserHealthData {
  user_id: number;
  name: string;
  body_temperature?: number;
  last_updated: string;
}

interface HealthHistory {
  body_temperature?: number;
  last_updated: string;
}

interface TemperatureViewProps {
  currentUserOnly?: boolean;
  userHealthData?: UserHealthData | null;
  healthHistory?: HealthHistory[];
}

const TemperatureView: React.FC<TemperatureViewProps> = ({ 
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

    // Filter health history for temperature data
    const tempData = healthHistory.filter(h => h.body_temperature && h.body_temperature > 0);
    
    if (tempData.length === 0) {
      return [];
    }

    const data: ChartDataPoint[] = [];
    
    if (period === 'Today') {
      // Use actual temperature readings from today
      tempData.forEach((reading, index) => {
        const time = new Date(reading.last_updated);
        data.push({
          time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: reading.body_temperature!,
        });
      });
      
      // If we have current data, mark the latest as "Now"
      if (data.length > 0 && userHealthData?.body_temperature) {
        data[data.length - 1].time = "Now";
      }
    } else if (period === 'Week') {
      // Group by day and calculate daily averages
      const dailyData: { [key: string]: number[] } = {};
      
      tempData.forEach(reading => {
        const date = new Date(reading.last_updated);
        const dayKey = date.toLocaleDateString([], { weekday: 'short' });
        
        if (!dailyData[dayKey]) {
          dailyData[dayKey] = [];
        }
        dailyData[dayKey].push(reading.body_temperature!);
      });
      
      // Calculate averages for each day
      Object.keys(dailyData).forEach(day => {
        const average = dailyData[day].reduce((sum, temp) => sum + temp, 0) / dailyData[day].length;
        data.push({
          time: day,
          value: Math.round(average * 10) / 10, // Round to 1 decimal
        });
      });
    } else {
      // Group by week and calculate weekly averages
      const weeklyData: { [key: string]: number[] } = {};
      
      tempData.forEach(reading => {
        const date = new Date(reading.last_updated);
        const weekNumber = Math.ceil(date.getDate() / 7);
        const weekKey = `Week ${weekNumber}`;
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = [];
        }
        weeklyData[weekKey].push(reading.body_temperature!);
      });
      
      // Calculate averages for each week
      Object.keys(weeklyData).forEach(week => {
        const average = weeklyData[week].reduce((sum, temp) => sum + temp, 0) / weeklyData[week].length;
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
  const currentTemp = isDeviceConnected && userHealthData?.body_temperature 
    ? userHealthData.body_temperature
    : null;
  
  // Calculate average from historical data
  const averageTemp = isDeviceConnected && healthHistory && healthHistory.length > 0
    ? (() => {
        const tempReadings = healthHistory
          .filter(h => h.body_temperature && h.body_temperature > 0)
          .map(h => h.body_temperature!);
        if (tempReadings.length === 0) return null;
        
        const average = tempReadings.reduce((sum, temp) => sum + temp, 0) / tempReadings.length;
        return Math.round(average * 10) / 10; // Round to 1 decimal
      })()
    : null;
    
  // Calculate daily variation from historical data
  const dailyVariation = isDeviceConnected && healthHistory && healthHistory.length > 0
    ? (() => {
        const tempReadings = healthHistory
          .filter(h => h.body_temperature && h.body_temperature > 0)
          .map(h => h.body_temperature!);
        if (tempReadings.length === 0) return null;
        
        const max = Math.max(...tempReadings);
        const min = Math.min(...tempReadings);
        return Math.round((max - min) * 10) / 10; // Round to 1 decimal
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
          label: currentUserOnly ? 'Your Temperature (°C)' : 'Temperature (°C)',
          data: dataPoints,
          borderColor: 'rgb(245, 158, 11)', // Amber color for temperature
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: 'rgb(245, 158, 11)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            suggestedMin: Math.max(35, Math.min(...dataPoints) - 0.5),
            suggestedMax: Math.min(40, Math.max(...dataPoints) + 0.5),
            title: { display: true, text: '°C', color: '#6b7280' },
            grid: { color: '#e5e7eb' },
            ticks: { 
              color: '#6b7280',
              callback: function(value) {
                return value + '°C';
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
              label: (context) => `${context.dataset.label}: ${context.parsed.y}°C` 
            },
            backgroundColor: '#fff',
            titleColor: '#374151',
            bodyColor: '#4b5563',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 4,
          },
          legend: { labels: { color: '#374151' } }
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
        <div className="bg-amber-50 border-l-4 border-amber-400 text-amber-700 p-4 rounded-md">
          <p className="text-sm">
            🌡️ Showing your personal body temperature data from database. 
            Current temperature: {userHealthData.body_temperature ? `${userHealthData.body_temperature}°C` : 'No data'}
            {userHealthData.last_updated && (
              <span className="ml-2">
                (Last updated: {new Date(userHealthData.last_updated).toLocaleString()})
              </span>
            )}
          </p>
        </div>
      )}

      {/* No data warning */}
      {isDeviceConnected && (!userHealthData?.body_temperature && (!healthHistory || healthHistory.length === 0)) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded-md">
          <p className="text-sm">
            ⚠️ No body temperature data found in database. Please ensure your device is recording temperature data.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title={currentUserOnly ? "Your Current Temperature" : "Current Temperature"} 
          value={currentTemp ? `${currentTemp}°C` : '--'}
          unit=""
          icon={ThermometerIcon}
          iconBgClass="bg-amber-100"
          iconTextClass="text-amber-600"
          tag={currentUserOnly ? "Personal" : "Live"}
          tagColor="bg-amber-100 text-amber-700"
        />
        <StatCard 
          title={`Avg. Temp (${timeRange})`}
          value={averageTemp ? `${averageTemp}°C` : '--'}
          unit=""
          icon={ActivityIcon} 
          iconBgClass="bg-green-100"
          iconTextClass="text-green-600"
          tag="From History"
          tagColor="bg-green-100 text-green-700"
        />
        <StatCard 
          title={`Variation (${timeRange})`} 
          value={dailyVariation ? `${dailyVariation}°C` : '--'}
          unit=""
          icon={TrendUpIcon} 
          iconBgClass="bg-blue-100"
          iconTextClass="text-blue-600"
          tag="Range"
          tagColor="bg-blue-100 text-blue-700"
        />
      </div>

      <ChartCard 
        title={currentUserOnly ? "Your Body Temperature Trend" : "Body Temperature Trend"}
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
                <p>{currentUserOnly ? 'Connect your device to view your temperature chart.' : 'Connect device to view chart.'}</p>
              ) : (
                <div>
                  <p>No temperature data available for {timeRange.toLowerCase()}</p>
                  <p className="text-sm mt-2">Charts show ONLY real database data - no mock data</p>
                </div>
              )}
            </div>
          )}
        </div>
      </ChartCard>
      
      <div className="bg-white shadow-lg rounded-xl p-5">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          {currentUserOnly ? "Your Temperature Insights" : "Temperature Insights"}
        </h3>
        {isDeviceConnected && (currentTemp || (healthHistory && healthHistory.length > 0)) ? (
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            {currentUserOnly ? (
              <>
                {currentTemp && (
                  <li>Your current body temperature is <span className="font-semibold">{currentTemp}°C</span>. 
                    {currentTemp >= 36.1 && currentTemp <= 37.2 ? ' This is within the normal range (36.1°C to 37.2°C).' : 
                     currentTemp > 37.5 ? ' This is slightly elevated. Monitor for other symptoms.' :
                     ' This is below normal range. Consider consulting a healthcare provider if you feel unwell.'}
                  </li>
                )}
                {averageTemp && (
                  <li>Your average body temperature is <span className="font-semibold">{averageTemp}°C</span> based on your history.</li>
                )}
                {dailyVariation && (
                  <li>Your temperature variation is <span className="font-semibold">{dailyVariation}°C</span>. 
                    {dailyVariation > 1.0 ? ' This is higher than typical daily variation.' : ' This is normal daily variation.'}
                  </li>
                )}
                <li>Body temperature can fluctuate naturally throughout the day due to activity and environment.</li>
                <li>All data comes directly from your device readings stored in the database.</li>
                {healthHistory && healthHistory.length > 0 && (
                  <li>We have <span className="font-semibold">{healthHistory.filter(h => h.body_temperature).length}</span> temperature readings in your history.</li>
                )}
              </>
            ) : (
              <>
                {currentTemp && <li>Current temperature: <span className="font-semibold">{currentTemp}°C</span></li>}
                {averageTemp && <li>Average temperature: <span className="font-semibold">{averageTemp}°C</span></li>}
                <li>Data is sourced directly from database records.</li>
              </>
            )}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">
            {currentUserOnly 
              ? "No temperature data found in your profile. Connect your device and ensure it's recording temperature data." 
              : "No temperature data available. Connect device and ensure data is being recorded."
            }
          </p>
        )}
      </div>
    </div>
  );
};

export default TemperatureView;