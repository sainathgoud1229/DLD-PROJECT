// server/routes/api.js
const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');

const DB = path.join(__dirname, '..', 'data', 'leaderboard.json');

async function readDB() {
  try {
    if (!await fs.pathExists(DB)) {
      await fs.outputJson(DB, { scores: [] }, { spaces: 2 });
    }
    return await fs.readJson(DB);
  } catch (e) {
    return { scores: [] };
  }
}

async function writeDB(data) {
  return fs.outputJson(DB, data, { spaces: 2 });
}

// Get project info (simple metadata)
router.get('/info', (req, res) => {
  res.json({
    name: "LED Rhythm Challenge",
    description: "A digital-logic + music game that teaches flip-flops, timing, and sequencing through a rhythm LED game."
  });
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  const db = await readDB();
  res.json(db.scores.slice(0, 20));
});

// Post score
router.post('/score', async (req, res) => {
  const { name, score } = req.body;
  if (!name || typeof score !== 'number') {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  const db = await readDB();
  db.scores.push({ name: name.slice(0,24), score, date: new Date().toISOString() });
  // sort desc
  db.scores.sort((a,b)=>b.score - a.score);
  // keep top 100
  db.scores = db.scores.slice(0,100);
  await writeDB(db);
  res.json({ ok: true });
});

module.exports = router;
