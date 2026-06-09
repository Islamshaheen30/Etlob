import { useContext } from 'react';
import { DriverContext } from '@/contexts/DriverContext';

export function useDriver() {
  const ctx = useContext(DriverContext);
  if (!ctx) throw new Error('useDriver must be used within DriverProvider');
  return ctx;
}
