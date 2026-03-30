// Force Node.js to use Google DNS 8.8.8.8 for DNS resolution
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

console.log('Testing with Google DNS...');
console.log('URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 })
  .then(() => {
    console.log('✅ SUCCESS! MongoDB connected!');
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ FAILED:', err.message);
    process.exit(1);
  });
