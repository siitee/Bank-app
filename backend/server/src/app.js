import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import emailRouter from './routes/email.js';
import morgan from 'morgan';
import fs from 'fs';
import { collectDefaultMetrics, Registry, Counter } from 'prom-client';
import mongoose from 'mongoose';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bank-metrics')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

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

const Metric = mongoose.model('Metric', metricSchema);

if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs');
}

const register = new Registry();
collectDefaultMetrics({ register });

app.use(morgan('combined', {
  stream: fs.createWriteStream('./logs/access.log', { flags: 'a' })
}));

app.use(morgan('dev'));

app.use(cors());
app.use(express.json());

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

const webVitalsMetrics = {
  CLS: new Counter({ name: 'web_vitals_cls', help: 'Cumulative Layout Shift', registers: [register] }),
  FID: new Counter({ name: 'web_vitals_fid', help: 'First Input Delay', registers: [register] }),
  LCP: new Counter({ name: 'web_vitals_lcp', help: 'Largest Contentful Paint', registers: [register] }),
  FCP: new Counter({ name: 'web_vitals_fcp', help: 'First Contentful Paint', registers: [register] }),
  TTFB: new Counter({ name: 'web_vitals_ttfb', help: 'Time To First Byte', registers: [register] }),
  LOAD_TIME: new Counter({ name: 'page_load_time', help: 'Page load time in ms', registers: [register] })
};

app.post('/api/metrics', async (req, res) => {
  try {
    const metricData = {
      ...req.body,
      timestamp: new Date()
    };

    const metric = new Metric(metricData);
    await metric.save();

    if (webVitalsMetrics[metricData.name]) {
      webVitalsMetrics[metricData.name].inc(metricData.value);
    }

    console.log(`Metric received: ${metricData.name} = ${metricData.value}`);
    res.status(201).send('Metric saved');
  } catch (err) {
    console.error('Error saving metric:', err);
    res.status(500).send('Error saving metric');
  }
});

app.get('/api/analytics', async (req, res) => {
  try {
    const stats = await Metric.aggregate([
      {
        $group: {
          _id: '$name',
          count: { $sum: 1 },
          avgValue: { $avg: '$value' },
          minValue: { $min: '$value' },
          maxValue: { $max: '$value' }
        }
      }
    ]);
    
    res.json(stats);
  } catch (err) {
    res.status(500).send('Error fetching analytics');
  }
});

app.use('/api', emailRouter);

app.get('/', (req, res) => {
  res.send('Bank Calculator API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});