import { useState } from 'react';

export const useAnalyticsFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState({
    groupBy: 'day',
    period: '30d',
    startDate: '',
    endDate: '',
    ...initialFilters,
  });

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      groupBy: 'day',
      period: '30d',
      startDate: '',
      endDate: '',
    });
  };

  return { filters, updateFilter, resetFilters };
};
