import React from 'react';
import { ResponsiveContainer } from './base/ResponsiveContainer';
import Reports from './Reports';

const ReportsPage: React.FC = () => {
  return (
    <ResponsiveContainer maxWidth="2xl" className="p-6">
      <Reports />
    </ResponsiveContainer>
  );
};

export default ReportsPage; 