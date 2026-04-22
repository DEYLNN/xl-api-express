import axios from 'axios';
import { 
  buildEncryptedField, 
  javaLikeTimestamp, 
  getXSignature,
  encryptsignXdata,
  decryptXdata,
  randomDeviceId
} from './encrypt.js';

const BASE_API_URL = process.env.BASE_API_URL;
const BASE_CIAM_URL = process.env.BASE_CIAM_URL;
const BASIC_AUTH = process.env.BASIC_AUTH;
const API_KEY = process.env.API_KEY;
const UA = process.env.UA;

// Create axios instance
const apiClient = axios.create({
  timeout: 30000,
  headers: {
    'User-Agent': UA,
    'Content-Type': 'application/json'
  }
});

// Request OTP
export async function requestOtp(msisdn) {
  const url = `${BASE_CIAM_URL}/otp/v2/request`;
  const timestamp = javaLikeTimestamp();
  const encryptedField = buildEncryptedField();
  
  const body = {
    msisdn,
    method: 'SMS',
    client_id: '9fc97ed1-6a30-48d5-9516-60c53ce3a135'
  };
  
  const bodyStr = JSON.stringify(body);
  const signature = getXSignature('/otp/v2/request', 'POST', timestamp, bodyStr);
  
  try {
    const response = await apiClient.post(url, body, {
      headers: {
        'Authorization': `Basic ${BASIC_AUTH}`,
        'X-Timestamp': timestamp,
        'X-Signature': signature,
        'encrypted-field': encryptedField
      }
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// Verify OTP
export async function verifyOtp(msisdn, otp, subscriberId) {
  const url = `${BASE_CIAM_URL}/otp/v2/validate`;
  const timestamp = javaLikeTimestamp();
  const encryptedField = buildEncryptedField();
  
  const body = {
    msisdn,
    otp,
    subscriber_id: subscriberId,
    client_id: '9fc97ed1-6a30-48d5-9516-60c53ce3a135'
  };
  
  const bodyStr = JSON.stringify(body);
  const signature = getXSignature('/otp/v2/validate', 'POST', timestamp, bodyStr);
  
  try {
    const response = await apiClient.post(url, body, {
      headers: {
        'Authorization': `Basic ${BASIC_AUTH}`,
        'X-Timestamp': timestamp,
        'X-Signature': signature,
        'encrypted-field': encryptedField
      }
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// Refresh token
export async function refreshToken(refreshToken) {
  const url = `${BASE_CIAM_URL}/token`;
  const timestamp = javaLikeTimestamp();
  const encryptedField = buildEncryptedField();
  
  const body = {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: '9fc97ed1-6a30-48d5-9516-60c53ce3a135'
  };
  
  const bodyStr = JSON.stringify(body);
  const signature = getXSignature('/token', 'POST', timestamp, bodyStr);
  
  try {
    const response = await apiClient.post(url, body, {
      headers: {
        'Authorization': `Basic ${BASIC_AUTH}`,
        'X-Timestamp': timestamp,
        'X-Signature': signature,
        'encrypted-field': encryptedField
      }
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// Get profile
export async function getProfile(accessToken) {
  const url = `${BASE_API_URL}/profile/v2`;
  const timestamp = javaLikeTimestamp();
  const encryptedField = buildEncryptedField();
  const signature = getXSignature('/profile/v2', 'GET', timestamp);
  
  try {
    const response = await apiClient.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-API-Key': API_KEY,
        'X-Timestamp': timestamp,
        'X-Signature': signature,
        'encrypted-field': encryptedField
      }
    });
    
    const xdata = response.headers['x-data'];
    if (xdata) {
      const decrypted = decryptXdata(xdata);
      return {
        success: true,
        data: decrypted
      };
    }
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// Get balance
export async function getBalance(accessToken) {
  const url = `${BASE_API_URL}/balance/v2`;
  const timestamp = javaLikeTimestamp();
  const encryptedField = buildEncryptedField();
  const signature = getXSignature('/balance/v2', 'GET', timestamp);
  
  try {
    const response = await apiClient.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-API-Key': API_KEY,
        'X-Timestamp': timestamp,
        'X-Signature': signature,
        'encrypted-field': encryptedField
      }
    });
    
    const xdata = response.headers['x-data'];
    if (xdata) {
      const decrypted = decryptXdata(xdata);
      return {
        success: true,
        data: decrypted
      };
    }
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// Get packages by family code
export async function getPackagesByFamily(accessToken, familyCode, isEnterprise = false, migrationType = 'NONE') {
  const url = `${BASE_API_URL}/package/v2/family/${familyCode}`;
  const timestamp = javaLikeTimestamp();
  const encryptedField = buildEncryptedField();
  const signature = getXSignature(`/package/v2/family/${familyCode}`, 'GET', timestamp);
  
  const params = {
    is_enterprise: isEnterprise,
    migration_type: migrationType
  };
  
  try {
    const response = await apiClient.get(url, {
      params,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-API-Key': API_KEY,
        'X-Timestamp': timestamp,
        'X-Signature': signature,
        'encrypted-field': encryptedField
      }
    });
    
    const xdata = response.headers['x-data'];
    if (xdata) {
      const decrypted = decryptXdata(xdata);
      return {
        success: true,
        data: decrypted
      };
    }
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// Get my packages
export async function getMyPackages(accessToken) {
  const url = `${BASE_API_URL}/package/v2/my-packages`;
  const timestamp = javaLikeTimestamp();
  const encryptedField = buildEncryptedField();
  const signature = getXSignature('/package/v2/my-packages', 'GET', timestamp);
  
  try {
    const response = await apiClient.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-API-Key': API_KEY,
        'X-Timestamp': timestamp,
        'X-Signature': signature,
        'encrypted-field': encryptedField
      }
    });
    
    const xdata = response.headers['x-data'];
    if (xdata) {
      const decrypted = decryptXdata(xdata);
      return {
        success: true,
        data: decrypted
      };
    }
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

export default {
  requestOtp,
  verifyOtp,
  refreshToken,
  getProfile,
  getBalance,
  getPackagesByFamily,
  getMyPackages
};
