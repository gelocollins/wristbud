import React, { useState, useContext, useEffect, useRef } from 'react';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import { ShoePrintsIcon, ChartBarIcon, TrendUpIcon } from '../../constants';
import { GlobalAppContext } from '../../App';
import Chart from 'chart.js/auto';
import { ChartDataPoint } from '../../types';

interface UserHealthData {
  user_id: number;
  name: string;
  steps?: number;
  calories_burned?: number;
  distance_walked?: number;
  last_updated: string;
}

interface HealthHistory {
  steps?: number;
  last_updated: string;
}

interface StepsViewProps {
  currentUserOnly?: boolean;
  userHealthData?: UserHealthData | null;
  healthHistory?: HealthHistory[];
}

const StepsView: React.FC<StepsViewProps> = ({ 
  currentUserOnly = false, 
  userHealthData = null,
  healthHistory = []
}) => {
  const appContext = useContext(GlobalAppContext);
  const { isDeviceConnected } = appContext || { isDeviceConnected: false };
  const [timeRange, setTimeRange] = useState<'Today' | 'Week' | 'Month'>('Week');
  
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  // Generate chart data ONLY from real database data
  const generateChartData = (period: 'Today' | 'Week' | 'Month'): ChartDataPoint[] => {
    if (!isDeviceConnected || !healthHistory || healthHistory.length === 0) {
      return [];
    }

    // Filter health history for steps data
    const stepsData = healthHistory.filter(h => h.steps && h.steps > 0);
    
    if (stepsData.length === 0) {
      return [];
    }

    const data: ChartDataPoint[] = [];
    
    if (period === 'Today') {
      // Use actual steps readings from today
      stepsData.forEach((reading, index) => {
        const time = new Date(reading.last_updated);
        data.push({
          time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: reading.steps!,
        });
      });
      
      // If we have current data, mark the latest as "Now"
      if (data.length > 0 && userHealthData?.steps) {
        data[data.length - 1].time = "Now";
      }
    } else if (period === 'Week') {
      // Group by day and get daily totals
      const dailyData: { [key: string]: number[] } = {};
      
      stepsData.forEach(reading => {
        const date = new Date(reading.last_updated);
        const dayKey = date.toLocaleDateString([], { weekday: 'short' });
        
        if (!dailyData[dayKey]) {
          dailyData[dayKey] = [];
        }
        dailyData[dayKey].push(reading.steps!);
      });
      
      // Get the maximum steps for each day (assuming cumulative)
      Object.keys(dailyData).forEach(day => {
        const maxSteps = Math.max(...dailyData[day]);
        data.push({
          time: day,
          value: maxSteps,
        });
      });
    } else {
      // Group by week and get weekly totals
      const weeklyData: { [key: string]: number[] } = {};
      
      stepsData.forEach(reading => {
        const date = new Date(reading.last_updated);
        const weekNumber = Math.ceil(date.getDate() / 7);
        const weekKey = `Week ${weekNumber}`;
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = [];
        }
        weeklyData[weekKey].push(reading.steps!);
      });
      
      // Get the maximum steps for each week
      Object.keys(weeklyData).forEach(week => {
        const maxSteps = Math.max(...weeklyData[week]);
        data.push({
          time: week,
          value: maxSteps,
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
  const totalStepsToday = isDeviceConnected && userHealthData?.steps 
    ? userHealthData.steps
    : null;
  
  // Calculate weekly average from historical data
  const weeklyAverage = isDeviceConnected && healthHistory && healthHistory.length > 0
    ? (() => {
        const stepsReadings = healthHistory
          .filter(h => h.steps && h.steps > 0)
          .map(h => h.steps!);
        if (stepsReadings.length === 0) return null;
        
        // Get average of all readings
        return Math.round(stepsReadings.reduce((sum, steps) => sum + steps, 0) / stepsReadings.length);
      })()
    : null;
    
  const goal = 10000;
  const goalProgress = totalStepsToday 
    ? Math.round((totalStepsToday / goal) * 100)
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
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: currentUserOnly ? 'Your Steps' : 'Steps',
          data: dataPoints,
          backgroundColor: 'rgb(168, 85, 247)', // Purple color for steps
          borderColor: 'rgb(147, 51, 234)',
          borderWidth: 1,
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Steps Count', color: '#6b7280' },
            grid: { color: '#e5e7eb' },
            ticks: { 
              color: '#6b7280',
              callback: function(value) {
                return value.toLocaleString();
              }
            }
          },
          x: {
            title: { display: true, text: 'Period', color: '#6b7280' },
            grid: { display: false },
            ticks: { color: '#6b7280' }
          }
        },
        plugins: {
          legend: { display: true, labels: { color: '#374151'} },
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
                return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} steps`;
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
        <div className="bg-purple-50 border-l-4 border-purple-400 text-purple-700 p-4 rounded-md">
          <p className="text-sm">
            👟 Showing your personal steps data from database. 
            Current steps: {userHealthData.steps ? `${userHealthData.steps.toLocaleString()} steps` : 'No data'}
            {userHealthData.last_updated && (
              <span className="ml-2">
                (Last updated: {new Date(userHealthData.last_updated).toLocaleString()})
              </span>
            )}
          </p>
        </div>
      )}

      {/* No data warning */}
      {isDeviceConnected && (!userHealthData?.steps && (!healthHistory || healthHistory.length === 0)) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded-md">
          <p className="text-sm">
            ⚠️ No steps data found in database. Please ensure your device is recording activity data.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title={currentUserOnly ? "Your Steps Today" : "Today's Steps"} 
          value={totalStepsToday ? totalStepsToday.toLocaleString() : '--'}
          unit="steps" 
          icon={ShoePrintsIcon}
          iconBgClass="bg-purple-100" 
          iconTextClass="text-purple-600"
          tag={currentUserOnly ? "Personal" : "Live"}
          tagColor="bg-purple-100 text-purple-700"
        />
        <StatCard 
          title={currentUserOnly ? "Your Average Steps" : "Average Steps"} 
          value={weeklyAverage ? weeklyAverage.toLocaleString() : '--'}
          unit="steps / reading" 
          icon={ChartBarIcon}
          iconBgClass="bg-yellow-100"
          iconTextClass="text-yellow-600"
          tag="From History"
          tagColor="bg-yellow-100 text-yellow-700"
        />
        <StatCard 
          title="Goal Progress" 
          value={goalProgress ? `${goalProgress}%` : '--'}
          unit={`of ${goal.toLocaleString()} steps`} 
          icon={TrendUpIcon}
          iconBgClass="bg-green-100"
          iconTextClass="text-green-600"
          tag="Daily Goal"
          tagColor="bg-green-100 text-green-700"
        />
      </div>

      <ChartCard 
        title={currentUserOnly ? "Your Steps Trend" : "Steps Trend"}
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
                  <p>No steps data available for {timeRange.toLowerCase()}</p>
                  <p className="text-sm mt-2">Charts show ONLY real database data - no mock data</p>
                </div>
              )}
            </div>
          )}
        </div>
      </ChartCard>
      
      <div className="bg-white shadow-lg rounded-xl p-5">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          {currentUserOnly ? "Your Steps Insights" : "Steps Insights"}
        </h3>
        {isDeviceConnected && (totalStepsToday || (healthHistory && healthHistory.length > 0)) ? (
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            {currentUserOnly ? (
              <>
                {totalStepsToday && (
                  <li>You've taken <span className="font-semibold">{totalStepsToday.toLocaleString()}</span> steps today.</li>
                )}
                {totalStepsToday && totalStepsToday < goal / 2 && (
                  <li>💡 You're less than halfway to your daily goal. Try a short walk!</li>
                )}
                {totalStepsToday && totalStepsToday >= goal && (
                  <li>🎉 Congratulations on reaching your daily step goal!</li>
                )}
                {userHealthData?.calories_burned && (
                  <li>You've burned approximately <span className="font-semibold">{userHealthData.calories_burned}</span> calories.</li>
                )}
                {userHealthData?.distance_walked && (
                  <li>You've walked approximately <span className="font-semibold">{userHealthData.distance_walked} km</span> today.</li>
                )}
                <li>All data comes directly from your device readings stored in the database.</li>
                {healthHistory && healthHistory.length > 0 && (
                  <li>We have <span className="font-semibold">{healthHistory.filter(h => h.steps).length}</span> steps readings in your history.</li>
                )}
              </>
            ) : (
              <>
                {totalStepsToday && <li>Current steps: <span className="font-semibold">{totalStepsToday.toLocaleString()}</span></li>}
                {goalProgress && <li>Goal progress: <span className="font-semibold">{goalProgress}%</span> of daily target.</li>}
                <li>Data is sourced directly from database records.</li>
              </>
            )}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">
            {currentUserOnly 
              ? "No steps data found in your profile. Connect your device and ensure it's recording activity data." 
              : "No steps data available. Connect device and ensure data is being recorded."
            }
          </p>
        )}
      </div>
    </div>
  );
};

export default StepsView;