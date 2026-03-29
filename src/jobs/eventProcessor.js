const cron = require('node-cron');
const RawEvent = require('../models/RawEvent');
const NormalizedEvent = require('../models/NormalizedEvent');
const { normalize } = require('../services/normalizer');

// Set processor state to avoid overlap if job takes longer than the interval
let isProcessing = false;

const processEvents = async () => {
  if (isProcessing) {
    return;
  }

  isProcessing = true;
  
  try {
    // Process a batch of pending events to prevent memory overflow
    const pendingEvents = await RawEvent.find({ status: { $in: ['pending', 'failed'] }, retry_count: { $lt: 3 } })
      .limit(50)
      .sort({ createdAt: 1 }); // process oldest first
      
    if (pendingEvents.length > 0) {
      console.log(`[EventProcessor] Found ${pendingEvents.length} events to process.`);
    }

    for (const raw of pendingEvents) {
      try {
        const standardData = normalize(raw);
        
        // Prepare normalized event
        const normalized = new NormalizedEvent({
          ...standardData,
          raw_event_id: raw._id
        });
        
        // Save normalized event and update raw event status transactionally (ideally, but simplified for MVP)
        await normalized.save();
        
        raw.status = 'processed';
        raw.processed_at = new Date();
        await raw.save();
        
        console.log(`[EventProcessor] Successfully processed ${raw.source} event - ID: ${raw.source_id}`);
      } catch (err) {
        console.error(`[EventProcessor] Error processing event ${raw._id}:`, err.message);
        raw.status = 'failed';
        raw.retry_count += 1;
        raw.error_message = err.message;
        await raw.save();
      }
    }
  } catch (err) {
    console.error('[EventProcessor] Critical error in processing batch:', err);
  } finally {
    isProcessing = false;
  }
};

const initCronJobs = () => {
  // Run every 1 minute
  console.log('[-] Initializing background cron jobs...');
  cron.schedule('* * * * *', processEvents);
  
  // We can also trigger an initial run slightly after startup to clear backlog
  setTimeout(processEvents, 5000); 
};

module.exports = { initCronJobs };
