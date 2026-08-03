// ─── Constants ────────────────────────────────────────────────────────────────

const API = 'http://localhost:3001/api';

// ─── State ────────────────────────────────────────────────────────────────────

let currentConfig       = null;
let currentSessions     = [];
let restaurantProfiles  = [];
let scheduleCalendar    = [];
let todayData           = { entry: null, restaurant: null };
let editingRestaurantId = null;
let profileImages       = { prizeImageUrl: null, logoUrl: null };

// ─── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupSliders();
  setupMainUploads();
  setupForms();
  setupStatsFilters();
  setupScheduleTab();
  setupModalSliders();
  setupModalUploads();
  loadConfig();
});

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TAB_META = {
  config:       { title: 'Configuración',  sub: 'Personaliza el juego para cada restaurante o activación' },
  difficulty:   { title: 'Dificultad',     sub: 'Ajusta la velocidad y cantidad de tokens por nivel' },
  programacion: { title: 'Programación',   sub: 'Gestiona restaurantes, programación y sesiones del día' },
  stats:        { title: 'Estadísticas',   sub: 'Historial de partidas y métricas de uso' },
};

function setupTabs() {
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function switchTab(tab) {
  document.querySelectorAll('.nav-item').forEach((b) => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));

  const navEl = document.getElementById(`nav-${tab}`);
  const panelEl = document.getElementById(`tab-${tab}`);
  if (navEl) navEl.classList.add('active');
  if (panelEl) panelEl.classList.add('active');

  const meta = TAB_META[tab] || {};
  document.getElementById('page-title').textContent = meta.title || '';
  document.getElementById('page-sub').textContent   = meta.sub || '';

  if (tab === 'stats') loadStats();
  if (tab === 'programacion') loadScheduleTab();
}

// ─── Sliders (main tabs) ──────────────────────────────────────────────────────

function setupSliders() {
  // Only the main-tab sliders (not inside modals)
  const mainSliders = [
    'gameDuration',
    'l1-spawnInterval','l1-maxTokens','l1-minFall','l1-maxFall',
    'l2-spawnInterval','l2-maxTokens','l2-minFall','l2-maxFall',
    'l3-spawnInterval','l3-maxTokens','l3-minFall','l3-maxFall',
  ];

  mainSliders.forEach((id) => {
    const slider = document.getElementById(id);
    if (!slider) return;
    updateSliderVisual(slider);
    slider.addEventListener('input', () => {
      updateSliderVisual(slider);
      updateMainSliderLabel(id, slider.value);
    });
  });

  const dur = document.getElementById('gameDuration');
  if (dur) dur.addEventListener('input', () => {
    document.getElementById('gameDurationValue').textContent = `${dur.value}s`;
  });
}

function updateSliderVisual(slider) {
  const min = parseFloat(slider.min);
  const max = parseFloat(slider.max);
  const val = parseFloat(slider.value);
  const pct = ((val - min) / (max - min)) * 100;
  slider.style.setProperty('--val', `${pct}%`);
}

function updateMainSliderLabel(id, value) {
  const map = {
    'l1-spawnInterval':'l1-spawn-val','l1-maxTokens':'l1-tokens-val','l1-minFall':'l1-minfall-val','l1-maxFall':'l1-maxfall-val',
    'l2-spawnInterval':'l2-spawn-val','l2-maxTokens':'l2-tokens-val','l2-minFall':'l2-minfall-val','l2-maxFall':'l2-maxfall-val',
    'l3-spawnInterval':'l3-spawn-val','l3-maxTokens':'l3-tokens-val','l3-minFall':'l3-minfall-val','l3-maxFall':'l3-maxfall-val',
  };
  const slider = document.getElementById(id);
  const labelId = map[id];
  if (!labelId) return;
  const unit = slider?.dataset.unit ?? '';
  const v = parseFloat(value);
  document.getElementById(labelId).textContent = `${Number.isInteger(v) ? v : v.toFixed(1)}${unit}`;
}

// ─── Sliders (modal) ──────────────────────────────────────────────────────────

function setupModalSliders() {
  // Setup all sliders inside the restaurant modal using data-label attr
  const modalSliders = document.querySelectorAll('#restaurantModal .form-slider');
  modalSliders.forEach((slider) => {
    updateSliderVisual(slider);
    slider.addEventListener('input', () => {
      updateSliderVisual(slider);
      const labelId = slider.dataset.label;
      const unit    = slider.dataset.unit ?? '';
      if (!labelId) return;
      const v = parseFloat(slider.value);
      const el = document.getElementById(labelId);
      if (el) el.textContent = `${Number.isInteger(v) ? v : v.toFixed(1)}${unit}`;
    });
  });
}

