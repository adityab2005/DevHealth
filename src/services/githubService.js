const axios = require('axios');
const mongoose = require('mongoose');
const NormalizedEvent = require('../models/NormalizedEvent');

const fetchGithubCommits = async (config, projectId) => {
  if (!config || !config.token || !config.repositories) {
    return;
  }

  const sinceDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const reposPaths = config.repositories.split(',').map(r => r.trim()).filter(Boolean);

  for (const repoPath of reposPaths) {
    if (!repoPath.includes('/')) continue;
    const [owner, repo] = repoPath.split('/');

    try {
      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/commits`,
        {
          headers: {
            'Authorization': `token ${config.token}`,
            'Accept': 'application/vnd.github.v3+json'
          },
          params: {
            since: sinceDate
          }
        }
      );

      const commits = response.data;
      console.log(`[GitHub Service] Fetched ${commits.length} commits for ${owner}/${repo} in project ${projectId}`);  

      const bulkOps = commits.map(commitData => ({
         updateOne: {
           filter: {
             'metadata.commit_sha': commitData.sha,
             source: 'github'
           },
           update: {
             $set: {
               source: 'github',
               project_id: projectId,
               type: 'commit',
               status: 'success',
               actor: commitData.author?.login || commitData.commit?.author?.name || 'unknown',
               timestamp: new Date(commitData.commit.author.date),
               metadata: {
                 repository: `${owner}/${repo}`,
                 commit_sha: commitData.sha,
                 message: commitData.commit.message,
                 url: commitData.html_url
               }
             }
           },
           upsert: true
         }
      }));

      if (bulkOps.length > 0) {
        await NormalizedEvent.bulkWrite(bulkOps);
      }

    } catch (error) {
      console.error(`[GitHub Service] Error fetching commits for ${owner}/${repo}:`, error.message);
    }
  }
};

module.exports = { fetchGithubCommits };