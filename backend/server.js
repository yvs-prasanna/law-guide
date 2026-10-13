import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import legalRoutes from './routes/legalRoutes.js';
import historyRoutes from './routes/historyRoutes.js';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// -------------------------------------------------------------
// Environment Variable Validation on Startup
// -------------------------------------------------------------
function validateEnvironment() {
  const missing = [];
  const warnings = [];

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
    warnings.push('GEMINI_API_KEY is not set. AI legal research requests will return 502 until configured.');
  }

  if (!process.env.SUPABASE_URL) {
    warnings.push('SUPABASE_URL is not set. Authentication and database history will not function.');
  }

  if (!process.env.SUPABASE_PUBLISHABLE_KEY) {
    warnings.push('SUPABASE_PUBLISHABLE_KEY is not set. Authentication verification will fail.');
  }

  if (warnings.length > 0) {
    console.warn('\n============================================================');
    console.warn('⚠️  BACKEND CONFIGURATION WARNINGS:');
    warnings.forEach(w => console.warn(`   • ${w}`));
    console.warn('   Please copy backend/.env.example to backend/.env and populate your keys.');
    console.warn('============================================================\n');
  } else {
    console.log('✅ All core environment variables detected (Gemini + Supabase).');
  }
}

validateEnvironment();

// -------------------------------------------------------------
// Middleware
// -------------------------------------------------------------
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Allow localhost/127.0.0.1 on Vite ports or configured FRONTEND_ORIGIN
    if (
      origin === FRONTEND_ORIGIN ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:')
    ) {
      return callback(null, true);
    }
    
    return callback(null, true); // Permissive for local development pair programming
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '2mb' }));

// Request logger for local observability
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// -------------------------------------------------------------
// Health Check Endpoint
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Legal Case Finder AI - Backend API',
    config: {
      gemini_configured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key'),
      supabase_configured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY),
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    },
  });
});

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------
app.use('/api/legal', legalRoutes);
app.use('/api/legal/history', historyRoutes);

// Catch-all 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route ${req.method} ${req.originalUrl} not found.`,
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  if (statusCode >= 500) {
    console.error('Unhandled server error:', err);
  }
  res.status(statusCode).json({
    success: false,
    error: err.message || 'An internal server error occurred.',
  });
});

// -------------------------------------------------------------
// Start Server
// -------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`\n⚖️  Legal Case Finder AI Backend is running on http://localhost:${PORT}`);
  console.log(`🩺  Health check: http://localhost:${PORT}/api/health\n`);
});
