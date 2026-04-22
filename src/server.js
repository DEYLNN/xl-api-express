import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import packagesRoutes from './routes/packages.js';
import balanceRoutes from './routes/balance.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'xl-api-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'XL API Express Server',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/request-otp': 'Request OTP',
        'POST /api/auth/verify-otp': 'Verify OTP and login',
        'POST /api/auth/refresh': 'Refresh access token',
        'GET /api/auth/profile': 'Get user profile',
        'POST /api/auth/logout': 'Logout'
      },
      packages: {
        'GET /api/packages/family/:familyCode': 'Get packages by family code',
        'GET /api/packages/my-packages': 'Get active packages'
      },
      balance: {
        'GET /api/balance': 'Get balance and account info'
      }
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/packages', packagesRoutes);
app.use('/api/balance', balanceRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 XL API Express Server running on port ${PORT}`);
  console.log(`📝 API Documentation: http://localhost:${PORT}`);
  console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
