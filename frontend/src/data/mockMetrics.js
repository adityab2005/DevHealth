export const mockMetrics = {
  buildSuccessRate: 92,
  coverage: 78,
  openIssues: 34,
  failedBuilds: 5,
};

export const buildTrendData = [
  { name: 'Mon', success: 40, failures: 2 },
  { name: 'Tue', success: 45, failures: 1 },
  { name: 'Wed', success: 50, failures: 3 },
  { name: 'Thu', success: 48, failures: 0 },
  { name: 'Fri', success: 52, failures: 4 },
  { name: 'Sat', success: 20, failures: 1 },
  { name: 'Sun', success: 25, failures: 0 },
];

export const coverageTrendData = [
  { name: 'Week 1', coverage: 72 },
  { name: 'Week 2', coverage: 74 },
  { name: 'Week 3', coverage: 75 },
  { name: 'Week 4', coverage: 78 },
];

export const issueDistributionData = [
  { name: 'Bugs', value: 45 },
  { name: 'Features', value: 35 },
  { name: 'Tech Debt', value: 20 },
];

export const recentAlerts = [
  { id: 1, type: 'warning', message: 'Test coverage dropped by 2% in the last commit' },
  { id: 2, type: 'danger', message: 'Spike in build failures detected on master branch' },
  { id: 3, type: 'info', message: 'Issue backlog growing faster than resolution rate' },
];