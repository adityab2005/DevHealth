const cron = require('node-cron');
const NormalizedEvent = require('../models/NormalizedEvent');
const AggregatedMetric = require('../models/AggregatedMetric');

// Helper to upsert metrics
const upsertMetric = async (project_id, metric_name, value, timestamp) => {
  if (!project_id || project_id === 'unknown') return;

  try {
    await AggregatedMetric.findOneAndUpdate(
      { project_id, metric_name, timestamp },
      { $set: { value } },
      { upsert: true, returnDocument: 'after' } // Replaced new with returnDocument
    );
  } catch (error) {
    console.error(`[MetricAggregator] Error upserting ${metric_name}:`, error.message);
  }
};

const aggregateCommits = async () => {
  const count = await NormalizedEvent.countDocuments({ type: 'commit', source: 'github' });
  console.log(`[MetricAggregator] Found ${count} commit events to aggregate.`);
  
  const pipeline = [
    { $match: { type: 'commit', source: 'github' } },
    {
      $group: {
        _id: {
          project: "$project_id",
          // Group by Day bucket
          date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }
        },
        count: { $sum: 1 }
      }
    }
  ];

  const results = await NormalizedEvent.aggregate(pipeline);
  for (const res of results) {
    if (res._id.project && res._id.date) {
      const bucketDate = new Date(`${res._id.date}T00:00:00Z`);
      await upsertMetric(res._id.project, 'commit_frequency', res.count, bucketDate);
    }
  }
};

const aggregateBuilds = async () => {
  const count = await NormalizedEvent.countDocuments({ type: 'build', source: 'jenkins', status: { $in: ['success', 'failure', 'aborted', 'unstable'] } });
  console.log(`[MetricAggregator] Found ${count} completed build events to aggregate.`);

  const pipeline = [
    { $match: { type: 'build', source: 'jenkins', status: { $in: ['success', 'failure', 'aborted', 'unstable'] } } },
    {
      $group: {
        _id: {
          project: "$project_id",
          date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }
        },
        total_builds: { $sum: 1 },
        success_builds: { 
          $sum: { $cond: [{ $eq: [{ $toLower: "$status" }, "success"] }, 1, 0] } 
        }
      }
    },
    {
      $project: {
        success_rate: {
          $multiply: [
            { $divide: ["$success_builds", "$total_builds"] },
            100
          ]
        }
      }
    }
  ];

  const results = await NormalizedEvent.aggregate(pipeline);
  for (const res of results) {
    if (res._id.project && res._id.date) {
      const bucketDate = new Date(`${res._id.date}T00:00:00Z`);
      await upsertMetric(res._id.project, 'build_success_rate', res.success_rate, bucketDate);
    }
  }
};

const aggregateIssues = async () => {
  const count = await NormalizedEvent.countDocuments({ type: 'issue', source: 'jira' });
  console.log(`[MetricAggregator] Found ${count} issue events to aggregate.`);

  const pipeline = [
    { $match: { type: 'issue', source: 'jira' } },
    {
      $group: {
        _id: {
          project: "$project_id",
          status: "$status",
          date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }
        },
        count: { $sum: 1 }
      }
    }
  ];

  const results = await NormalizedEvent.aggregate(pipeline);
  for (const res of results) {
    if (res._id.project && res._id.date && res._id.status) {
      const bucketDate = new Date(`${res._id.date}T00:00:00Z`);
      
      const statusLower = res._id.status.toLowerCase();
      
      if (['closed', 'done', 'resolved', 'deleted'].includes(statusLower)) {
        await upsertMetric(res._id.project, 'issues_closed', res.count, bucketDate);
      } else if (['opened', 'created', 'todo', 'in progress', 'open', 'new'].includes(statusLower)) {
        await upsertMetric(res._id.project, 'issues_opened', res.count, bucketDate);
      } else {
        // Fallback generic opened
        await upsertMetric(res._id.project, 'issues_opened', res.count, bucketDate);
      }
    }
  }
};

let isAggregating = false;

const runAggregations = async () => {
  if (isAggregating) {
    console.log('[MetricAggregator] Skip run, already aggregating...');
    return;
  }
  isAggregating = true;
  
  try {
    console.log('[MetricAggregator] Starting metric aggregation jobs...');
    await aggregateCommits();
    await aggregateBuilds();
    await aggregateIssues();
    console.log('[MetricAggregator] Metrics aggregation completed.');
  } catch (error) {
    console.error('[MetricAggregator] Aggregation failed:', error);
  } finally {
    isAggregating = false;
  }
};

const initMetricAggregator = () => {
  // Run metrics computation every 2 minutes
  cron.schedule('*/2 * * * *', runAggregations);
  
  // Calculate initially on boot after a slight delay
  setTimeout(runAggregations, 5000);
};

module.exports = { initMetricAggregator };
