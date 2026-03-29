const axios = require('axios');
const NormalizedEvent = require('../models/NormalizedEvent');

const fetchJenkinsBuilds = async (config, teamId) => {
  if (!config || !config.baseUrl || !config.username || !config.token || !config.jobs) {
    console.warn(`[Jenkins Service] Missing credentials for project ${teamId}. Skipping.`);
    return;
  }

  const authHeader = Buffer.from(`${config.username}:${config.token}`).toString('base64');
  const cleanBaseUrl = config.baseUrl.replace(/\/$/, '');
  const targetJobs = config.jobs.split(',').map(j => j.trim()).filter(Boolean);

  for (const jobName of targetJobs) {
    try {
      const response = await axios.get(
        `${cleanBaseUrl}/job/${jobName}/api/json`,
        {
          headers: {
            'Authorization': `Basic ${authHeader}`
          },
          params: {
            tree: 'builds[id,number,result,timestamp,url,building]'
          }
        }
      );

      const builds = (response.data.builds || []).filter(b => !b.building && b.result);
      console.log(`[Jenkins Service] Fetched ${builds.length} completed builds for ${jobName} in project ${teamId}`);

      const bulkOps = builds.map(build => {
        const buildStatus = build.result ? build.result.toLowerCase() : 'unknown';

        return {
          updateOne: {
            filter: {
              'metadata.build_url': build.url,
              source: 'jenkins'
            },
            update: {
              $set: {
                source: 'jenkins',
                team_id: teamId,
                type: 'build',
                status: buildStatus,
                actor: 'jenkins_system',
                timestamp: new Date(build.timestamp),
                metadata: {
                  job_name: jobName,
                  build_number: build.number,
                  build_url: build.url
                }
              }
            },
            upsert: true
          }
        };
      });

      if (bulkOps.length > 0) {
        await NormalizedEvent.bulkWrite(bulkOps);
      }

    } catch (error) {
       console.error(`[Jenkins Service] Error fetching builds for job ${jobName} in project ${teamId}:`, error.message);
    }
  }
};

module.exports = { fetchJenkinsBuilds };