// ─── Main tab uploads ─────────────────────────────────────────────────────────

function setupMainUploads() {
  setupImageUpload({
    inputId:'prizeImageInput', btnId:'prizeUploadBtn', clearId:'prizeClearBtn', previewId:'prizePreview',
    onSet:(b64) => { if (currentConfig) currentConfig.prizeImageUrl = b64; },
    onClear:()  => { if (currentConfig) currentConfig.prizeImageUrl = null; },
  });
  setupImageUpload({
    inputId:'logoImageInput', btnId:'logoUploadBtn', clearId:'logoClearBtn', previewId:'logoPreview',
    onSet:(b64) => { if (currentConfig) currentConfig.logoUrl = b64; },
    onClear:()  => { if (currentConfig) currentConfig.logoUrl = null; },
  });
}

// ─── Modal uploads ────────────────────────────────────────────────────────────

function setupModalUploads() {
  setupImageUpload({
    inputId:'rp-prizeInput', btnId:'rp-prizeUploadBtn', clearId:'rp-prizeClearBtn', previewId:'rp-prizePreview',
    onSet:(b64) => { profileImages.prizeImageUrl = b64; },
    onClear:()  => { profileImages.prizeImageUrl = null; },
  });
  setupImageUpload({
    inputId:'rp-logoInput', btnId:'rp-logoUploadBtn', clearId:'rp-logoClearBtn', previewId:'rp-logoPreview',
    onSet:(b64) => { profileImages.logoUrl = b64; },
    onClear:()  => { profileImages.logoUrl = null; },
  });
}

function setupImageUpload({ inputId, btnId, clearId, previewId, onSet, onClear }) {
  const input    = document.getElementById(inputId);
  const btn      = document.getElementById(btnId);
  const clearBtn = document.getElementById(clearId);
  const preview  = document.getElementById(previewId);
  if (!input || !btn) return;

  btn.addEventListener('click', () => input.click());

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('⚠️ La imagen supera 2MB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviewImage(preview, ev.target.result);
      if (clearBtn) clearBtn.style.display = 'inline-flex';
      onSet(ev.target.result);
    };
    reader.readAsDataURL(file);
  });

  if (clearBtn) clearBtn.addEventListener('click', () => {
    clearPreviewImage(preview);
    clearBtn.style.display = 'none';
    input.value = '';
    onClear();
  });
}

function setPreviewImage(container, src) {
  if (!container) return;
  container.innerHTML = `<img src="${src}" alt="Preview" />`;
}

function clearPreviewImage(container) {
  if (!container) return;
  container.innerHTML = `<div class="upload-placeholder"><span class="upload-icon">🖼️</span><span>Haz clic para subir</span></div>`;
}

// ─── Forms ────────────────────────────────────────────────────────────────────

function setupForms() {
  document.getElementById('config-form').addEventListener('submit', (e) => { e.preventDefault(); saveConfig(); });
  document.getElementById('difficulty-form').addEventListener('submit', (e) => { e.preventDefault(); saveDifficulty(); });
}

// ─── Load / Apply Config ──────────────────────────────────────────────────────

async function loadConfig() {
  try {
    const res = await fetch(`${API}/config`);
    currentConfig = await res.json();
    applyConfigToUI(currentConfig);
  } catch {
    showToast('❌ No se pudo conectar al servidor', 'error');
  }
}

function applyConfigToUI(cfg) {
  setValue('restaurantName', cfg.restaurantName ?? '');
  setValue('activationName', cfg.activationName ?? '');
  setValue('prizeName',      cfg.prizeName ?? '');

  const dur = document.getElementById('gameDuration');
  if (dur) { dur.value = cfg.gameDuration ?? 60; document.getElementById('gameDurationValue').textContent = `${dur.value}s`; updateSliderVisual(dur); }

  if (cfg.prizeImageUrl) { setPreviewImage(document.getElementById('prizePreview'), cfg.prizeImageUrl); showEl('prizeClearBtn'); }
  if (cfg.logoUrl)       { setPreviewImage(document.getElementById('logoPreview'), cfg.logoUrl);   showEl('logoClearBtn'); }

  const levels = cfg.levels ?? {};
  for (let i = 1; i <= 3; i++) {
    const l = levels[i] ?? {};
    setMainSlider(`l${i}-spawnInterval`, l.spawnInterval, 'ms', `l${i}-spawn-val`);
    setMainSlider(`l${i}-maxTokens`,     l.maxTokens,     '',   `l${i}-tokens-val`);
    setMainSlider(`l${i}-minFall`,       l.minFall,       's',  `l${i}-minfall-val`);
    setMainSlider(`l${i}-maxFall`,       l.maxFall,       's',  `l${i}-maxfall-val`);
  }
  updateLevelRanges(cfg.gameDuration ?? 60);
}

