// FitPro PWA - Profile Module
import { sb } from './config.js';
import { getUser } from './auth.js';
import { toast } from './config.js';
import { renderHome } from './home.js';

export function renderProfile() {
  renderDaysGrid();
  
  // Days input change listener
  document.getElementById('pDays').addEventListener('change', syncDayChecks);
}

export function fillProfile() {
  const profile = JSON.parse(localStorage.getItem('fitpro:profile')) || {};
  if (!profile.fullName) return;
  
  document.getElementById('pName').value = profile.fullName || '';
  document.getElementById('pAge').value = profile.age || '';
  document.getElementById('pSex').value = profile.sex || 'male';
  document.getElementById('pHeight').value = profile.heightCm || '';
  document.getElementById('pWeight').value = profile.weightKg || '';
  document.getElementById('pGoal').value = profile.goal || 'muscle';
  document.getElementById('pLevel').value = profile.level || 'beginner';
  document.getElementById('pDays').value = profile.daysPerWeek || 3;
  document.getElementById('pMinutes').value = profile.sessionMinutes || 60;
  document.getElementById('pEquipment').value = profile.equipment || 'gym';
  document.getElementById('pActivity').value = profile.activity || 'moderate';
  
  renderDaysGrid();
  updatePlanSummary();
}

function renderDaysGrid() {
  const days = Math.max(2, Math.min(6, +document.getElementById('pDays').value || 3));
  const profile = JSON.parse(localStorage.getItem('fitpro:profile')) || {};
  const selected = profile.weekdays || [0, 2, 4].slice(0, days);
  
  const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  
  document.getElementById('daysGrid').innerHTML = DAYS.map((d, i) => `
    <label class="day-checkbox">
      <input type="checkbox" value="${i}" ${selected.includes(i) ? 'checked' : ''}>
      <span class="day-label">${d}</span>
    </label>
  `).join('');
  
  syncDayChecks();
}

export function syncDayChecks() {
  const days = Math.max(2, Math.min(6, +document.getElementById('pDays').value || 3));
  const checkboxes = document.querySelectorAll('#daysGrid input[type=checkbox]');
  const checked = [...checkboxes].filter(c => c.checked);
  
  if (checked.length > days) {
    checked.slice(days).forEach(c => c.checked = false);
  } else if (checked.length < days) {
    const unchecked = [...checkboxes].filter(c => !c.checked);
    unchecked.slice(0, days - checked.length).forEach(c => c.checked = true);
  }
}

export async function saveProfile() {
  const user = getUser();
  if (!user) return;
  
  const days = Math.max(2, Math.min(6, +document.getElementById('pDays').value || 3));
  let weekdays = [...document.querySelectorAll('#daysGrid input[type=checkbox]:checked')].map(c => +c.value);
  
  if (weekdays.length !== days) {
    weekdays = [0, 2, 4].slice(0, days);
    document.querySelectorAll('#daysGrid input[type=checkbox]').forEach((c, i) => c.checked = weekdays.includes(i));
  }
  
  const profile = {
    id: user.id,
    fullName: document.getElementById('pName').value.trim(),
    age: +document.getElementById('pAge').value || null,
    sex: document.getElementById('pSex').value,
    heightCm: +document.getElementById('pHeight').value || null,
    weightKg: +document.getElementById('pWeight').value || null,
    goal: document.getElementById('pGoal').value,
    level: document.getElementById('pLevel').value,
    daysPerWeek: days,
    sessionMinutes: +document.getElementById('pMinutes').value,
    equipment: document.getElementById('pEquipment').value,
    activity: document.getElementById('pActivity').value,
    weekdays
  };
  
  // Validate required fields
  if (!profile.fullName || !profile.age || !profile.heightCm || !profile.weightKg) {
    toast('Lütfen tüm zorunlu alanları doldurun', 'warning');
    return;
  }
  
  const dbRow = {
    id: user.id,
    full_name: profile.fullName,
    age: profile.age,
    sex: profile.sex,
    height_cm: profile.heightCm,
    weight_kg: profile.weightKg,
    goal: profile.goal,
    level: profile.level,
    days_per_week: profile.daysPerWeek,
    weekdays: profile.weekdays,
    equipment: profile.equipment,
    session_minutes: profile.sessionMinutes,
    activity: profile.activity
  };
  
  const { error } = await sb.from('profiles').upsert(dbRow, { onConflict: 'id' });
  
  if (error) {
    toast('Kaydedilemedi: ' + error.message, 'error');
    return;
  }
  
  // Save to localStorage for instant UI updates
  localStorage.setItem('fitpro:profile', JSON.stringify(profile));
  
  toast('Profil ve program güncellendi! 🎉', 'success');
  updatePlanSummary();
  
  // Refresh home view
  renderHome();
}

export function openProfileSetup() {
  // Navigate to profile tab
  document.querySelector('[data-view="profile"]').click();
  
  // If no profile yet, show alert
  const profile = JSON.parse(localStorage.getItem('fitpro:profile')) || {};
  if (!profile.fullName) {
    setTimeout(() => {
      alert('Önce profilini tamamla; programın buna göre oluşturulacak.');
    }, 100);
  }
}

export function updatePlanSummary() {
  const profile = JSON.parse(localStorage.getItem('fitpro:profile')) || {};
  if (!profile.daysPerWeek) return;
  
  const days = profile.daysPerWeek;
  const splits = {
    2: ['Full Body A', 'Full Body B'],
    3: ['Full Body A', 'Full Body B', 'Full Body C'],
    4: ['Upper A', 'Lower A', 'Upper B', 'Lower B'],
    5: ['Push', 'Pull', 'Legs', 'Upper', 'Lower'],
    6: ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B']
  }[days];
  
  const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const dayNames = (profile.weekdays || [0, 2, 4]).map(d => DAYS[d]).join(', ');
  
  document.getElementById('planSummary').innerHTML = `
    <div style="line-height:1.8">
      <strong>Hedef:</strong> ${goalText(profile.goal)}<br>
      <strong>Seviye:</strong> ${levelText(profile.level)}<br>
      <strong>Program:</strong> ${splits.join(' → ')}<br>
      <strong>Günler:</strong> ${dayNames}<br>
      <strong>Ekipman:</strong> ${equipmentText(profile.equipment)}<br>
      <strong>Seans:</strong> ${profile.sessionMinutes} dk<br>
      <strong>Aktivite:</strong> ${activityText(profile.activity)}
    </div>
  `;
}

function goalText(g) {
  const map = { muscle: 'Kas Kazanımı', fat: 'Yağ Kaybı', recomp: 'Recomp', strength: 'Güç', fitness: 'Fitness', performance: 'Performans' };
  return map[g] || g;
}

function levelText(l) {
  const map = { beginner: 'Acemi', novice: 'Başlangıç', intermediate: 'Orta', advanced: 'İleri', athlete: 'Sporcu/Pro' };
  return map[l] || l;
}

function equipmentText(e) {
  const map = { gym: 'Tam Spor Salonu', home: 'Ev / Sınırlı', bodyweight: 'Vücut Ağırlığı' };
  return map[e] || e;
}

function activityText(a) {
  const map = { low: 'Düşük', moderate: 'Orta', high: 'Yüksek', very_high: 'Çok Yüksek' };
  return map[a] || a;
}