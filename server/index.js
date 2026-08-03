import express from 'express';
import cors from 'cors';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

import {
  readConfig, writeConfig,
  readSessions, appendSession, computeStats,
  readRestaurants, addRestaurant, updateRestaurant, removeRestaurant,
  getScheduleCalendar, getTodaySchedule,
  addScheduleEntry, removeScheduleEntry, executeScheduleEntry, closeScheduleEntry,
} from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(join(__dirname, 'public')));

// ─── Config ───────────────────────────────────────────────────────────────────

app.get('/api/config', async (_req, res) => {
  try { res.json(await readConfig()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/config', async (req, res) => {
  try { res.json(await writeConfig(req.body)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Sessions ─────────────────────────────────────────────────────────────────

app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await readSessions();
    const { restaurant, activation, limit = 100 } = req.query;
    let result = [...sessions].reverse();
    if (restaurant) result = result.filter((s) => s.restaurantName?.toLowerCase().includes(restaurant.toLowerCase()));
    if (activation) result = result.filter((s) => s.activationName?.toLowerCase().includes(activation.toLowerCase()));
    res.json(result.slice(0, parseInt(limit)));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/sessions', async (req, res) => {
  try {
    const { restaurantName, activationName, finalScore, completed, startedAt } = req.body;
    const session = {
      id: randomUUID(),
      restaurantName: restaurantName || 'Desconocido',
      activationName: activationName || '',
      startedAt: startedAt || new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      finalScore: finalScore ?? 0,
      completed: completed ?? true,
    };
    res.status(201).json(await appendSession(session));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Stats ────────────────────────────────────────────────────────────────────

app.get('/api/stats', async (req, res) => {
  try {
    const { restaurantName, activationName } = req.query;
    res.json(await computeStats({ restaurantName, activationName }));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Restaurants ──────────────────────────────────────────────────────────────

app.get('/api/restaurants', async (_req, res) => {
  try { res.json(await readRestaurants()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/restaurants', async (req, res) => {
  try { res.status(201).json(await addRestaurant(req.body)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/restaurants/:id', async (req, res) => {
  try { res.json(await updateRestaurant(req.params.id, req.body)); }
  catch (err) {
    const code = err.message.includes('no encontrado') ? 404 : 500;
    res.status(code).json({ error: err.message });
  }
});

app.delete('/api/restaurants/:id', async (req, res) => {
  try { await removeRestaurant(req.params.id); res.status(204).end(); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Schedule ─────────────────────────────────────────────────────────────────

// IMPORTANT: /today route must come BEFORE /:id routes
app.get('/api/schedule/today', async (_req, res) => {
  try { res.json(await getTodaySchedule()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/schedule', async (req, res) => {
  try {
    const days = parseInt(req.query.days || '14');
    res.json(await getScheduleCalendar(days));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/schedule', async (req, res) => {
  try { res.status(201).json(await addScheduleEntry(req.body)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/schedule/:id', async (req, res) => {
  try { await removeScheduleEntry(req.params.id); res.status(204).end(); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/schedule/:id/execute', async (req, res) => {
  try { res.json(await executeScheduleEntry(req.params.id)); }
  catch (err) {
    const code = err.message.includes('no encontrada') ? 404 : 500;
    res.status(code).json({ error: err.message });
  }
});

app.post('/api/schedule/:id/close', async (req, res) => {
  try { res.json(await closeScheduleEntry(req.params.id)); }
  catch (err) {
    const code = err.message.includes('no encontrada') ? 404 : 500;
    res.status(code).json({ error: err.message });
  }
});

// ─── Fallback → admin UI ──────────────────────────────────────────────────────

app.get('/{*path}', (_req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🎮 BranDers Admin Server`);
  console.log(`   Admin UI  → http://localhost:${PORT}`);
  console.log(`   API       → http://localhost:${PORT}/api\n`);
});
