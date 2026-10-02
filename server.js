import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB, getDBStatus } from './config/db.js';
import apiRoutes from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config(); // Also check cwd as fallback

const app = express();
const PORT = process.env.PORT || 5000;

// Production & Development CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5173',
  process.env.CLIENT_URL,
  process.env.PRODUCTION_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests or mobile/curl/postman (where origin is undefined)
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    // Also allow wildcard or matching domains
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Connect MongoDB Atlas
connectDB();

// API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'MediJobs Clinical Recruitment Engine',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
    database: getDBStatus()
  });
});

// Production Static Frontend Hosting (Single-Port Production Deployment)
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'))) {
  console.log(`📦 [Production Asset Pipeline] Serving optimized React build from: ${distPath}`);
  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ success: false, error: 'API endpoint not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // API Welcome Dashboard when dist is not yet generated
  app.get('/', (req, res) => {
    const db = getDBStatus();
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MediJobs API Engine</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; background: #F8FAFC; color: #0F172A; max-width: 720px; margin: auto; }
            .card { background: white; border-radius: 16px; padding: 28px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #E2E8F0; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-weight: 700; font-size: 12px; }
            .badge-live { background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; }
            .badge-warn { background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }
            h1 { font-size: 24px; font-weight: 800; color: #0F172A; margin-top: 12px; }
            ul { padding-left: 20px; line-height: 1.8; }
            a { color: #0D9488; text-decoration: none; font-weight: 600; }
            a:hover { text-decoration: underline; }
            code { background: #F1F5F9; padding: 2px 6px; border-radius: 6px; font-size: 13px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge ${db.connected ? 'badge-live' : 'badge-warn'}">
              ● MongoDB: ${db.connected ? 'Connected (' + db.host + ')' : 'Connecting / Fallback Mode'}
            </span>
            <h1>🏥 MediJobs Specialized Healthcare Recruitment API</h1>
            <p>Production-ready RESTful medical recruitment platform engine.</p>
            <h3>Available Endpoints:</h3>
            <ul>
              <li><a href="/api/health">/api/health</a> - System &amp; Database Health</li>
              <li><a href="/api/jobs">/api/jobs</a> - Active Hospital Vacancies</li>
              <li><a href="/api/candidates">/api/candidates</a> - Pre-Screened Medical Talent</li>
              <li><a href="/api/applications">/api/applications</a> - Candidate Dossiers (ATS)</li>
              <li><a href="/api/stats">/api/stats</a> - Platform Aggregated Metrics</li>
              <li><a href="/api/license/verify?query=1821161191">/api/license/verify?query=...</a> - Live CMS NPPES &amp; International Board Verifier</li>
            </ul>
            <p style="font-size: 12px; color: #64748B; margin-top: 24px;">To serve the web application frontend on this port, build the frontend using <code>npm run build</code>.</p>
          </div>
        </body>
      </html>
    `);
  });
}

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🏥 MediJobs Backend Server running on port ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server gracefully.');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

export default app;
