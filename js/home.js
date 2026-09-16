// FitPro PWA - Home / Today View
import { sb } from './config.js';
import { getProfile, getUser } from './auth.js';
import { getExercisesForSplit } from './exercises-data.js';
import { toast } from './config.js';

let currentPlan = null;

export async function renderHome() {
  const profile = getProfile();
  if (!profile) return;
  
  currentPlan = buildPlan(profile);
  
  const todayIdx = getTodayWorkoutIndex(profile);
  const splitName = todayIdx >= 0 ? currentPlan.splits[todayIdx % currentPlan.splits.length] : 'Dinlenme / Recovery';
  const isRestDay = todayIdx < 0;
  
  // Update header
  document.getElementById('todayWorkoutName').textContent = 
    isRestDay ? 'Bugün Dinlenme Günü 🛌' : splitName;
  document.getElementById('todayWorkoutDesc').textContent = 
    `${profile.full_name} • ${profile.days_per_week} gün/hafta • ${profile.session_minutes} dk • ${levelText(profile.level)}`;
  
  // Readiness score
  const readiness = await calcReadiness();
  document.getElementById('readinessScore').textContent = readiness ?? '—';
  document.getElementById('readinessScore').style.color = 
    readiness >= 7 ? '#22c55e' : readiness >= 5 ? '#f59e0b' : '#ef4444';
  
  // Coach decision
  renderCoachDecision(readiness);
  
  // Weekly stats
  await loadWeeklyStats();
  
  // Today's nutrition
  await loadTodayNutrition();
  
  // Render workout or rest
  if (isRestDay) {
    renderRestDay();
  } else {
    renderTodayWorkout(splitName);
  }
}

function getTodayWorkoutIndex(profile) {
  const weekdays = profile.weekdays || [0, 2, 4];
  const today = new Date();
  const dow = (today.getDay() + 6) % 7; // 0=Mon
  return weekdays.indexOf(dow);
}

function buildPlan(profile) {
  const days = Math.max(2, Math.min(6, profile.days_per_week || 3));
  const splits = {
    2: ['Full Body A', 'Full Body B'],
    3: ['Full Body A', 'Full Body B', 'Full Body C'],
    4: ['Upper A', 'Lower A', 'Upper B', 'Lower B'],
    5: ['Push', 'Pull', 'Legs', 'Upper', 'Lower'],
    6: ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B']
  }[days];
  
  return { splits, weekdays: profile.weekdays || [0, 2, 4] };
}

async function calcReadiness() {
  const user = getUser();
  if (!user) return null;
  
  const { data } = await sb.from('recovery_logs')
    .select('*').eq('user_id', user.id)
    .eq('logged_at', new Date().toISOString().slice(0, 10))
    .maybeSingle();
  
  if (!data) return null;
  
  const sleep = Math.min(10, Math.max(0, +data.sleep_hours || 0));
  const energy = Math.min(10, Math.max(1, +data.energy || 5));
  const soreness = Math.min(10, Math.max(1, +data.soreness || 5));
  const stress = Math.min(10, Math.max(1, +data.stress || 5));
  const sleepQuality = Math.min(10, Math.max(1, +data.sleep_quality || 5));
  
  const score = (sleep / 10 * 3) + (sleepQuality / 10 * 1.5) + 
                (energy / 10 * 2.5) + ((10 - soreness) / 10 * 2) + 
                ((10 - stress) / 10 * 1);
  
  return Math.round(Math.max(0, Math.min(10, score)) * 10) / 10;
}

