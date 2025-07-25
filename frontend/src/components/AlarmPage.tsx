import React from 'react';
import { ResponsiveContainer } from './base/ResponsiveContainer';
import AlarmList from './AlarmList';

const AlarmPage: React.FC = () => {
  return (
    <ResponsiveContainer maxWidth="2xl" className="p-6">
      <AlarmList />
    </ResponsiveContainer>
  );
};

export default AlarmPage; 