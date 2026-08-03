import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_DIR = join(__dirname, '..', 'db');

const CONFIG_FILE      = join(DB_DIR, 'config.json');
const SESSIONS_FILE    = join(DB_DIR, 'sessions.json');
const RESTAURANTS_FILE = join(DB_DIR, 'restaurants.json');
const SCHEDULE_FILE    = join(DB_DIR, 'schedule.json');

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function readJSON(path, fallback) {
  try {
    return JSON.parse(await readFile(path, 'utf-8'));
  } catch {
    return fallback;
  }
}

async function writeJSON(path, data) {
  await writeFile(path, JSON.stringify(data, null, 2), 'utf-8');
}

// ─── Config ───────────────────────────────────────────────────────────────────

export async function readConfig() {
  return readJSON(CONFIG_FILE, getDefaultConfig());
}

export async function writeConfig(data) {
  const current = await readConfig();
  const merged = { ...current, ...data };
  await writeJSON(CONFIG_FILE, merged);
  return merged;
}

function getDefaultConfig() {
  return {
    sessionStatus: 'none',
    restaurantName: 'Restaurante Demo',
    activationName: 'Promo Verano 2025',
    prizeName: 'Papas medianas',
    prizeImageUrl: null,
    logoUrl: null,
    gameDuration: 60,
    levels: {
      1: { spawnInterval: 650, maxTokens: 10, minFall: 4.5, maxFall: 6.5 },
      2: { spawnInterval: 470, maxTokens: 14, minFall: 3.4, maxFall: 5.2 },
      3: { spawnInterval: 320, maxTokens: 18, minFall: 2.5, maxFall: 4.2 },
    },
  };
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function readSessions() {
  return readJSON(SESSIONS_FILE, []);
}

export async function appendSession(session) {
  const sessions = await readSessions();
  sessions.push(session);
  await writeJSON(SESSIONS_FILE, sessions.slice(-1000));
  return session;
}

export async function computeStats(filter = {}) {
  const sessions = await readSessions();
  let filtered = sessions.filter((s) => s.completed);

  if (filter.restaurantName) {
    filtered = filtered.filter((s) =>
      s.restaurantName?.toLowerCase().includes(filter.restaurantName.toLowerCase())
    );
  }
  if (filter.activationName) {
    filtered = filtered.filter((s) =>
      s.activationName?.toLowerCase().includes(filter.activationName.toLowerCase())
    );
  }

  const total = filtered.length;
  const totalStarted = sessions.length;
  const scores = filtered.map((s) => s.finalScore || 0);
  const avgScore = total > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / total) : 0;
  const maxScore = total > 0 ? Math.max(...scores) : 0;

  const byDay = {};
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    byDay[d.toISOString().slice(0, 10)] = 0;
  }
  filtered.forEach((s) => {
    const day = (s.startedAt || '').slice(0, 10);
    if (day in byDay) byDay[day]++;
  });

  const restaurants = [...new Set(sessions.map((s) => s.restaurantName).filter(Boolean))];
  const activations  = [...new Set(sessions.map((s) => s.activationName).filter(Boolean))];

  return { total, totalStarted, avgScore, maxScore, byDay, restaurants, activations };
}

// ─── Restaurants ──────────────────────────────────────────────────────────────

export async function readRestaurants() {
  return readJSON(RESTAURANTS_FILE, []);
}

export async function addRestaurant(data) {
  const list = await readRestaurants();
  const entry = { id: randomUUID(), createdAt: new Date().toISOString(), ...data };
  list.push(entry);
  await writeJSON(RESTAURANTS_FILE, list);
  return entry;
}

export async function updateRestaurant(id, data) {
  const list = await readRestaurants();
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('Restaurante no encontrado');
  list[idx] = { ...list[idx], ...data, id, updatedAt: new Date().toISOString() };
  await writeJSON(RESTAURANTS_FILE, list);
  return list[idx];
}

export async function removeRestaurant(id) {
  const list = await readRestaurants();
  await writeJSON(RESTAURANTS_FILE, list.filter((r) => r.id !== id));
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

export async function readSchedule() {
  return readJSON(SCHEDULE_FILE, []);
}

export async function getScheduleCalendar(days = 14) {
  const [schedule, restaurants] = await Promise.all([readSchedule(), readRestaurants()]);
  const result = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const entry = schedule.find((e) => e.date === dateStr) || null;
    const restaurant = entry ? (restaurants.find((r) => r.id === entry.restaurantId) || null) : null;
    result.push({ date: dateStr, entry, restaurant });
  }

  return result;
}

export async function getTodaySchedule() {
  const today = new Date().toISOString().slice(0, 10);
  const [schedule, restaurants] = await Promise.all([readSchedule(), readRestaurants()]);
  const entry = schedule.find((e) => e.date === today) || null;
  const restaurant = entry ? (restaurants.find((r) => r.id === entry.restaurantId) || null) : null;
  return { entry, restaurant };
}

export async function addScheduleEntry(data) {
  const schedule = await readSchedule();
  // Remove existing entry for that date (one per day rule)
  const filtered = schedule.filter((e) => e.date !== data.date);
  const entry = {
    id: randomUUID(),
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    ...data,
  };
  filtered.push(entry);
  filtered.sort((a, b) => a.date.localeCompare(b.date));
  await writeJSON(SCHEDULE_FILE, filtered);
  return entry;
}

export async function removeScheduleEntry(id) {
  const schedule = await readSchedule();
  await writeJSON(SCHEDULE_FILE, schedule.filter((e) => e.id !== id));
}

export async function executeScheduleEntry(id) {
  const [schedule, restaurants] = await Promise.all([readSchedule(), readRestaurants()]);
  const entry = schedule.find((e) => e.id === id);
  if (!entry) throw new Error('Entrada de programación no encontrada');

  const restaurant = restaurants.find((r) => r.id === entry.restaurantId);
  if (!restaurant) throw new Error('Restaurante del perfil no encontrado');

  // Copy restaurant profile → active config
  const { id: _rid, createdAt: _c, updatedAt: _u, ...profileData } = restaurant;
  await writeJSON(CONFIG_FILE, {
    ...profileData,
    sessionStatus: 'active',
    executedAt: new Date().toISOString(),
  });

  // Update schedule entry status
  const idx = schedule.findIndex((e) => e.id === id);
  schedule[idx] = { ...entry, status: 'active', executedAt: new Date().toISOString() };
  await writeJSON(SCHEDULE_FILE, schedule);

  return { entry: schedule[idx], restaurant };
}

export async function closeScheduleEntry(id) {
  const schedule = await readSchedule();
  const idx = schedule.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error('Entrada de programación no encontrada');

  // Mark config as closed
  const config = await readConfig();
  await writeJSON(CONFIG_FILE, { ...config, sessionStatus: 'closed' });

  // Update schedule entry
  schedule[idx] = { ...schedule[idx], status: 'closed', closedAt: new Date().toISOString() };
  await writeJSON(SCHEDULE_FILE, schedule);

  return schedule[idx];
}
