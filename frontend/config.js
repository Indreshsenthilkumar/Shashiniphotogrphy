/**
 * API Configuration
 * Automatically detects environment and uses the correct API URL
 */

// IMPORTANT: Update this with your deployed backend URL after deploying to Render/Railway
const PRODUCTION_API_URL = 'https://shashiniphotogrphy-production.up.railway.app/api';

// Auto-detect environment
const isLocalhost = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '';

// Use localhost for development, production URL for deployed site
export const API_URL = isLocalhost ? 'http://127.0.0.1:5001/api' : PRODUCTION_API_URL;

// Google Apps Script URLs (these work from anywhere)
export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz5mtk_rdyaeXB5_YTIXO12NvqlXaSYNKiREsIMJ3FsDDMEmg2aiOc9ExlNYxH03u8k/exec';
export const CMS_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwQTkkUUH6KSrajQCD4WLJ3uRT8ddBDqr-dQFIDwMAkFsAB9PXBZxnYmzo6SaHMP9iF/exec';

console.log(`[Config] Running in ${isLocalhost ? 'LOCAL' : 'PRODUCTION'} mode`);
console.log(`[Config] API URL: ${API_URL}`);
