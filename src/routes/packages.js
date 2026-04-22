import express from 'express';
import xlClient from '../lib/xl-client.js';

const router = express.Router();

// GET /api/packages/family/:familyCode
router.get('/family/:familyCode', async (req, res) => {
  try {
    const { accessToken } = req.session;
    const { familyCode } = req.params;
    const { isEnterprise = false, migrationType = 'NONE' } = req.query;
    
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }
    
    if (!familyCode) {
      return res.status(400).json({
        success: false,
        error: 'familyCode is required'
      });
    }
    
    // Try different combinations if first attempt fails
    let result = await xlClient.getPackagesByFamily(accessToken, familyCode, false, 'NONE');
    
    if (!result.success) {
      result = await xlClient.getPackagesByFamily(accessToken, familyCode, true, 'NONE');
    }
    
    if (result.success) {
      return res.json(result);
    }
    
    return res.status(400).json(result);
  } catch (error) {
    console.error('Get packages by family error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/packages/my-packages
router.get('/my-packages', async (req, res) => {
  try {
    const { accessToken } = req.session;
    
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }
    
    const result = await xlClient.getMyPackages(accessToken);
    
    if (result.success) {
      return res.json(result);
    }
    
    return res.status(400).json(result);
  } catch (error) {
    console.error('Get my packages error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