function setMainSlider(sliderId, value, unit, labelId) {
  if (value == null) return;
  const slider = document.getElementById(sliderId);
  if (!slider) return;
  slider.value = value;
  updateSliderVisual(slider);
  const v = parseFloat(value);
  if (labelId) document.getElementById(labelId).textContent = `${Number.isInteger(v) ? v : v.toFixed(1)}${unit}`;
}

function updateLevelRanges(duration) {
  const third = Math.round(duration / 3);
  const el1 = document.getElementById('l1-range'); if (el1) el1.textContent = `0–${third}s`;
  const el2 = document.getElementById('l2-range'); if (el2) el2.textContent = `${third}–${third*2}s`;
  const el3 = document.getElementById('l3-range'); if (el3) el3.textContent = `${third*2}–${duration}s`;
}

// ─── Save Config ──────────────────────────────────────────────────────────────

async function saveConfig() {
  const btn = document.getElementById('saveConfigBtn');
  const status = document.getElementById('saveStatus');
  btn.disabled = true; btn.textContent = 'Guardando…';

  const data = {
    restaurantName: getValue('restaurantName'),
    activationName: getValue('activationName'),
    prizeName:      getValue('prizeName'),
    gameDuration:   parseInt(document.getElementById('gameDuration').value),
    prizeImageUrl:  currentConfig?.prizeImageUrl ?? null,
    logoUrl:        currentConfig?.logoUrl ?? null,
  };

  try {
    const res = await fetch(`${API}/config`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });
    if (!res.ok) throw new Error();
    currentConfig = { ...currentConfig, ...data };
    updateLevelRanges(data.gameDuration);
    showStatus(status, '✅ Guardado');
    showToast('✅ Configuración guardada', 'success');
  } catch { showToast('❌ Error al guardar', 'error'); }
  finally { btn.disabled = false; btn.innerHTML = '<span class="btn-icon">💾</span> Guardar configuración'; }
}

// ─── Save Difficulty ──────────────────────────────────────────────────────────

async function saveDifficulty() {
  const btn = document.getElementById('saveDiffBtn');
  const status = document.getElementById('saveDiffStatus');
  btn.disabled = true; btn.textContent = 'Guardando…';

  const levels = {};
  for (let i = 1; i <= 3; i++) {
    levels[i] = {
      spawnInterval: parseFloat(document.getElementById(`l${i}-spawnInterval`).value),
      maxTokens:     parseInt(document.getElementById(`l${i}-maxTokens`).value),
      minFall:       parseFloat(document.getElementById(`l${i}-minFall`).value),
      maxFall:       parseFloat(document.getElementById(`l${i}-maxFall`).value),
    };
  }

  try {
    const res = await fetch(`${API}/config`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ levels }) });
    if (!res.ok) throw new Error();
    currentConfig = { ...currentConfig, levels };
    showStatus(status, '✅ Guardado');
    showToast('✅ Dificultad guardada', 'success');
  } catch { showToast('❌ Error al guardar', 'error'); }
  finally { btn.disabled = false; btn.innerHTML = '<span class="btn-icon">💾</span> Guardar dificultad'; }
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── PROGRAMACIÓN TAB ────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function setupScheduleTab() {
  // Assign modal
  document.getElementById('openAssignBtn').addEventListener('click', () => openAssignModal());
  document.getElementById('assignConfirmBtn').addEventListener('click', confirmAssign);
  document.getElementById('assignCancelBtn').addEventListener('click', closeAssignModal);
  document.getElementById('assignModalClose').addEventListener('click', closeAssignModal);
  document.getElementById('assignModal').addEventListener('click', (e) => { if (e.target.id === 'assignModal') closeAssignModal(); });

  // Restaurant profile modal
  document.getElementById('newRestaurantBtn').addEventListener('click', () => openRestaurantModal(null));
  document.getElementById('saveRestaurantProfileBtn').addEventListener('click', saveRestaurantProfile);
  document.getElementById('cancelRestaurantModalBtn').addEventListener('click', closeRestaurantModal);
  document.getElementById('restaurantModalClose').addEventListener('click', closeRestaurantModal);
  document.getElementById('restaurantModal').addEventListener('click', (e) => { if (e.target.id === 'restaurantModal') closeRestaurantModal(); });

  // Set today's date as default for assign modal
  document.getElementById('assignDate').value = new Date().toISOString().slice(0, 10);
}

