import express from 'express';
import xlClient from '../lib/xl-client.js';

const router = express.Router();

// POST /api/auth/request-otp
router.post('/request-otp', async (req, res) => {
  try {
    const { msisdn } = req.body;
    
    if (!msisdn) {
      return res.status(400).json({
        success: false,
        error: 'msisdn is required'
      });
    }
    
    // Ensure msisdn starts with 62
    const formattedMsisdn = msisdn.startsWith('62') ? msisdn : `62${msisdn.replace(/^0/, '')}`;
    
    const result = await xlClient.requestOtp(formattedMsisdn);
    
    if (result.success) {
      // Store subscriber_id in session for OTP verification
      req.session.subscriberId = result.data.subscriber_id;
      req.session.msisdn = formattedMsisdn;
      
      return res.json({
        success: true,
        message: 'OTP sent successfully',
        data: {
          expires_in: result.data.expires_in,
          max_validation_attempt: result.data.max_validation_attempt,
          subscriber_id: result.data.subscriber_id
        }
      });
    }
    
    return res.status(400).json(result);
  } catch (error) {
    console.error('Request OTP error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { otp } = req.body;
    const { subscriberId, msisdn } = req.session;
    
    if (!otp) {
      return res.status(400).json({
        success: false,
        error: 'otp is required'
      });
    }
    
    if (!subscriberId || !msisdn) {
      return res.status(400).json({
        success: false,
        error: 'Please request OTP first'
      });
    }
    
    const result = await xlClient.verifyOtp(msisdn, otp, subscriberId);
    
    if (result.success) {
      // Store tokens in session
      req.session.accessToken = result.data.access_token;
      req.session.refreshToken = result.data.refresh_token;
      req.session.tokenExpiry = Date.now() + (result.data.expires_in * 1000);
      
      // Get profile
      const profileResult = await xlClient.getProfile(result.data.access_token);
      
      if (profileResult.success) {
        req.session.profile = profileResult.data;
      }
      
      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          access_token: result.data.access_token,
          expires_in: result.data.expires_in,
          profile: profileResult.data
        }
      });
    }
    
    return res.status(400).json(result);
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.session;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'No refresh token found'
      });
    }
    
    const result = await xlClient.refreshToken(refreshToken);
    
    if (result.success) {
      req.session.accessToken = result.data.access_token;
      req.session.refreshToken = result.data.refresh_token;
      req.session.tokenExpiry = Date.now() + (result.data.expires_in * 1000);
      
      return res.json({
        success: true,
        message: 'Token refreshed',
        data: {
          access_token: result.data.access_token,
          expires_in: result.data.expires_in
        }
      });
    }
    
    return res.status(400).json(result);
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/auth/profile
router.get('/profile', async (req, res) => {
  try {
    const { accessToken } = req.session;
    
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }
    
    const result = await xlClient.getProfile(accessToken);
    
    if (result.success) {
      req.session.profile = result.data;
      return res.json(result);
    }
    
    return res.status(400).json(result);
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
    
    return res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

export default router;
