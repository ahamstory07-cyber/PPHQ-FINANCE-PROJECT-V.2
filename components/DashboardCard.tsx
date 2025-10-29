import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconColorClass: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, iconColorClass }) => {
  return (
    <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-start justify-between">
      <div className="flex flex-col">
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${iconColorClass}`}>
        {icon}
      </div>
    </div>
  );
};

export default DashboardCard;