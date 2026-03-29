import apiClient from './apiClient';

export const fetchMetrics = async (metricNames, from, to) => {
  try {
    const params = {
      metric_name: Array.isArray(metricNames) ? metricNames.join(',') : metricNames
    };
    if (from) params.from = from;
    if (to) params.to = to;
    
    const response = await apiClient.get('/metrics', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching metrics', error);
    return [];
  }
};