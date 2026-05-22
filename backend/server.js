import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Coderyx Express Backend is running!');
});

app.get('/api/stats', (req, res) => {
  res.json({
    status: 'success',
    data: {
      totalSolved: 1284,
      globalRank: 42,
      activeStreak: 284
    }
  });
});

app.get('/api/check-username', (req, res) => {
  const username = (req.query.username || '').toLowerCase();
  const takenUsernames = ['alex', 'john', 'dev_pro', 'coderyx', 'admin', 'lalit'];

  if (!username || username.length < 4) {
    return res.json({ available: false, error: 'Username must be at least 4 characters long.' });
  }

  const validFormat = /^[a-zA-Z0-9_]+$/.test(username);
  if (!validFormat) {
    return res.json({ available: false, error: 'Only letters, numbers, and underscores are allowed.' });
  }

  if (takenUsernames.includes(username)) {
    return res.json({
      available: false,
      suggestions: [`${username}_dev`, `${username}_codes`, `${username}_47`]
    });
  }

  res.json({ available: true });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
