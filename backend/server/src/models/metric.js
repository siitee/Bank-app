import mongoose from 'mongoose';

const metricSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number, required: true },
  url: String,
  userAgent: String,
  screenResolution: String,
  rating: String,
  message: String,
  stack: String,
  timestamp: { type: Date, default: Date.now }
}, {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'name',
    granularity: 'hours'
  }
});

export default mongoose.model('Metric', metricSchema);