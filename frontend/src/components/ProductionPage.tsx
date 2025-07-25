import React from 'react';
import { ResponsiveContainer } from './base/ResponsiveContainer';
import ProductionList from './ProductionList';

const ProductionPage: React.FC = () => {
  return (
    <ResponsiveContainer maxWidth="2xl" className="p-6">
      <ProductionList />
    </ResponsiveContainer>
  );
};

export default ProductionPage; 