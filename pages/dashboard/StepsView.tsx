import React, { useState, useContext, useEffect, useRef } from 'react';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import { ShoePrintsIcon, ChartBarIcon, TrendUpIcon } from '../../constants';
import { GlobalAppContext } from '../../App';
import Chart from 'chart.js/auto';
import { ChartDataPoint } from '../../types';

const generateMockStepsData = (period: 'Today' | 'Week' | 'Month'): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  if (period === 'Today') {
    for (let i = 0; i < 24; i++) {
       const hour = new Date(now);
       hour.setHours(now.getHours() - (23 - i), 0, 0, 0);
       data.push({ time: hour.toLocaleTimeString([], { hour: 'numeric', hour12: true }), value: Math.floor(Math.random() * 500) + (i > 6 && i < 20 ? 100 : 10) });
    }
     if(data.length > 0) data[data.length -1].time = "Now";
  } else if (period === 'Week') {
    for (let i = 0; i < 7; i++) {
      const day = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      data.push({ time: day.toLocaleDateString([], { weekday: 'short' }), value: Math.floor(Math.random() * 8000) + 2000 });
    }
  } else { 
    for (let i = 0; i < 4; i++) {
      data.push({ time: `Week ${i + 1}`, value: Math.floor(Math.random() * 50000) + 15000 });
    }
  }
  return data;
};

const StepsView: React.FC = () => {
  const appContext = useContext(GlobalAppContext);
  const { isDeviceConnected } = appContext || { isDeviceConnected: false };
  const [timeRange, setTimeRange] = useState<'Today' | 'Week' | 'Month'>('Week');
  
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const chartData = generateMockStepsData(timeRange);
  const totalStepsTodayData = generateMockStepsData('Today');
  const totalStepsToday = isDeviceConnected ? totalStepsTodayData.reduce((sum, item) => sum + item.value, 0) : '--';
  const weeklyAverageData = generateMockStepsData('Week');
  const weeklyAverage = isDeviceConnected ? (weeklyAverageData.reduce((sum, item) => sum + item.value, 0) / 7).toFixed(0) : '--';
  const goal = 10000;
  const goalProgress = isDeviceConnected && typeof totalStepsToday === 'number' ? ((totalStepsToday / goal) * 100).toFixed(0) : '--';


  useEffect(() => {
    if (!chartRef.current || !isDeviceConnected) {
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
          label: 'Steps',
          data: dataPoints,
          backgroundColor: 'rgb(79, 70, 229)', // Tailwind indigo-600
          borderColor: 'rgb(67, 56, 202)', // Tailwind indigo-700
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
            ticks: { color: '#6b7280' }
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
  }, [chartData, isDeviceConnected, timeRange]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            title="Today's Steps" 
            value={typeof totalStepsToday === 'number' ? totalStepsToday.toLocaleString() : totalStepsToday}
            unit="steps" 
            icon={ShoePrintsIcon}
            iconBgClass="bg-pink-100" 
            iconTextClass="text-pink-600"
          />
          <StatCard 
            title="Weekly Average" 
            value={typeof weeklyAverage === 'string' && weeklyAverage !== '--' ? Number(weeklyAverage).toLocaleString() : weeklyAverage}
            unit="steps / day" 
            icon={ChartBarIcon}
            iconBgClass="bg-yellow-100"
            iconTextClass="text-yellow-600"
          />
          <StatCard 
            title="Goal Progress" 
            value={`${goalProgress}%`}
            unit={`of ${goal.toLocaleString()} steps`} 
            icon={TrendUpIcon}
            iconBgClass="bg-purple-100"
            iconTextClass="text-purple-600"
          />
      </div>

      <ChartCard 
        title="Step Trend"
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
            {isDeviceConnected ? <canvas ref={chartRef}></canvas> : <p className="text-center text-gray-500 py-10">Connect device to view chart.</p>}
        </div>
      </ChartCard>
      
      <div className="bg-white shadow-lg rounded-xl p-5">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Steps Insights</h3>
        {isDeviceConnected && typeof totalStepsToday === 'number' ? (
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>You've taken <span className="font-semibold">{totalStepsToday.toLocaleString()}</span> steps today. Keep it up!</li>
            {totalStepsToday < goal / 2 && <li>You're less than halfway to your daily goal. Try a short walk!</li>}
            {totalStepsToday > goal && <li>Congratulations on reaching your daily step goal!</li>}
            <li>Your most active time today was likely around midday based on mock data.</li>
        </ul>
        ) : (
        <p className="text-sm text-gray-500">Connect your device to see steps insights.</p>
        )}
      </div>
    </div>
  );
};

export default StepsView;