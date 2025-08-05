import React, { useState, useContext, useEffect, useRef } from 'react';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import { MoonIcon, HeartIcon, TrendUpIcon } from '../../constants';
import { GlobalAppContext } from '../../App';
import * as d3 from 'd3';
import Chart from 'chart.js/auto';
import { SleepStageDataPoint } from '../../types';

const generateMockSleepData = (period: 'Night' | 'Week' | 'Month'): SleepStageDataPoint[] => {
  const data: SleepStageDataPoint[] = [];
  const now = new Date();
  if (period === 'Night') {
    const sleepStartHour = 22; 
    for (let i = 0; i < 8; i++) { 
      const time = new Date(now);
      time.setDate(now.getDate() -1); 
      time.setHours(sleepStartHour + i, Math.floor(Math.random() * 60), 0, 0);
      const deep = Math.random() * 1.5 + 0.5; 
      const light = Math.random() * 3 + 1;   
      const rem = Math.random() * 1.5 + 0.5;  
      const awake = Math.random() * 0.5;      
      data.push({ 
        time: time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), 
        awake, rem, light, deep 
      });
    }
  } else if (period === 'Week') { 
    for (let i = 0; i < 7; i++) {
      const day = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const totalSleep = Math.random() * 3 + 5; 
      data.push({ 
        time: day.toLocaleDateString([], { weekday: 'short' }), 
        awake: totalSleep * 0.1, 
        rem: totalSleep * 0.2, 
        light: totalSleep * 0.5, 
        deep: totalSleep * 0.2 
      });
    }
  } else { 
    for (let i = 0; i < 4; i++) {
      const totalSleep = Math.random() * 2 + 6; 
      data.push({ 
        time: `Week ${i + 1}`, 
        awake: totalSleep * 0.1, 
        rem: totalSleep * 0.2, 
        light: totalSleep * 0.5, 
        deep: totalSleep * 0.2 
      });
    }
  }
  return data;
};


