import express from 'express';
import xlClient from '../lib/xl-client.js';

const router = express.Router();

// GET /api/balance
router.get('/', async (req, res) => {
  try {
    const { accessToken } = req.session;
    
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }
    
    const result = await xlClient.getBalance(accessToken);
    
    if (result.success) {
      return res.json(result);
    }
    
    return res.status(400).json(result);
  } catch (error) {
    console.error('Get balance error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
