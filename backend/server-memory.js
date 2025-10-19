const express = require('express');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory MongoDB for testing
let mongoServer;

const startServer = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to IN-MEMORY MongoDB');

  // Simple test data
  const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: String
  }));

  await User.create({ name: 'Test User', email: 'test@example.com' });
  console.log('✅ Test data created');

  // Routes
  app.get('/api/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', database: 'in-memory' });
  });

  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
  });
};

startServer().catch(console.error);