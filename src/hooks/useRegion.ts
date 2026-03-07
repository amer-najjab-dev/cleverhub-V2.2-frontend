import { useContext } from 'react';
import { RegionContext } from '../contexts/RegionContext';

export const useRegion = () => {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
};