async function loadScheduleTab() {
  await Promise.all([loadTodaySession(), loadCalendar(), loadRestaurantProfiles()]);
}

// ─── TODAY SESSION ────────────────────────────────────────────────────────────

async function loadTodaySession() {
  try {
    const res = await fetch(`${API}/schedule/today`);
    todayData = await res.json();
    renderTodayCard(todayData);
  } catch {
    document.getElementById('todayBanner').innerHTML = `<div class="today-loading">Error al cargar la sesión de hoy</div>`;
  }
}

function renderTodayCard({ entry, restaurant }) {
  const banner = document.getElementById('todayBanner');
  const now    = new Date();
  const todayLabel = now.toLocaleDateString('es-MX', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const todayStr   = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);

  if (!entry || !restaurant) {
    // No session today
    const restaurantOptions = restaurantProfiles.map((r) =>
      `<option value="${r.id}">${escHtml(r.restaurantName)} — ${escHtml(r.activationName)}</option>`
    ).join('');

    banner.innerHTML = `
      <div class="today-card today-card--none">
        <div class="today-info">
          <div class="today-date-label">📅 HOY · ${todayStr}</div>
          <div class="today-restaurant-name" style="color:var(--text-muted)">Sin sesión programada</div>
          <div class="today-activation-name">Asigna un restaurante para activar el kiosco</div>
          <div class="today-assign-form" style="margin-top:16px">
            <div class="form-group">
              <select class="form-input form-select" id="todayQuickSelect">
                <option value="">— Selecciona un perfil —</option>
                ${restaurantOptions}
              </select>
            </div>
            <button class="btn-execute" id="todayQuickAssignBtn" style="padding:10px 18px">+ Asignar y Ejecutar</button>
          </div>
        </div>
      </div>`;
    document.getElementById('todayQuickAssignBtn')?.addEventListener('click', quickAssignAndExecuteToday);
    return;
  }

  const status = entry.status;
  const chipMap = {
    scheduled: `<span class="chip chip--scheduled">⏳ Programado</span>`,
    active:    `<span class="chip chip--active pulse">● Activo</span>`,
    closed:    `<span class="chip chip--closed">⏹ Cerrado</span>`,
  };
  const chip = chipMap[status] || '';

  const executedTime = entry.executedAt
    ? new Date(entry.executedAt).toLocaleTimeString('es-MX', { hour:'2-digit', minute:'2-digit' })
    : null;

  const actions = status === 'scheduled'
    ? `<button class="btn-execute" id="todayExecuteBtn">▶ Ejecutar sesión</button>`
    : status === 'active'
    ? `<button class="btn-close-session" id="todayCloseBtn">⏹ Cerrar sesión</button>`
    : `<span style="color:var(--text-muted);font-size:13px">Sesión cerrada</span>`;

  banner.innerHTML = `
    <div class="today-card today-card--${status}">
      <div class="today-info">
        <div class="today-date-label">📅 HOY · ${todayStr}</div>
        <div class="today-restaurant-name">${escHtml(restaurant.restaurantName)}</div>
        <div class="today-activation-name">${escHtml(restaurant.activationName || '')}</div>
        <div class="today-status-row">
          ${chip}
          ${executedTime ? `<span style="font-size:12px;color:var(--text-muted)">Ejecutado a las ${executedTime}</span>` : ''}
        </div>
      </div>
      <div class="today-actions">${actions}</div>
    </div>`;

  document.getElementById('todayExecuteBtn')?.addEventListener('click', () => executeSession(entry.id));
  document.getElementById('todayCloseBtn')?.addEventListener('click', () => closeSession(entry.id));
}

