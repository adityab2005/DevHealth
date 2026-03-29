import apiClient from './apiClient';

export const fetchMetrics = async (projectId, metricNames) => {
  try {
    const response = await apiClient.get('/metrics', {
      params: {
        project_id: projectId,
        metric_name: Array.isArray(metricNames) ? metricNames.join(',') : metricNames
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching metrics', error);
    return [];
  }
};