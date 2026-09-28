const express = require('express');
const cors = require('cors');
const path = require('path');

const wellsRouter = require('./routes/wells');
const snippetsRouter = require('./routes/snippets');
const alertsRouter = require('./routes/alerts');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/wells', wellsRouter);
app.use('/api/snippets', snippetsRouter);
app.use('/api/alerts', alertsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'eRTMAC-NWIS Backend API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Active well endpoint
app.get('/api/active-well', (req, res) => {
  try {
    const activeWell = require('./db/active_well.json');
    res.json(activeWell);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load active well data' });
  }
});

// Root welcome / status page
app.get('/', (req, res) => {
  if (req.accepts('html')) {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>eRTMAC-NWIS Backend API</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b1329; color: #f8fafc; padding: 2rem 1rem; margin: 0; line-height: 1.5; }
          .card { background: #111e38; border: 1px solid #1e293b; border-radius: 12px; padding: 2rem; max-width: 760px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 1rem; margin-bottom: 1.5rem; }
          h1 { color: #38bdf8; display: flex; align-items: center; gap: 0.5rem; margin: 0; font-size: 1.5rem; }
          .badge { background: #065f46; color: #34d399; padding: 0.3rem 0.8rem; border-radius: 9999px; font-weight: 600; font-size: 0.8rem; }
          p { color: #94a3b8; font-size: 0.95rem; margin-top: 0; }
          h3 { color: #e2e8f0; margin-top: 1.5rem; margin-bottom: 0.75rem; font-size: 1.1rem; }
          ul { list-style: none; padding-left: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem; }
          li { background: #0b1329; padding: 0.85rem 1.1rem; border-radius: 8px; border: 1px solid #1e2e4a; transition: border-color 0.2s; }
          li:hover { border-color: #38bdf8; }
          a { color: #38bdf8; text-decoration: none; font-family: monospace; font-size: 0.95rem; font-weight: 600; }
          a:hover { text-decoration: underline; }
          .desc { color: #94a3b8; font-size: 0.85rem; margin-top: 0.25rem; }
          .footer { margin-top: 2rem; border-top: 1px solid #1e293b; padding-top: 1rem; font-size: 0.85rem; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>🛢️ eRTMAC-NWIS Backend API</h1>
            <span class="badge">● Online (Port ${PORT})</span>
          </div>
          <p>Oil India Limited — Real-Time Offset Well Intelligence System Backend API.</p>
          
          <h3>Available Endpoints</h3>
          <ul>
            <li>
              <a href="/api/health" target="_blank">GET /api/health</a>
              <div class="desc">System health check, status, and server timestamp.</div>
            </li>
            <li>
              <a href="/api/active-well" target="_blank">GET /api/active-well</a>
              <div class="desc">Current active drilling well (DLJ-NEW-01) telemetry, depth, trajectory, and casing plan.</div>
            </li>
            <li>
              <a href="/api/wells" target="_blank">GET /api/wells</a>
              <div class="desc">All 18 historical offset wells in the Upper Assam basin.</div>
            </li>
            <li>
              <a href="/api/wells/nearby?lat=27.374&lng=95.318&radius=25" target="_blank">GET /api/wells/nearby?lat=27.374&lng=95.318&radius=25</a>
              <div class="desc">Offset wells filtered by geospatial radius from coordinates.</div>
            </li>
            <li>
              <a href="/api/wells/DLJ-01" target="_blank">GET /api/wells/DLJ-01</a>
              <div class="desc">Detailed profile for a well including lithology formations, events, and casing shoe details.</div>
            </li>
            <li>
              <a href="/api/wells/DLJ-01/drilling-params" target="_blank">GET /api/wells/DLJ-01/drilling-params</a>
              <div class="desc">Continuous drilling parameter logs vs depth (ROP, Mud Weight, Torque, WOB).</div>
            </li>
            <li>
              <a href="/api/snippets?q=kick" target="_blank">GET /api/snippets?q=kick</a>
              <div class="desc">Full-text and filtered search across DDR/WCR geological and drilling event knowledge base.</div>
            </li>
            <li>
              <a href="/api/snippets/meta" target="_blank">GET /api/snippets/meta</a>
              <div class="desc">Metadata and distinct values for search filters (formations, event types, well IDs).</div>
            </li>
            <li>
              <a href="/api/alerts?depth=2100&radius=25&lat=27.374&lng=95.318" target="_blank">GET /api/alerts?depth=2100&radius=25</a>
              <div class="desc">Predictive hazard detection engine matching historical offset incidents near current depth.</div>
            </li>
          </ul>

          <div class="footer">
            eRTMAC-NWIS Backend • Connect frontend at <a href="http://localhost:5173" target="_blank" style="font-family: inherit;">http://localhost:5173</a> or <a href="http://localhost:5174" target="_blank" style="font-family: inherit;">http://localhost:5174</a>
          </div>
        </div>
      </body>
      </html>
    `);
  } else {
    res.json({
      status: 'ok',
      message: 'eRTMAC-NWIS Backend API is running',
      endpoints: [
        '/api/health',
        '/api/active-well',
        '/api/wells',
        '/api/wells/nearby',
        '/api/wells/:id',
        '/api/wells/:id/events',
        '/api/wells/:id/drilling-params',
        '/api/snippets',
        '/api/snippets/meta',
        '/api/alerts'
      ]
    });
  }
});

// GET /api index
app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    message: 'eRTMAC-NWIS API index',
    endpoints: {
      health: '/api/health',
      activeWell: '/api/active-well',
      wells: '/api/wells',
      nearbyWells: '/api/wells/nearby?lat=27.374&lng=95.318&radius=25',
      wellProfile: '/api/wells/:id',
      drillingParams: '/api/wells/:id/drilling-params',
      snippets: '/api/snippets?q=',
      snippetsMeta: '/api/snippets/meta',
      alerts: '/api/alerts?depth=2100&radius=25'
    }
  });
});

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    requestedUrl: req.originalUrl,
    availableEndpoints: [
      '/',
      '/api/health',
      '/api/active-well',
      '/api/wells',
      '/api/wells/nearby',
      '/api/wells/:id',
      '/api/wells/:id/drilling-params',
      '/api/snippets',
      '/api/snippets/meta',
      '/api/alerts'
    ]
  });
});

// Start server with port-in-use handling
const server = app.listen(PORT, () => {
  console.log(`\n🛢️  eRTMAC-NWIS Backend API`);
  console.log(`   Server running at http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use by another process.`);
    console.error(`   To free port ${PORT} in PowerShell, run:`);
    console.error(`   Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});
