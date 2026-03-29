require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { initCronJobs } = require('./jobs/eventProcessor');
const { initMetricAggregator } = require('./jobs/metricAggregator');
const { initApiPoller } = require('./jobs/apiPoller');

// Connect to MongoDB Database and then initialize jobs
connectDB().then(() => {
  // Initialize Background Processors only after DB is connected
  initCronJobs();
  initMetricAggregator();
  initApiPoller();
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const webhooksRoutes = require('./routes/webhooks');
const metricsRoutes = require('./routes/metrics');
const integrationsRoutes = require('./routes/integrations');

app.use('/api/v1/webhooks', webhooksRoutes);
app.use('/api/v1/metrics', metricsRoutes);
app.use('/api/v1/integrations', integrationsRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