const SleepView: React.FC = () => {
  const appContext = useContext(GlobalAppContext);
  const { isDeviceConnected } = appContext || { isDeviceConnected: false };
  const [timeRange, setTimeRange] = useState<'Night' | 'Week' | 'Month'>('Night');
  
  const d3ChartRef = useRef<SVGSVGElement>(null);
  const chartjsChartRef = useRef<HTMLCanvasElement>(null);
  const chartjsInstanceRef = useRef<Chart | null>(null);

  const chartData = generateMockSleepData(timeRange);

  const lastNightSleepData = generateMockSleepData('Night');
  const totalSleepHours = isDeviceConnected ? (lastNightSleepData.reduce((sum, item) => sum + item.deep + item.light + item.rem, 0)).toFixed(1) : '--';
  const sleepQualityScore = isDeviceConnected ? (parseFloat(totalSleepHours as string) > 6 ? Math.floor(Math.random() * 20) + 75 : Math.floor(Math.random() * 20) + 50) : '--';
  const averageSleepWeekData = generateMockSleepData('Week');
  const averageSleepWeek = isDeviceConnected ? (averageSleepWeekData.reduce((sum, item) => sum + item.deep + item.light + item.rem, 0) / 7).toFixed(1) : '--';

 useEffect(() => {
    if (timeRange !== 'Night' || !d3ChartRef.current || !isDeviceConnected || chartData.length === 0) {
        if(d3ChartRef.current) d3.select(d3ChartRef.current).selectAll("*").remove(); 
        return;
    }

    const svg = d3.select(d3ChartRef.current);
    svg.selectAll("*").remove(); 

    const parent = d3ChartRef.current.parentElement;
    if (!parent) return;

    const margin = { top: 30, right: 20, bottom: 40, left: 50 };
    const parentWidth = parent.clientWidth || 300;
    const parentHeight = parent.clientHeight || 200;


    const width = parentWidth - margin.left - margin.right;
    const height = parentHeight - margin.top - margin.bottom;
    
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const keys = ["deep", "light", "rem", "awake"];
    const colors: { [key: string]: string } = { 
        deep: "#312e81", // indigo-900
        light: "#4f46e5", // indigo-600 (brand.primary)
        rem: "#a5b4fc", // indigo-300
        awake: "#f59e0b" // amber-500
    }; 

    const processedData = chartData.map(d => {
        const total = d.deep + d.light + d.rem + d.awake;
        return {
            time: d.time,
            deep: total > 0 ? d.deep / total : 0,
            light: total > 0 ? d.light / total : 0,
            rem: total > 0 ? d.rem / total : 0,
            awake: total > 0 ? d.awake / total : 0,
        };
    });
    
    const stack = d3.stack<any, string>().keys(keys);
    const series = stack(processedData);

    const y = d3.scaleBand<string>()
        .domain(processedData.map(d => d.time))
        .range([0, height])
        .padding(0.2);

    const x = d3.scaleLinear()
        .domain([0, 1]) 
        .range([0, width]);

    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".0%")))
        .selectAll("text")
        .style("font-size", "10px")
        .attr("fill", "#6b7280"); 
        
    g.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "10px")
        .attr("fill", "#6b7280");

    g.selectAll(".layer")
        .data(series)
        .enter().append("g")
        .attr("fill", d => colors[d.key as keyof typeof colors])
        .selectAll("rect")
        .data(d => d)
        .enter().append("rect")
        .attr("y", (d: any) => y(d.data.time)!)
        .attr("x", (d: any) => x(d[0]))
        .attr("height", y.bandwidth())
        .attr("width", (d: any) => x(d[1]) - x(d[0]));

    const legend = svg.selectAll(".legend")
        .data(keys)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${i * 70}, ${-15})`); 

    legend.append("rect")
        .attr("x", 0)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", d => colors[d as keyof typeof colors]);

    legend.append("text")
        .attr("x", 15)
        .attr("y", 5)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .style("font-size", "10px")
        .attr("fill", "#4b5563") 
        .text(d => d.charAt(0).toUpperCase() + d.slice(1));

  }, [chartData, isDeviceConnected, timeRange]);


  useEffect(() => {
    if (timeRange === 'Night' || !chartjsChartRef.current || !isDeviceConnected || chartData.length === 0) {
        if(chartjsInstanceRef.current) {
            chartjsInstanceRef.current.destroy();
            chartjsInstanceRef.current = null;
        }
        return;
    }

    if (chartjsInstanceRef.current) {
      chartjsInstanceRef.current.destroy();
    }
    
    const ctx = chartjsChartRef.current.getContext('2d');
    if (!ctx) return;

    const dataPoints = chartData.map(d => d.deep + d.light + d.rem); 
    const labels = chartData.map(d => d.time);

    chartjsInstanceRef.current = new Chart(ctx, {
      type: 'bar', 
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Sleep Duration',
          data: dataPoints,
          backgroundColor: 'rgb(99, 102, 241)', // Tailwind indigo-500
          borderColor: 'rgb(79, 70, 229)', // Tailwind indigo-600
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
            title: { display: true, text: 'Hours', color: '#6b7280' },
            grid: { color: '#e5e7eb' },
            ticks: { color: '#6b7280' }
          },
          x: {
             grid: { display: false },
             ticks: { color: '#6b7280' }
          }
        },
        plugins: {
          legend: { display: true, labels: {color: '#374151'} },
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
      if (chartjsInstanceRef.current) {
        chartjsInstanceRef.current.destroy();
        chartjsInstanceRef.current = null;
      }
    };
  }, [chartData, isDeviceConnected, timeRange]);


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            title="Last Night's Sleep" 
            value={totalSleepHours}
            unit="hours" 
            icon={MoonIcon}
            iconBgClass="bg-indigo-100"
            iconTextClass="text-indigo-600"
          />
          <StatCard 
            title="Sleep Quality" 
            value={`${sleepQualityScore}%`}
            unit="Score" 
            icon={HeartIcon} 
            iconBgClass="bg-teal-100"
            iconTextClass="text-teal-600"
          />
          <StatCard 
            title="Avg. Sleep (7d)" 
            value={averageSleepWeek}
            unit="hours / night" 
            icon={TrendUpIcon} 
            iconBgClass="bg-cyan-100"
            iconTextClass="text-cyan-600"
          />
      </div>

      <ChartCard 
        title={timeRange === 'Night' ? "Sleep Stages Distribution (Last Night)" : "Sleep Duration Trend"}
        actions={
            <div className="flex space-x-1">
            {(['Night', 'Week', 'Month'] as const).map((range) => (
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
        <div className="chart-container min-h-[300px] sm:min-h-[350px]">
            {!isDeviceConnected && <p className="text-center text-gray-500 py-10">Connect device to view chart.</p>}
            {isDeviceConnected && timeRange === 'Night' && <svg ref={d3ChartRef} className="w-full h-full"></svg>}
            {isDeviceConnected && timeRange !== 'Night' && <canvas ref={chartjsChartRef}></canvas>}
        </div>
      </ChartCard>
      
      <div className="bg-white shadow-lg rounded-xl p-5">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Sleep Insights</h3>
        {isDeviceConnected ? (
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>Last night you slept for <span className="font-semibold">{totalSleepHours} hours</span>.</li>
            {parseFloat(totalSleepHours as string) < 7 && <li>Aim for at least 7-8 hours of sleep for optimal health.</li>}
            <li>Your sleep quality score is <span className="font-semibold">{sleepQualityScore}%</span>. {parseFloat(sleepQualityScore as string) > 80 ? "Great job!" : "Try improving sleep hygiene."}</li>
            <li>Maintaining a consistent sleep schedule can improve your sleep quality.</li>
        </ul>
        ) : (
        <p className="text-sm text-gray-500">Connect your device to see sleep insights.</p>
        )}
      </div>
    </div>
  );
};

export default SleepView;