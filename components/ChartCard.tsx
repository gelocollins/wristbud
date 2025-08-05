import React from 'react';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  cardClass?: string; 
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, actions, cardClass = '' }) => {
  return (
    <div className={`bg-white shadow-lg rounded-xl ${cardClass}`}>
      <div className="px-4 py-4 sm:px-6 flex justify-between items-center border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
        {actions && <div className="ml-4 flex-shrink-0">{actions}</div>}
      </div>
      <div className="p-4 sm:p-6">
        {/* Chart container class is now applied globally or directly where canvas is used */}
        {children}
      </div>
    </div>
  );
};

export default ChartCard;