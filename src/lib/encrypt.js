import CryptoJS from 'crypto-js';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment variables
const ENCRYPTED_FIELD_KEY = process.env.ENCRYPTED_FIELD_KEY;
const XDATA_KEY = process.env.XDATA_KEY;
const AX_API_SIG_KEY = process.env.AX_API_SIG_KEY;
const X_API_BASE_SECRET = process.env.X_API_BASE_SECRET;
const CIRCLE_MSISDN_KEY = process.env.CIRCLE_MSISDN_KEY;

// Random IV generator (16 hex chars)
function randomIvHex16() {
  return crypto.randomBytes(8).toString('hex');
}

// AES CBC Encryption
function aesEncrypt(data, key, iv) {
  const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(key, 'utf8'), Buffer.from(iv, 'utf8'));
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

// AES CBC Decryption
function aesDecrypt(data, key, iv) {
  const decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(key, 'utf8'), Buffer.from(iv, 'utf8'));
  let decrypted = decipher.update(data, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// PKCS7 Padding
function pad(data, blockSize = 16) {
  const padding = blockSize - (data.length % blockSize);
  return Buffer.concat([data, Buffer.alloc(padding, padding)]);
}

// Build encrypted field
export function buildEncryptedField(ivHex16 = null, urlsafeB64 = false) {
  const key = ENCRYPTED_FIELD_KEY;
  const ivHex = ivHex16 || randomIvHex16();
  const iv = ivHex;
  
  const pt = pad(Buffer.from(''), 16);
  const ct = aesEncrypt(pt, key, iv);
  
  let result = ivHex + ct;
  if (urlsafeB64) {
    result = Buffer.from(result).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
  return result;
}

// Decrypt xdata
export function decryptXdata(encryptedData) {
  const key = XDATA_KEY;
  const iv = encryptedData.substring(0, 16);
  const ct = encryptedData.substring(16);
  
  try {
    const decrypted = aesDecrypt(ct, key, iv);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decrypt xdata error:', error);
    return null;
  }
}

// Encrypt and sign xdata
export function encryptsignXdata(data) {
  const key = XDATA_KEY;
  const ivHex = randomIvHex16();
  const iv = ivHex;
  
  const jsonStr = JSON.stringify(data);
  const ct = aesEncrypt(jsonStr, key, iv);
  
  return ivHex + ct;
}

// Java-like timestamp (milliseconds)
export function javaLikeTimestamp() {
  return Date.now();
}

// Get X-Signature for payment
export function getXSignaturePayment(msisdn, timestamp) {
  const message = `${msisdn}${timestamp}${X_API_BASE_SECRET}`;
  return CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex);
}

// Get X-Signature
export function getXSignature(path, method, timestamp, body = '') {
  const bodyHash = body ? CryptoJS.SHA256(body).toString(CryptoJS.enc.Hex) : '';
  const message = `${path}:${method}:${bodyHash}:${timestamp}:${AX_API_SIG_KEY}`;
  return CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex);
}

// Encrypt MSISDN for circle
export function encryptMsisdnCircle(msisdn) {
  const key = CIRCLE_MSISDN_KEY;
  const ivHex = randomIvHex16();
  const iv = ivHex;
  
  const ct = aesEncrypt(msisdn, key, iv);
  return ivHex + ct;
}

// Random device ID
export function randomDeviceId() {
  return crypto.randomBytes(16).toString('hex');
}
