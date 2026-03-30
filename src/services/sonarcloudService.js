const axios = require('axios');
const AggregatedMetric = require('../models/AggregatedMetric');

const fetchSonarCloudMetrics = async (config, teamId) => {
  if (!config || !config.token || !config.projectKeys) {
    return;
  }

  const projectKeys = config.projectKeys.split(',').map(k => k.trim()).filter(Boolean);
  const metrics = 'bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density';

  for (const projectKey of projectKeys) {
    try {
      // Create token string appropriately (sonarcloud uses basic auth with token as username and empty password)
      const encodedToken = Buffer.from(`${config.token}:`).toString('base64');
      
      const response = await axios.get(
        `https://sonarcloud.io/api/measures/search_history`,
        {
          headers: {
            'Authorization': `Basic ${encodedToken}`,
            'Accept': 'application/json'
          },
          params: {
            component: projectKey,
            metrics: metrics
          }
        }
      );

      const measures = response.data.measures || [];
      
      const parsedDataByDate = {};

      for (const measure of measures) {
        const metricName = measure.metric;
        for (const historyItem of measure.history) {
          const date = new Date(historyItem.date);
          const dateStr = date.toISOString().split('T')[0];
          
          if (!parsedDataByDate[dateStr]) {
            parsedDataByDate[dateStr] = {};
          }
          // The search_history values are strings, need to parse to float/int
          parsedDataByDate[dateStr][metricName] = parseFloat(historyItem.value) || 0;
        }
      }

      // Upsert into AggregatedMetric
      const bulkOps = [];
      const dbMetricNameOptions = {
          'bugs': 'sonar_bugs',
          'vulnerabilities': 'sonar_vulnerabilities',
          'code_smells': 'sonar_code_smells',
          'coverage': 'sonar_coverage',
          'duplicated_lines_density': 'sonar_duplication'
      };

      for (const [dateStr, values] of Object.entries(parsedDataByDate)) {
        const bucketDate = new Date(`${dateStr}T00:00:00Z`);

        for (const [metric, value] of Object.entries(values)) {
           const mappedName = dbMetricNameOptions[metric];
           if (mappedName) {
               bulkOps.push({
                   updateOne: {
                       filter: { team_id: teamId, metric_name: mappedName, timestamp: bucketDate },
                       update: { $set: { team_id: teamId, metric_name: mappedName, timestamp: bucketDate, value: value } },
                       upsert: true
                   }
               });
           }
        }
      }

      if (bulkOps.length > 0) {
          await AggregatedMetric.bulkWrite(bulkOps);
      }

    } catch (error) {
       console.error(`[SonarCloud Service] Error fetching metrics for ${projectKey}:`, error.message);
    }
  }
};

module.exports = { fetchSonarCloudMetrics };