function renderCoachDecision(readiness) {
  const el = document.getElementById('coachDecision');
  let title, desc, color;
  
  if (readiness === null) {
    title = 'Recovery Gir';
    desc = 'Bugün uyku, enerji, ağrılık ve stresini kaydet ki hazırlık skorunu hesaplayayım.';
    color = '#38bdf8';
  } else if (readiness < 5) {
    title = 'Koruyucu Gün 🛡️';
    desc = 'Yükü %5-10 azalt, failure yapma, RIR 3-4 tut. Odaklan: teknik ve hareket kalitesi.';
    color = '#ef4444';
  } else if (readiness < 7) {
    title = 'Kontrollü İlerleme ⚖️';
    desc = 'Planı uygula, RIR 2-3 bırak. Teknik kaliteyi önceliklendir. Gerekiyorsa hafif azalt.';
    color = '#f59e0b';
  } else {
    title = 'İlerleme Fırsatı 🚀';
    desc = 'Tekrar aralığının üst sınırına ulaşırsan küçük bir yük artışı dene. Bugün güçlü hissediyorsun.';
    color = '#22c55e';
  }
  
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px">
      <div style="width:12px;height:12px;border-radius:50%;background:${color}"></div>
      <b style="font-size:16px;color:${color}">${title}</b>
    </div>
    <p style="margin:8px 0 0;color:var(--text-secondary)">${desc}</p>
  `;
}

async function loadWeeklyStats() {
  const user = getUser();
  if (!user) return;
  
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().slice(0, 10);
  
  const { data: sets } = await sb.from('workout_sets')
    .select('weight_kg, reps, created_at')
    .eq('user_id', user.id)
    .gte('created_at', weekAgoStr)
    .eq('completed', true);
  
  const setCount = sets?.length || 0;
  const volume = sets?.reduce((sum, s) => sum + (+s.weight_kg || 0) * (+s.reps || 0), 0) || 0;
  
  document.getElementById('weekSets').textContent = setCount;
  document.getElementById('weekVolume').textContent = Math.round(volume).toLocaleString('tr-TR');
}

async function loadTodayNutrition() {
  const user = getUser();
  if (!user) return;
  
  const { data } = await sb.from('nutrition_logs')
    .select('calories')
    .eq('user_id', user.id)
    .eq('logged_at', new Date().toISOString().slice(0, 10))
    .maybeSingle();
  
  document.getElementById('todayCalories').textContent = data?.calories || 0;
}

function renderRestDay() {
  const container = document.getElementById('todayWorkout');
  container.innerHTML = `
    <div class="card" style="text-align:center;padding:40px 20px">
      <div style="font-size:48px;margin-bottom:16px">🛌</div>
      <h3 style="margin-bottom:8px">Dinlenme Günü</h3>
      <p style="color:var(--text-secondary);margin-bottom:20px">Vücudun toparlanıyor. Hafif yürüyüş, mobilite, bol su ve erken yatış yap.</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-secondary" onclick="navigateTo('exercises')">Egzersizleri İncele</button>
        <button class="btn btn-primary" onclick="navigateTo('recovery')">Recovery Kaydet</button>
      </div>
    </div>
  `;
}

function renderTodayWorkout(splitName) {
  const profile = getProfile();
  const exercises = getExercisesForSplit(splitName, profile.equipment, profile.level, profile.session_minutes);
  
  let html = '<div class="workout-container">';
  
  exercises.forEach((ex, idx) => {
    html += `
      <div class="exercise-card" data-exercise-id="${ex.id}" data-rest-sec="${ex.restSec}" data-exercise-name="${ex.nameTr}">
        <div class="exercise-header">
          <div class="exercise-info">
            <strong>${ex.nameTr}</strong>
            <div class="exercise-meta">
              <span>${ex.muscleTr}</span>
              <span>${ex.sets} set × ${ex.minReps}-${ex.maxReps} tek</span>
              <span>${ex.restSec}s dinlenme</span>
            </div>
          </div>
          <button class="btn btn-secondary" onclick="startWorkout('${ex.id}')">Başlat</button>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  document.getElementById('todayWorkout').innerHTML = html;
}

export function startWorkout(exerciseId) {
  // Navigate to active workout view with this exercise
  const profile = getProfile();
  const todayIdx = getTodayWorkoutIndex(profile);
  const splitName = currentPlan.splits[todayIdx % currentPlan.splits.length];
  const exercises = getExercisesForSplit(splitName, profile.equipment, profile.level, profile.session_minutes);
  
  // Store workout state
  window.currentWorkout = {
    splitName,
    exercises,
    startTime: Date.now(),
    currentExerciseIndex: exercises.findIndex(e => e.id === exerciseId)
  };
  
  navigateTo('workout');
  renderActiveWorkout();
}

function renderActiveWorkout() {
  const workout = window.currentWorkout;
  if (!workout) return;
  
  document.getElementById('activeWorkoutName').textContent = workout.splitName;
  
  let html = '';
  workout.exercises.forEach((ex, idx) => {
    const isCurrent = idx === workout.currentExerciseIndex;
    const isDone = idx < workout.currentExerciseIndex;
    
    html += `
      <div class="active-exercise ${isCurrent ? 'current' : ''} ${isDone ? 'completed' : ''}" 
           data-exercise-id="${ex.id}" data-rest-sec="${ex.restSec}" data-exercise-name="${ex.nameTr}">
        <div class="active-exercise-header">
          <span class="active-exercise-number">${idx + 1}/${workout.exercises.length}</span>
          <span class="active-exercise-name">${ex.nameTr}</span>
          <span class="active-exercise-meta">${ex.muscleTr} • ${ex.sets} set × ${ex.minReps}-${ex.maxReps}</span>
        </div>
        <div class="active-sets">
          ${Array.from({length: ex.sets}, (_, s) => `
            <div class="active-set-row ${s < ex.sets - 1 && isCurrent ? 'current' : ''}" 
                 data-exercise-id="${ex.id}">
              <span style="font-weight:700;color:var(--text-muted);font-size:13px">${s + 1}</span>
              <input type="number" class="set-input set-weight" step="0.5" placeholder="kg" ${isDone || s > 0 ? '' : 'autofocus'}>
              <input type="number" class="set-input set-reps" placeholder="${Math.round((ex.minReps + ex.maxReps) / 2)}">
              <input type="number" class="set-input set-rir" min="0" max="10" value="2" placeholder="RIR">
              <button class="btn-done ${isDone ? 'completed' : ''}" onclick="completeSet(this)" ${isDone ? '' : 'disabled'}>✓</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });
  
  document.getElementById('activeWorkoutExercises').innerHTML = html;
}

function levelText(level) {
  const map = { beginner: 'Acemi', novice: 'Başlangıç', intermediate: 'Orta', advanced: 'İleri', athlete: 'Sporcu/Pro' };
  return map[level] || level;
}