import React from 'react';
import { ResponsiveContainer } from './base/ResponsiveContainer';
import AIAnalysis from './AIAnalysis';

const AIPage: React.FC = () => {
  return (
    <ResponsiveContainer maxWidth="2xl" className="p-6">
      <AIAnalysis />
    </ResponsiveContainer>
  );
};

export default AIPage; 