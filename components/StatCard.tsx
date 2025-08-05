import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: (props: { className?: string }) => React.ReactNode;
  tag?: string;
  tagColor?: string; 
  description?: string;
  iconBgClass?: string; // e.g. 'bg-iconbg-purple' for the circle around the icon
  iconTextClass?: string; // e.g. 'text-purple-600' for the icon color
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  tag, 
  tagColor = 'bg-gray-100 text-gray-600', // Default Tailwind tag colors
  description,
  iconBgClass = 'bg-iconbg-purple', // Default icon background
  iconTextClass = 'text-purple-600'    // Default icon text color
}) => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-4 sm:p-5 h-full flex flex-col">
      {/* Top section: Title and Tag */}
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h5>
        {tag && (
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tagColor}`}>
            {tag}
          </span>
        )}
      </div>
      
      {/* Main content: Icon, Value, Unit */}
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${iconBgClass} mr-4`}>
          <Icon className={`w-6 h-6 ${iconTextClass}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">{value}</h3>
          {unit && <p className="text-xs sm:text-sm text-gray-500">{unit}</p>}
        </div>
      </div>
      
      {/* Optional description at the bottom */}
      {description && <p className="text-xs mt-auto pt-2 text-gray-500">{description}</p>}
    </div>
  );
};

export default StatCard;