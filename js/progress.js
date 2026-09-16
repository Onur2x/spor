// FitPro PWA - Progress Module
import { sb } from './config.js';
import { getUser } from './auth.js';
import { toast } from './config.js';

let weightChart = null;
let weeklySetsChart = null;

export async function renderProgress() {
  const user = getUser();
  if (!user) return;
  
  try {
    const [
      { data: workouts },
      { data: sets },
      { data: prs },
      { data: measurements }
    ] = await Promise.all([
      sb.from('workouts').select('id, workout_date').eq('user_id', user.id),
      sb.from('workout_sets').select('weight_kg, reps, exercise_id, created_at').eq('user_id', user.id).eq('completed', true),
      sb.from('personal_records').select('*').eq('user_id', user.id).order('value', { ascending: false }).limit(20),
      sb.from('body_measurements').select('measured_at, weight_kg, waist_cm, chest_cm, arm_cm, thigh_cm, calf_cm, body_fat_pct').eq('user_id', user.id).order('measured_at', { ascending: true })
    ]);
    
    // Stats
    document.getElementById('totalWorkouts').textContent = workouts?.length || 0;
    document.getElementById('prCount').textContent = prs?.length || 0;
    
    const totalVolume = sets?.reduce((sum, s) => sum + (+s.weight_kg || 0) * (+s.reps || 0), 0) || 0;
    document.getElementById('totalVolume').textContent = Math.round(totalVolume).toLocaleString('tr-TR');
    
    const lastWeight = measurements?.length ? measurements.at(-1).weight_kg : '—';
    document.getElementById('lastWeight').textContent = lastWeight;
    
    // Charts
    renderWeightChart(measurements || []);
    renderWeeklySetsChart(sets || []);
    
    // PR List
    renderPRList(prs || []);
    
    // Measurements History
    renderMeasurementsHistory(measurements || []);
    
  } catch (err) {
    console.error('Progress load error:', err);
    toast('Veriler yüklenemedi: ' + err.message, 'error');
  }
}

function renderWeightChart(data) {
  const ctx = document.getElementById('weightChart');
  if (!ctx) return;
  
  if (weightChart) weightChart.destroy();
  
  weightChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.measured_at),
      datasets: [{
        label: 'Kilo (kg)',
        data: data.map(d => d.weight_kg),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        x: { grid: { display: false } }
      }
    }
  });
}

function renderWeeklySetsChart(sets) {
  const ctx = document.getElementById('weeklySetsChart');
  if (!ctx) return;
  
  // Last 8 weeks
  const weeks = [];
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay() + 1); // Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weeks.push({ start: weekStart.toISOString().slice(0, 10), end: weekEnd.toISOString().slice(0, 10) });
  }
  
  const weeklyCounts = weeks.map(w => 
    sets.filter(s => s.created_at >= w.start && s.created_at <= w.end).length
  );
  
  if (weeklySetsChart) weeklySetsChart.destroy();
  
  weeklySetsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: weeks.map((_, i) => `${i+1}. Hafta`),
      datasets: [{
        label: 'Set Sayısı',
        data: weeklyCounts,
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: '#22c55e',
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
        x: { grid: { display: false } }
      }
    }
  });
}

function renderPRList(prs) {
  const container = document.getElementById('prList');
  container.innerHTML = (prs || []).map(pr => `
    <div class="history-item">
      <div class="history-item-header">
        <span class="history-item-date">${esc(pr.exercise_id)} (${pr.record_type})</span>
        <span class="history-item-value">${(+pr.value).toFixed(1)} kg</span>
      </div>
      <div class="history-item-details">
        <span>${formatDate(pr.achieved_at)}</span>
      </div>
    </div>
  `).join('') || '<div class="history-item" style="text-align:center;color:var(--text-muted)">Henüz kişisel rekor yok</div>';
}

function renderMeasurementsHistory(data) {
  const container = document.getElementById('measurementsHistory');
  container.innerHTML = [...data].reverse().map(m => `
    <div class="history-item">
      <div class="history-item-header">
        <span class="history-item-date">${formatDate(m.measured_at)}</span>
        <span class="history-item-value">${m.weight_kg ? m.weight_kg + ' kg' : '—'}</span>
      </div>
      <div class="history-item-details">
        ${m.waist_cm ? `<span>Bel: ${m.waist_cm}cm</span>` : ''}
        ${m.chest_cm ? `<span>Göğüs: ${m.chest_cm}cm</span>` : ''}
        ${m.arm_cm ? `<span>Kol: ${m.arm_cm}cm</span>` : ''}
        ${m.thigh_cm ? `<span>Uyluk: ${m.thigh_cm}cm</span>` : ''}
        ${m.calf_cm ? `<span>Baldır: ${m.calf_cm}cm</span>` : ''}
        ${m.body_fat_pct ? `<span>Yağ: %${m.body_fat_pct}</span>` : ''}
      </div>
    </div>
  `).join('') || '<div class="history-item" style="text-align:center;color:var(--text-muted)">Henüz ölçüm yok</div>';
}

export async function saveMeasurements() {
  const user = getUser();
  if (!user) return;
  
  const data = {
    user_id: user.id,
    measured_at: new Date().toISOString().slice(0, 10),
    weight_kg: +document.getElementById('mWeight').value || null,
    waist_cm: +document.getElementById('mWaist').value || null,
    chest_cm: +document.getElementById('mChest').value || null,
    arm_cm: +document.getElementById('mArm').value || null,
    thigh_cm: +document.getElementById('mThigh').value || null,
    calf_cm: +document.getElementById('mCalf').value || null,
    body_fat_pct: +document.getElementById('mBodyFat').value || null
  };
  
  const { error } = await sb.from('body_measurements').insert(data);
  
  if (error) {
    toast('Kaydedilemedi: ' + error.message, 'error');
  } else {
    toast('Ölçümler kaydedildi!', 'success');
    // Clear inputs
    ['mWeight', 'mWaist', 'mChest', 'mArm', 'mThigh', 'mCalf', 'mBodyFat'].forEach(id => {
      document.getElementById(id).value = '';
    });
    renderProgress();
  }
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, m => ({
    '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#039;'
  }[m]));
}