async function quickAssignAndExecuteToday() {
  const select = document.getElementById('todayQuickSelect');
  const restaurantId = select?.value;
  if (!restaurantId) { showToast('⚠️ Selecciona un restaurante', 'error'); return; }

  try {
    const today = new Date().toISOString().slice(0, 10);
    const addRes = await fetch(`${API}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId, date: today }),
    });
    if (!addRes.ok) throw new Error();
    const entry = await addRes.json();

    const execRes = await fetch(`${API}/schedule/${entry.id}/execute`, { method: 'POST' });
    if (!execRes.ok) throw new Error();

    showToast('✅ Sesión ejecutada — el juego está activo', 'success');
    await Promise.all([loadTodaySession(), loadCalendar()]);
  } catch { showToast('❌ Error al asignar y ejecutar', 'error'); }
}

async function executeSession(scheduleId) {
  const btn = document.getElementById('todayExecuteBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Ejecutando…'; }
  try {
    const res = await fetch(`${API}/schedule/${scheduleId}/execute`, { method: 'POST' });
    if (!res.ok) throw new Error((await res.json()).error || 'Error');
    showToast('✅ Sesión ejecutada — el juego está activo', 'success');
    await Promise.all([loadTodaySession(), loadCalendar(), loadConfig()]);
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
    if (btn) { btn.disabled = false; btn.textContent = '▶ Ejecutar sesión'; }
  }
}

async function closeSession(scheduleId) {
  if (!confirm('¿Cerrar la sesión? El kiosco mostrará la pantalla de inactivo.')) return;
  try {
    const res = await fetch(`${API}/schedule/${scheduleId}/close`, { method: 'POST' });
    if (!res.ok) throw new Error((await res.json()).error || 'Error');
    showToast('⏹ Sesión cerrada — kiosco inactivo', 'success');
    await Promise.all([loadTodaySession(), loadCalendar()]);
  } catch (err) { showToast(`❌ ${err.message}`, 'error'); }
}

// ─── CALENDAR ─────────────────────────────────────────────────────────────────

async function loadCalendar() {
  try {
    const res = await fetch(`${API}/schedule?days=14`);
    scheduleCalendar = await res.json();
    renderCalendar(scheduleCalendar);
  } catch { /* silent */ }
}

function renderCalendar(calendar) {
  const tbody = document.getElementById('calendarBody');
  if (!calendar || calendar.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="table-empty">Sin datos</td></tr>`;
    return;
  }

  const today = new Date().toISOString().slice(0, 10);

  tbody.innerHTML = calendar.map(({ date, entry, restaurant }) => {
    const isToday = date === today;
    const dayLabel = new Date(date + 'T12:00:00').toLocaleDateString('es-MX', { weekday:'short' });
    const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('es-MX', { day:'numeric', month:'short' });

    let chipHtml = `<span class="chip chip--none">—</span>`;
    let restaurantHtml = `<span style="color:var(--text-muted)">Sin asignar</span>`;
    let actionsHtml = `<button class="action-btn" onclick="openAssignModal('${date}')">+ Asignar</button>`;

    if (entry && restaurant) {
      const chipMap = {
        scheduled:`<span class="chip chip--scheduled">⏳</span>`,
        active:   `<span class="chip chip--active">●</span>`,
        closed:   `<span class="chip chip--closed">⏹</span>`,
      };
      chipHtml = chipMap[entry.status] || '';
      restaurantHtml = `<strong>${escHtml(restaurant.restaurantName)}</strong><br><span style="font-size:11px;color:var(--text-muted)">${escHtml(restaurant.activationName||'')}</span>`;
      actionsHtml = `
        <div class="action-btn-row">
          <button class="action-btn" onclick="openAssignModal('${date}')">Cambiar</button>
          <button class="action-btn action-btn--danger" onclick="removeSchedule('${entry.id}')">✕</button>
        </div>`;
    }

    const rowStyle = isToday ? 'background:rgba(255,255,255,0.03);font-weight:600' : '';

    return `<tr style="${rowStyle}">
      <td>${isToday ? '📍' : ''} ${dayLabel.charAt(0).toUpperCase()+dayLabel.slice(1)}</td>
      <td>${dateLabel}</td>
      <td>${restaurantHtml}</td>
      <td>${chipHtml}</td>
      <td>${actionsHtml}</td>
    </tr>`;
  }).join('');
}

async function removeSchedule(id) {
  if (!confirm('¿Quitar esta programación?')) return;
  try {
    const res = await fetch(`${API}/schedule/${id}`, { method:'DELETE' });
    if (!res.ok && res.status !== 204) throw new Error();
    showToast('🗑 Programación eliminada', 'success');
    await Promise.all([loadTodaySession(), loadCalendar()]);
  } catch { showToast('❌ Error al eliminar', 'error'); }
}

// ─── ASSIGN MODAL ─────────────────────────────────────────────────────────────

function openAssignModal(date) {
  const dateInput  = document.getElementById('assignDate');
  const selectEl   = document.getElementById('assignRestaurantSelect');

  dateInput.value = date || new Date().toISOString().slice(0, 10);

  selectEl.innerHTML = `<option value="">— Selecciona un perfil —</option>` +
    restaurantProfiles.map((r) => `<option value="${r.id}">${escHtml(r.restaurantName)} — ${escHtml(r.activationName)}</option>`).join('');

  document.getElementById('assignModal').classList.add('open');
}

function closeAssignModal() {
  document.getElementById('assignModal').classList.remove('open');
}

async function confirmAssign() {
  const restaurantId = document.getElementById('assignRestaurantSelect').value;
  const date         = document.getElementById('assignDate').value;

  if (!restaurantId) { showToast('⚠️ Selecciona un restaurante', 'error'); return; }
  if (!date)         { showToast('⚠️ Selecciona una fecha', 'error'); return; }

  try {
    const res = await fetch(`${API}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId, date }),
    });
    if (!res.ok) throw new Error();
    showToast('✅ Restaurante asignado', 'success');
    closeAssignModal();
    await Promise.all([loadTodaySession(), loadCalendar()]);
  } catch { showToast('❌ Error al asignar', 'error'); }
}

// ─── RESTAURANT PROFILES ──────────────────────────────────────────────────────

async function loadRestaurantProfiles() {
  try {
    const res = await fetch(`${API}/restaurants`);
    restaurantProfiles = await res.json();
    renderRestaurantProfiles();
  } catch { /* silent */ }
}

function renderRestaurantProfiles() {
  const grid = document.getElementById('profilesGrid');
  if (!grid) return;

  if (restaurantProfiles.length === 0) {
    grid.innerHTML = `<div class="profiles-empty">No hay perfiles guardados. Crea el primero con el botón "+ Nuevo perfil".</div>`;
    return;
  }

  grid.innerHTML = restaurantProfiles.map((r) => `
    <div class="profile-card">
      <div class="profile-card-icon">🏪</div>
      <div class="profile-card-name">${escHtml(r.restaurantName)}</div>
      <div class="profile-card-activation">${escHtml(r.activationName || '')}</div>
      <div class="profile-card-meta">
        <span>⏱ ${r.gameDuration || 60}s</span>
        <span>🏆 ${escHtml(r.prizeName || '—')}</span>
      </div>
      <div class="profile-card-actions">
        <button class="action-btn" onclick="openRestaurantModal('${r.id}')">✏️ Editar</button>
        <button class="action-btn action-btn--danger" onclick="deleteRestaurantProfile('${r.id}')">🗑</button>
      </div>
    </div>`).join('');
}

function openRestaurantModal(restaurantId) {
  editingRestaurantId = restaurantId;
  profileImages = { prizeImageUrl: null, logoUrl: null };

  const title = document.getElementById('restaurantModalTitle');
  title.textContent = restaurantId ? '🏪 Editar perfil' : '🏪 Nuevo perfil';

  // Reset form
  const fields = ['rp-restaurantName','rp-activationName','rp-prizeName'];
  fields.forEach((id) => setValue(id, ''));

  const dur = document.getElementById('rp-gameDuration');
  if (dur) { dur.value = 60; updateSliderVisual(dur); const lbl = document.getElementById('rp-durationVal'); if (lbl) lbl.textContent = '60s'; }

  // Reset difficulty sliders to defaults
  const defaults = { 1:{spawnInterval:650,maxTokens:10,minFall:4.5,maxFall:6.5}, 2:{spawnInterval:470,maxTokens:14,minFall:3.4,maxFall:5.2}, 3:{spawnInterval:320,maxTokens:18,minFall:2.5,maxFall:4.2} };
  [1,2,3].forEach((lvl) => {
    const d = defaults[lvl];
    setModalSlider(`rp-l${lvl}-spawnInterval`, d.spawnInterval);
    setModalSlider(`rp-l${lvl}-maxTokens`,     d.maxTokens);
    setModalSlider(`rp-l${lvl}-minFall`,        d.minFall);
    setModalSlider(`rp-l${lvl}-maxFall`,        d.maxFall);
  });

  // Reset previews
  clearPreviewImage(document.getElementById('rp-prizePreview'));
  clearPreviewImage(document.getElementById('rp-logoPreview'));
  hideEl('rp-prizeClearBtn'); hideEl('rp-logoClearBtn');
  document.getElementById('rp-prizeInput').value = '';
  document.getElementById('rp-logoInput').value  = '';

  // Populate if editing
  if (restaurantId) {
    const r = restaurantProfiles.find((p) => p.id === restaurantId);
    if (r) populateRestaurantModal(r);
  }

  document.getElementById('restaurantModal').classList.add('open');
}

function populateRestaurantModal(r) {
  setValue('rp-restaurantName', r.restaurantName || '');
  setValue('rp-activationName', r.activationName || '');
  setValue('rp-prizeName',      r.prizeName || '');

  const dur = document.getElementById('rp-gameDuration');
  if (dur) {
    dur.value = r.gameDuration || 60;
    updateSliderVisual(dur);
    const lbl = document.getElementById('rp-durationVal');
    if (lbl) lbl.textContent = `${dur.value}s`;
  }

  if (r.prizeImageUrl) { setPreviewImage(document.getElementById('rp-prizePreview'), r.prizeImageUrl); showEl('rp-prizeClearBtn'); profileImages.prizeImageUrl = r.prizeImageUrl; }
  if (r.logoUrl)       { setPreviewImage(document.getElementById('rp-logoPreview'), r.logoUrl);   showEl('rp-logoClearBtn');  profileImages.logoUrl = r.logoUrl; }

  const levels = r.levels || {};
  [1,2,3].forEach((lvl) => {
    const l = levels[lvl] || {};
    if (l.spawnInterval != null) setModalSlider(`rp-l${lvl}-spawnInterval`, l.spawnInterval);
    if (l.maxTokens     != null) setModalSlider(`rp-l${lvl}-maxTokens`,     l.maxTokens);
    if (l.minFall       != null) setModalSlider(`rp-l${lvl}-minFall`,        l.minFall);
    if (l.maxFall       != null) setModalSlider(`rp-l${lvl}-maxFall`,        l.maxFall);
  });
}

function setModalSlider(id, value) {
  const slider = document.getElementById(id);
  if (!slider) return;
  slider.value = value;
  updateSliderVisual(slider);
  const labelId = slider.dataset.label;
  const unit    = slider.dataset.unit ?? '';
  if (labelId) {
    const v = parseFloat(value);
    const el = document.getElementById(labelId);
    if (el) el.textContent = `${Number.isInteger(v) ? v : v.toFixed(1)}${unit}`;
  }
}

function closeRestaurantModal() {
  document.getElementById('restaurantModal').classList.remove('open');
  editingRestaurantId = null;
}

async function saveRestaurantProfile() {
  const name = getValue('rp-restaurantName');
  if (!name) { showToast('⚠️ El nombre del restaurante es requerido', 'error'); return; }

  const levels = {};
  [1,2,3].forEach((lvl) => {
    levels[lvl] = {
      spawnInterval: parseFloat(document.getElementById(`rp-l${lvl}-spawnInterval`)?.value || 0),
      maxTokens:     parseInt(document.getElementById(`rp-l${lvl}-maxTokens`)?.value || 0),
      minFall:       parseFloat(document.getElementById(`rp-l${lvl}-minFall`)?.value || 0),
      maxFall:       parseFloat(document.getElementById(`rp-l${lvl}-maxFall`)?.value || 0),
    };
  });

  const data = {
    restaurantName: name,
    activationName: getValue('rp-activationName'),
    prizeName:      getValue('rp-prizeName'),
    gameDuration:   parseInt(document.getElementById('rp-gameDuration')?.value || 60),
    prizeImageUrl:  profileImages.prizeImageUrl,
    logoUrl:        profileImages.logoUrl,
    levels,
  };

  const btn = document.getElementById('saveRestaurantProfileBtn');
  btn.disabled = true; btn.textContent = 'Guardando…';

  try {
    let res;
    if (editingRestaurantId) {
      res = await fetch(`${API}/restaurants/${editingRestaurantId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
    } else {
      res = await fetch(`${API}/restaurants`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
    }
    if (!res.ok) throw new Error();
    showToast(`✅ Perfil ${editingRestaurantId ? 'actualizado' : 'creado'}`, 'success');
    closeRestaurantModal();
    await loadRestaurantProfiles();
  } catch { showToast('❌ Error al guardar el perfil', 'error'); }
  finally { btn.disabled = false; btn.textContent = '💾 Guardar perfil'; }
}

async function deleteRestaurantProfile(id) {
  const profile = restaurantProfiles.find((r) => r.id === id);
  if (!confirm(`¿Eliminar el perfil "${profile?.restaurantName}"?`)) return;
  try {
    await fetch(`${API}/restaurants/${id}`, { method:'DELETE' });
    showToast('🗑 Perfil eliminado', 'success');
    await loadRestaurantProfiles();
  } catch { showToast('❌ Error al eliminar', 'error'); }
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── STATS TAB ───────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function setupStatsFilters() {
  document.getElementById('applyFilterBtn').addEventListener('click', loadStats);
  document.getElementById('clearFilterBtn').addEventListener('click', () => {
    document.getElementById('filterRestaurant').value = '';
    document.getElementById('filterActivation').value = '';
    loadStats();
  });
  document.getElementById('exportCsvBtn').addEventListener('click', exportCsv);
}

async function loadStats() {
  const restaurant = document.getElementById('filterRestaurant').value.trim();
  const activation = document.getElementById('filterActivation').value.trim();
  const params = new URLSearchParams();
  if (restaurant) params.set('restaurant', restaurant);
  if (activation) params.set('activation', activation);

  try {
    const [statsRes, sessRes] = await Promise.all([
      fetch(`${API}/stats?${params}`),
      fetch(`${API}/sessions?${params}&limit=100`),
    ]);
    const stats    = await statsRes.json();
    const sessions = await sessRes.json();
    currentSessions = sessions;

    document.getElementById('kpi-total').textContent   = stats.total.toLocaleString();
    document.getElementById('kpi-started').textContent = stats.totalStarted.toLocaleString();
    document.getElementById('kpi-avg').textContent     = stats.avgScore.toLocaleString();
    document.getElementById('kpi-max').textContent     = stats.maxScore.toLocaleString();

    renderBarChart(stats.byDay);
    renderSessionsTable(sessions);
  } catch { showToast('❌ Error al cargar estadísticas', 'error'); }
}

function renderBarChart(byDay) {
  const canvas = document.getElementById('barChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const labels = Object.keys(byDay).map((d) => {
    const date = new Date(d + 'T12:00:00');
    return date.toLocaleDateString('es-MX', { weekday:'short', day:'numeric' });
  });
  const data   = Object.values(byDay);
  const maxVal = Math.max(...data, 1);

  const dpr  = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width  = rect.width  * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const W = rect.width, H = rect.height;
  const padL = 40, padR = 16, padT = 16, padB = 40;
  const chartW = W - padL - padR, chartH = H - padT - padB;
  ctx.clearRect(0, 0, W, H);

  const n = labels.length;
  const barW = Math.max(20, (chartW / n) * 0.55);
  const gap  = chartW / n;

  for (let i = 0; i <= 4; i++) {
    const y = padT + chartH - (chartH / 4) * i;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + chartW, y); ctx.stroke();
    const val = Math.round((maxVal / 4) * i);
    ctx.fillStyle = 'rgba(136,136,170,0.7)'; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(val, padL - 6, y + 4);
  }

  data.forEach((val, i) => {
    const x    = padL + gap * i + gap / 2 - barW / 2;
    const barH = val > 0 ? Math.max(4, (val / maxVal) * chartH) : 2;
    const y    = padT + chartH - barH;
    const r    = Math.min(6, barW / 4);
    const grad = ctx.createLinearGradient(0, y, 0, y + barH);
    grad.addColorStop(0, '#ff4444'); grad.addColorStop(1, 'rgba(220,50,50,0.3)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + barW - r, y);
    ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
    ctx.lineTo(x + barW, y + barH); ctx.lineTo(x, y + barH); ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); ctx.fill();
    if (val > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = 'bold 11px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(val, x + barW / 2, y - 6);
    }
    ctx.fillStyle = 'rgba(136,136,170,0.8)'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(labels[i], x + barW / 2, padT + chartH + 18);
  });
}

function renderSessionsTable(sessions) {
  const tbody = document.getElementById('sessionsBody');
  if (sessions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="table-empty">No hay sesiones registradas aún</td></tr>`;
    return;
  }
  tbody.innerHTML = sessions.map((s) => {
    const date = s.startedAt ? new Date(s.startedAt).toLocaleString('es-MX', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';
    const chip = s.completed
      ? `<span class="status-chip status-chip--done">✓ Completa</span>`
      : `<span class="status-chip status-chip--partial">⚡ Parcial</span>`;
    return `<tr>
      <td>${date}</td>
      <td>${escHtml(s.restaurantName ?? '—')}</td>
      <td>${escHtml(s.activationName ?? '—')}</td>
      <td class="score-cell">${(s.finalScore ?? 0).toLocaleString()}</td>
      <td>${chip}</td>
    </tr>`;
  }).join('');
}

function exportCsv() {
  if (currentSessions.length === 0) { showToast('⚠️ No hay sesiones para exportar', 'error'); return; }
  const headers = ['Fecha','Restaurante','Activacion','Score','Completa'];
  const rows = currentSessions.map((s) => [s.startedAt ?? '', s.restaurantName ?? '', s.activationName ?? '', s.finalScore ?? 0, s.completed ? 'Sí' : 'No']);
  const csv = [headers,...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `branders_sesiones_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  URL.revokeObjectURL(url);
  showToast('✅ CSV exportado', 'success');
}

// ─── Shared Helpers ───────────────────────────────────────────────────────────

function getValue(id)      { return document.getElementById(id)?.value.trim() ?? ''; }
function setValue(id, val) { const el = document.getElementById(id); if (el) el.value = val; }
function showEl(id)        { const el = document.getElementById(id); if (el) el.style.display = 'inline-flex'; }
function hideEl(id)        { const el = document.getElementById(id); if (el) el.style.display = 'none'; }

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showStatus(el, msg) {
  el.textContent = msg; el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 3000);
}

let toastTimer = null;
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className   = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}
