// ============================================
// ETHARA Backend — Entry Point
// ============================================
require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');
const bcrypt   = require('bcryptjs');

const app = express();

// ------- Middleware -------
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());

// ------- API Routes -------
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks',    require('./routes/tasks'));
app.use('/api/comments', require('./routes/comments'));

// ------- Serve Frontend in Production -------
// In production, the built frontend lives in ../dist
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ------- Seed Default Admin User -------
async function seedDatabase() {
  const { User } = require('./models');

  const defaultUsers = [
    { name: 'Ashwani',        email: 'ashwani@gmail.com', password: '123456789', role: 'admin' },
    { name: 'Sarah Jenkins',  email: 'admin@ethara.com',  password: 'password123', role: 'admin' },
    { name: 'Alex Rivera',    email: 'alex@ethara.com',   password: 'password123', role: 'member' },
    { name: 'Chloe Chen',     email: 'chloe@ethara.com',  password: 'password123', role: 'member' },
  ];

  for (const u of defaultUsers) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      const hashed = await bcrypt.hash(u.password, 10);
      await User.create({ name: u.name, email: u.email, password: hashed, role: u.role });
      console.log(`  ✔ Seeded user: ${u.email} (${u.role})`);
    }
  }
}

// ------- Connect to MongoDB & Start Server -------
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 TeamHub backend running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
