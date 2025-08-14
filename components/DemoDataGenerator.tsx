import React, { useState } from 'react';

interface DemoDataGeneratorProps {
  onDataGenerated: () => void;
}

const DemoDataGenerator: React.FC<DemoDataGeneratorProps> = ({ onDataGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string>('');

  const generateDemoData = async (type: 'normal' | 'abnormal' | 'critical') => {
    try {
      setIsGenerating(true);
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        alert('User not logged in - no auth token');
        return;
      }

      console.log(`🧪 Generating ${type} demo data...`);

      const response = await fetch(`http://localhost:5000/api/demo/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          location: `Demo Location - ${type.charAt(0).toUpperCase() + type.slice(1)} Test`
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${type} demo data generated:`, data);
        setLastGenerated(`${type} data generated at ${new Date().toLocaleTimeString()}`);
        
        // Refresh the parent component's data
        setTimeout(() => {
          onDataGenerated();
        }, 1000);
        
      } else {
        const errorData = await response.json();
        console.error('❌ Demo data generation failed:', errorData);
        alert(errorData.error || 'Failed to generate demo data');
      }
    } catch (error) {
      console.error('🚨 Error generating demo data:', error);
      alert('Connection error while generating demo data');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md">
      <div className="flex flex-col">
        <div className="flex items-center mb-3">
          <div className="py-1">
            <div className="w-3 h-3 rounded-full mr-3 bg-blue-500"></div>
          </div>
          <div>
            <p className="font-bold">🧪 Generate Demo Health Data</p>
            <p className="text-sm">Generate some demo data to test the dashboard:</p>
            {lastGenerated && (
              <p className="text-xs text-green-600 mt-1">✅ {lastGenerated}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            onClick={() => generateDemoData('normal')}
            disabled={isGenerating}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? '⏳' : '📊'} Normal Data
          </button>
          <button
            onClick={() => generateDemoData('abnormal')}
            disabled={isGenerating}
            className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? '⏳' : '⚠️'} Abnormal Data
          </button>
          <button
            onClick={() => generateDemoData('critical')}
            disabled={isGenerating}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? '⏳' : '🚨'} Critical Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoDataGenerator;