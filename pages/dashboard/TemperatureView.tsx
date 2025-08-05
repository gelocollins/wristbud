import React, { useState, useContext, useEffect, useRef } from 'react';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import { ThermometerIcon, ActivityIcon, TrendUpIcon } from '../../constants';
import { GlobalAppContext } from '../../App';
import Chart from 'chart.js/auto';
import { ChartDataPoint } from '../../types';

const generateMockTempData = (period: 'Today' | 'Week' | 'Month'): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  let points = 0;
  
  if (period === 'Today') {
    points = 24; 
    for (let i = 0; i < points; i++) {
      const time = new Date(now.getTime() - (points - 1 - i) * 60 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString([], { hour: 'numeric', hour12: true }),
        value: parseFloat((36.5 + (Math.random() - 0.5) * 0.8).toFixed(1)), 
      });
    }
    if (data.length > 0) data[data.length-1].time = "Now";
  } else if (period === 'Week') {
    points = 7; 
    for (let i = 0; i < points; i++) {
      const date = new Date(now.getTime() - (points - 1 - i) * 24 * 60 * 60 * 1000);
      data.push({
        time: date.toLocaleDateString([], { weekday: 'short' }),
        value: parseFloat((36.5 + (Math.random() - 0.5) * 0.6).toFixed(1)),
      });
    }
  } else { 
     for (let i = 0; i < 4; i++) { 
       const date = new Date(now.getFullYear(), now.getMonth(), (i*7) + 1); 
      data.push({
        time: `Week ${i+1}`,
        value: parseFloat((36.5 + (Math.random() - 0.5) * 0.5).toFixed(1)),
      });
    }
  }
  return data;
};


const TemperatureView: React.FC = () => {
  const appContext = useContext(GlobalAppContext);
  const { isDeviceConnected } = appContext || { isDeviceConnected: false };
  const [timeRange, setTimeRange] = useState<'Today' | 'Week' | 'Month'>('Today');

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const chartData = generateMockTempData(timeRange);
  const currentTemp = isDeviceConnected ? (chartData.length > 0 ? chartData[chartData.length-1].value : 36.8) : '--';
  const averageTemp = isDeviceConnected && chartData.length > 0 ? (chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length).toFixed(1) : '--';
  const dailyVariation = isDeviceConnected && chartData.length > 0 ? (Math.max(...chartData.map(d => d.value)) - Math.min(...chartData.map(d => d.value))).toFixed(1) : '--';

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
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Temperature (°C)',
          data: dataPoints,
          borderColor: 'rgb(245, 158, 11)', // Tailwind amber-500
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          fill: true,
          tension: 0.3,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            suggestedMin: 35,
            suggestedMax: 38,
            title: { display: true, text: '°C', color: '#6b7280' },
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
          tooltip: { 
            callbacks: { label: (context) => `${context.dataset.label}: ${context.parsed.y}°C` },
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
  }, [chartData, isDeviceConnected, timeRange]);


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            title="Current Temperature" 
            value={`${currentTemp}°C`}
            icon={ThermometerIcon}
            iconBgClass="bg-amber-100"
            iconTextClass="text-amber-600"
          />
          <StatCard 
            title={`Avg. Temp (${timeRange})`}
            value={`${averageTemp}°C`}
            icon={ActivityIcon} 
            iconBgClass="bg-green-100"
            iconTextClass="text-green-600"
          />
          <StatCard 
            title={`Variation (${timeRange})`} 
            value={`${dailyVariation}°C`}
            icon={TrendUpIcon} 
            iconBgClass="bg-blue-100"
            iconTextClass="text-blue-600"
          />
      </div>

      <ChartCard 
        title="Body Temperature Trend"
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
        <h3 className="text-lg font-medium text-gray-900 mb-3">Temperature Insights</h3>
        {isDeviceConnected ? (
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>Your current body temperature is <span className="font-semibold">{currentTemp}°C</span>. Normal range is typically 36.1°C to 37.2°C.</li>
            {typeof currentTemp === 'number' && currentTemp > 37.5 && <li className="text-red-600 font-medium">Your temperature is slightly elevated. Monitor for other symptoms.</li>}
            <li>Body temperature can fluctuate naturally throughout the day due to activity and environment.</li>
        </ul>
        ) : (
        <p className="text-sm text-gray-500">Connect your device to see temperature insights.</p>
        )}
      </div>
    </div>
  );
};

export default TemperatureView;