import React, { useState, useContext, useEffect, useRef } from 'react';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import { HeartIcon, ActivityIcon, TrendUpIcon } from '../../constants';
import { GlobalAppContext } from '../../App';
import Chart from 'chart.js/auto'; 
import { ChartDataPoint } from '../../types';

const generateMockData = (period: 'Today' | 'Week' | 'Month'): ChartDataPoint[] => {
  const now = new Date();
  const data: ChartDataPoint[] = [];
  let points = 0;

  if (period === 'Today') {
    points = 12; 
    for (let i = 0; i < points; i++) {
      const time = new Date(now.getTime() - (points - 1 - i) * 2 * 60 * 60 * 1000); 
      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        value: Math.floor(Math.random() * (100 - 60 + 1)) + 60,
      });
    }
    if (data.length > 0) data[data.length -1].time = "Now";
  } else if (period === 'Week') {
    points = 7;
    for (let i = 0; i < points; i++) {
      const date = new Date(now.getTime() - (points - 1 - i) * 24 * 60 * 60 * 1000);
      data.push({
        time: date.toLocaleDateString([], { weekday: 'short' }),
        value: Math.floor(Math.random() * (90 - 65 + 1)) + 65,
      });
    }
  } else if (period === 'Month') {
    points = 10; 
     for (let i = 0; i < points; i++) { 
      const date = new Date(now.getTime() - (points - 1 - i) * 3 * 24 * 60 * 60 * 1000);
      data.push({
        time: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        value: Math.floor(Math.random() * (85 - 60 + 1)) + 60,
      });
    }
  }
  return data;
};

const HeartRateView: React.FC = () => {
  const appContext = useContext(GlobalAppContext);
  const { isDeviceConnected } = appContext || { isDeviceConnected: false };
  const [timeRange, setTimeRange] = useState<'Today' | 'Week' | 'Month'>('Today');
  
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const chartData = generateMockData(timeRange);
  const currentHr = isDeviceConnected ? (chartData.length > 0 ? chartData[chartData.length -1].value : 72) : '--';
  const restingHr = isDeviceConnected ? 65 : '--';
  const currentZone = isDeviceConnected ? 'Fat Burn' : '--';

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
          label: 'Heart Rate',
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
            title: { display: true, text: 'BPM', color: '#6b7280' }, // text-gray-500
            grid: { color: '#e5e7eb' }, // border-gray-200
            ticks: { color: '#6b7280' } // text-gray-500
          },
          x: {
            title: { display: true, text: 'Time', color: '#6b7280' },
            grid: { display: false },
            ticks: { color: '#6b7280' }
          }
        },
        plugins: {
          legend: { display: true, labels: { color: '#374151' } }, // text-gray-700
          tooltip: { 
            mode: 'index', 
            intersect: false,
            backgroundColor: '#fff', // bg-white
            titleColor: '#374151', // text-gray-700
            bodyColor: '#4b5563', // text-gray-600
            borderColor: '#e5e7eb', // border-gray-200
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
            title="Current Heart Rate" 
            value={currentHr}
            unit="BPM" 
            icon={HeartIcon}
            iconBgClass="bg-iconbg-purple"
            iconTextClass="text-purple-600"
            tag="BPM"
            tagColor="bg-purple-100 text-purple-700"
          />
          <StatCard 
            title="Resting Heart Rate" 
            value={restingHr}
            unit="Avg resting BPM" 
            icon={ActivityIcon} // Consider a more specific icon if available, e.g. leaf/plant for resting
            iconBgClass="bg-iconbg-green"
            iconTextClass="text-green-600"
            tag="Today"
            tagColor="bg-green-100 text-green-700"
          />
          <StatCard 
            title="Heart Rate Zones" 
            value={currentZone}
            unit="Current zone" 
            icon={TrendUpIcon}
            iconBgClass="bg-iconbg-blue"
            iconTextClass="text-blue-600"
            tag="Today"
            tagColor="bg-blue-100 text-blue-700"
          />
      </div>

      <ChartCard 
        title="Heart Rate Trend"
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
        <h3 className="text-lg font-medium text-gray-900 mb-3">Heart Rate Insights</h3>
        {isDeviceConnected && chartData.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Your average heart rate ({timeRange.toLowerCase()}) is <span className="font-semibold">{(chartData.reduce((acc, curr) => acc + curr.value, 0) / chartData.length).toFixed(0)} BPM</span>.</li>
                <li>Your resting heart rate is within a healthy range.</li>
                <li>Consider a light walk to maintain cardiovascular health.</li>
            </ul>
            ) : (
            <p className="text-sm text-gray-500">Connect your device to see heart rate insights.</p>
            )}
      </div>
    </div>
  );
};

export default HeartRateView;