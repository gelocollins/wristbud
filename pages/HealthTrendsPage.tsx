import React, { useState, useContext, useEffect, useRef } from 'react';
import ChartCard from '../components/ChartCard';
import { GlobalAppContext } from '../App';
import Chart from 'chart.js/auto';
import { 
    HeartIcon, ShoePrintsIcon, MoonIcon, 
    DropletIcon, ThermometerIcon, ChartBarIcon as PageIcon 
} from '../constants'; 
import { UserProfile } from '../types'; 

type MetricKey = 'heartRate' | 'steps' | 'sleepHours' | 'spo2' | 'temperature';

interface HealthTrendDataPoint {
  date: string; 
  heartRate?: number;
  steps?: number; 
  sleepHours?: number; 
  spo2?: number;
  temperature?: number;
}

const generateMonthlyTrendData = (): HealthTrendDataPoint[] => {
  const data: HealthTrendDataPoint[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) { 
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    data.push({
      date: monthDate.toLocaleDateString([], { month: 'short', year: '2-digit' }),
      heartRate: Math.floor(Math.random() * (85 - 65 + 1)) + 65,
      steps: Math.floor(Math.random() * 200000) + 100000, 
      sleepHours: parseFloat((Math.random() * 1.5 + 6.5).toFixed(1)), 
      spo2: Math.floor(Math.random() * (99 - 95 + 1)) + 95,
      temperature: parseFloat((36.5 + (Math.random() - 0.5) * 0.3).toFixed(1)),
    });
  }
  return data;
};

const METRIC_CONFIG: Record<MetricKey, { name: string, color: string, unit: string, icon: (props: { className?: string }) => React.ReactNode, chartType: 'line' | 'bar' }> = {
  heartRate: { name: 'Avg Heart Rate', color: '#4F46E5', unit: 'BPM', icon: HeartIcon, chartType: 'line' },
  steps: { name: 'Total Steps', color: '#EC4899', unit: '', icon: ShoePrintsIcon, chartType: 'bar' },
  sleepHours: { name: 'Avg Sleep', color: '#10B981', unit: 'hrs', icon: MoonIcon, chartType: 'line' },
  spo2: { name: 'Avg SpO2', color: '#F59E0B', unit: '%', icon: DropletIcon, chartType: 'line' }, 
  temperature: { name: 'Avg Temp', color: '#EF4444', unit: '°C', icon: ThermometerIcon, chartType: 'line' }, 
};

const hexToRgba = (hex: string, alpha: number = 1): string => {
  if (!hex.startsWith('#')) return hex;
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const HealthTrendsPage: React.FC = () => {
  const appContext = useContext(GlobalAppContext);
  const { isDeviceConnected } = appContext || { isDeviceConnected: false };
  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>(['heartRate', 'steps']);
  
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const trendData = generateMonthlyTrendData();

  const toggleMetric = (metric: MetricKey) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) ? prev.filter(m => m !== metric) : [...prev, metric]
    );
  };

 useEffect(() => {
    if (!chartRef.current || !isDeviceConnected || selectedMetrics.length === 0) {
        if(chartInstanceRef.current) {
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

    const labels = trendData.map(d => d.date);
    const datasets = selectedMetrics.map((key, index) => {
      const config = METRIC_CONFIG[key];
      return {
        type: config.chartType,
        label: config.name,
        data: trendData.map(d => d[key]),
        borderColor: config.color,
        backgroundColor: config.chartType === 'bar' ? config.color : hexToRgba(config.color, 0.2),
        fill: config.chartType === 'line',
        tension: 0.1,
        yAxisID: index === 0 ? 'y' : `y${index}`,
      };
    });
    
    const yAxes: any = {};
    selectedMetrics.forEach((key, index) => {
        const axisId = index === 0 ? 'y' : `y${index}`;
        yAxes[axisId] = {
            type: 'linear',
            display: true,
            position: index % 2 === 0 ? 'left' : 'right',
            title: { display: true, text: METRIC_CONFIG[key].name, color: '#6b7280' },
            grid: {
                drawOnChartArea: index === 0, 
                color: '#e5e7eb' 
            },
            ticks: { color: '#6b7280' }
        };
    });

    chartInstanceRef.current = new Chart(ctx, {
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: { title: { display: true, text: 'Month', color: '#6b7280' }, grid: {display: false}, ticks: {color: '#6b7280'} },
          ...yAxes
        },
        plugins: {
          legend: { labels: {color: '#374151'} },
          tooltip: {
            backgroundColor: '#fff',
            titleColor: '#374151',
            bodyColor: '#4b5563',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 4,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) {
                  const metricKey = Object.keys(METRIC_CONFIG).find(k => METRIC_CONFIG[k as MetricKey].name === context.dataset.label) as MetricKey | undefined;
                  label += context.parsed.y.toLocaleString() + (metricKey ? ` ${METRIC_CONFIG[metricKey].unit}` : '');
                }
                return label;
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
  }, [trendData, selectedMetrics, isDeviceConnected]);


  if (!isDeviceConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <PageIcon className="w-20 h-20 mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
        <p>Please log in as admin to view health trends.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Metrics to Display:</h3>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(METRIC_CONFIG) as MetricKey[]).map(key => {
            const config = METRIC_CONFIG[key];
            const isActive = selectedMetrics.includes(key);
            return (
              <button
                type="button"
                key={key}
                onClick={() => toggleMetric(key)}
                className={`px-3 py-2 text-sm font-medium rounded-md flex items-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1
                            ${isActive 
                            ? 'bg-brand-primary text-white hover:bg-brand-secondary focus:ring-brand-primary' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400'}`}
              >
                <config.icon className="w-4 h-4 mr-2" />
                {config.name}
              </button>
            );
          })}
        </div>
      </div>

      <ChartCard title="Monthly Health Trends (Last 12 Months)" cardClass="overflow-hidden"> {/* overflow-hidden for canvas */}
        <div className="chart-container">
         {selectedMetrics.length > 0 ? <canvas ref={chartRef}></canvas> : <p className="text-center text-gray-500 py-10">Please select at least one metric to display the chart.</p>}
        </div>
      </ChartCard>

       <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Trends Summary</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>Reviewing long-term trends can help identify patterns in your health.</li>
          <li>Look for consistent improvements or areas that might need attention.</li>
          <li>Share these trends with your healthcare provider for more personalized advice.</li>
        </ul>
      </div>
    </div>
  );
};

export default HealthTrendsPage;