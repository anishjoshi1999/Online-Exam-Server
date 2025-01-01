const B2 = require('backblaze-b2');
require('dotenv').config();

if (!process.env.B2_APP_KEY_ID || !process.env.B2_APP_KEY) {
  throw new Error('B2 credentials not found in environment variables');
}

const b2 = new B2({
  applicationKeyId: process.env.B2_APP_KEY_ID,
  applicationKey: process.env.B2_APP_KEY,
  axios: {
    baseURL: 'https://api.backblazeb2.com'
  }
});

module.exports = b2;