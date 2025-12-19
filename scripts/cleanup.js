const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function cleanup() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');
    await mongoose.connection.db.dropDatabase();
    console.log('All fake data removed!');
    await mongoose.disconnect();
    console.log('Database ready for REAL recipes!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

cleanup();