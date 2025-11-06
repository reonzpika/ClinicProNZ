/**
 * Hook to fetch and cache capabilities from Medtech API
 */

import { useQuery } from '@tanstack/react-query';
import { medtechAPI } from '../services/mock-medtech-api';
import { useImageWidgetStore } from '../stores/imageWidgetStore';
import { useEffect } from 'react';

export function useCapabilities() {
  const setCapabilities = useImageWidgetStore((state) => state.setCapabilities);
  
  const query = useQuery({
    queryKey: ['medtech', 'capabilities'],
    queryFn: () => medtechAPI.getCapabilities(),
    staleTime: 1000 * 60 * 60, // 1 hour (capabilities don't change often)
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
  
  // Update store when capabilities are fetched
  useEffect(() => {
    if (query.data) {
      setCapabilities(query.data);
    }
  }, [query.data, setCapabilities]);
  
  return query;
}
