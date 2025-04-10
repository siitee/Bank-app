// import express from 'express';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import emailRouter from './routes/email.js';
import morgan from 'morgan';
import fs from 'fs';
import { collectDefaultMetrics, Registry, Counter } from 'prom-client';
import mongoose from 'mongoose';
import helmet from 'helmet'; // Добавлен helmet для безопасности

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Подключение helmet с настройками для SEO
app.use(helmet({
  contentSecurityPolicy: false, // Можно настроить отдельно
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

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

// Добавляем кэширование статики для SEO
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=86400');
  next();
});

// Генерация sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>${process.env.FRONTEND_URL || 'http://localhost:3000'}/</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>
    <url>
      <loc>${process.env.FRONTEND_URL || 'http://localhost:3000'}/credits</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <priority>0.8</priority>
    </url>
    <url>
      <loc>${process.env.FRONTEND_URL || 'http://localhost:3000'}/deposits</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <priority>0.8</priority>
    </url>
  </urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(sitemap);
});

// Редиректы для SEO
app.use((req, res, next) => {
  if (req.headers.host.startsWith('www.')) {
    return res.redirect(301, `https://${req.headers.host.replace('www.', '')}${req.url}`);
  }
  next();
});

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

// Обновленный корневой маршрут с базовой SEO-информацией
app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bank Calculator API</title>
      <meta name="description" content="API для банковского калькулятора кредитов и вкладов">
      <link rel="canonical" href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">
    </head>
    <body>
      <h1>Bank Calculator API is running</h1>
      <p>Документация API доступна по <a href="/api">ссылке</a></p>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});