// server/index.js
const express = require('express');
const path = require('path');
const api = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(require('cors')());

// Serve API routes under /api
app.use('/api', api);

// Serve static frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

// fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`LED Rhythm Challenge server running on port ${PORT}`);
});
