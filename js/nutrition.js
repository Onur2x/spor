// FitPro PWA - Nutrition Module
import { sb } from './config.js';
import { getProfile, getUser } from './auth.js';
import { toast } from './config.js';

let foodDataUrl = null;

export function renderNutrition() {
  renderMacros();
  renderWater();
  loadFoodHistory();
}

function renderMacros() {
  const profile = getProfile();
  if (!profile) return;
  
  const targets = calcTargets(profile);
  document.getElementById('macrosDisplay').innerHTML = `
    <div class="macro-item">
      <span class="macro-label">Kalori</span>
      <div class="macro-value">${targets.kcal}</div>
      <span class="macro-unit">kcal</span>
    </div>
    <div class="macro-item">
      <span class="macro-label">Protein</span>
      <div class="macro-value">${targets.protein}</div>
      <span class="macro-unit">g</span>
    </div>
    <div class="macro-item">
      <span class="macro-label">Karbonhidrat</span>
      <div class="macro-value">${targets.carbs}</div>
      <span class="macro-unit">g</span>
    </div>
    <div class="macro-item">
      <span class="macro-label">Yağ</span>
      <div class="macro-value">${targets.fat}</div>
      <span class="macro-unit">g</span>
    </div>
  `;
}

function calcTargets(profile) {
  const w = +profile.weight_kg || 70;
  const h = +profile.height_cm || 175;
  const age = +profile.age || 30;
  const sex = profile.sex || 'male';
  
  let bmr = 10 * w + 6.25 * h - 5 * age + (sex === 'female' ? -161 : 5);
  const act = { low: 1.35, moderate: 1.55, high: 1.75, very_high: 2.0 }[profile.activity] || 1.55;
  let tdee = bmr * act;
  
  const adj = { fat: -350, muscle: 250, recomp: 0, strength: 150, fitness: 0, performance: 200 }[profile.goal] || 0;
  const kcal = Math.round(tdee + adj);
  
  const proteinMult = { fat: 2.2, muscle: 1.8, recomp: 2.0, strength: 1.8, fitness: 1.6, performance: 1.8 }[profile.goal] || 1.7;
  const protein = Math.round(w * proteinMult);
  const fat = Math.round(w * 0.8);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  
  return { kcal, protein, carbs, fat };
}

function renderWater() {
  const profile = getProfile();
  if (!profile) return;
  
  const goal = Math.round((+profile.weight_kg || 70) * 35);
  const current = parseInt(localStorage.getItem('fitpro:water:' + new Date().toISOString().slice(0, 10))) || 0;
  
  document.getElementById('waterGoal').textContent = goal;
  document.getElementById('waterCurrent').textContent = current;
  document.getElementById('waterProgress').style.width = Math.min(100, (current / goal) * 100) + '%';
}

export function addWater(amount) {
  const today = new Date().toISOString().slice(0, 10);
  const key = 'fitpro:water:' + today;
  const current = parseInt(localStorage.getItem(key)) || 0;
  localStorage.setItem(key, current + amount);
  renderWater();
  toast(`${amount} ml su eklendi 💧`, 'success');
}

export function previewFood(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    toast('Lütfen bir resim dosyası seçin', 'error');
    return;
  }
  
  if (file.size > 10 * 1024 * 1024) {
    toast('Dosya çok büyük (max 10MB)', 'error');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    foodDataUrl = e.target.result;
    const preview = document.getElementById('foodPreview');
    preview.src = foodDataUrl;
    preview.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

export async function analyzeFood() {
  if (!foodDataUrl) {
    toast('Önce bir fotoğraf seçin', 'warning');
    return;
  }
  
  const context = document.getElementById('foodContext').value.trim();
  const btn = document.getElementById('analyzeFoodBtn');
  btn.disabled = true;
  btn.textContent = 'Analiz ediliyor...';
  
  try {
    const { data: { session } } = await sb.auth.getSession();
    const res = await fetch(`${sb.supabaseUrl}/functions/v1/fitpro-food-analyzer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ image: foodDataUrl, context })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Analiz başarısız');
    
    renderFoodResult(data);
    toast('Analiz tamamlandı!', 'success');
    
  } catch (err) {
    toast('Hata: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '🤖 AI ile Analiz Et';
  }
}

function renderFoodResult(data) {
  const container = document.getElementById('foodResult');
  container.innerHTML = `
    <div class="food-result-item"><span class="food-result-label">Yemek</span><span class="food-result-value">${esc(data.meal_name || 'Bilinmeyen')}</span></div>
    <div class="food-result-item"><span class="food-result-label">Kalori</span><span class="food-result-value">${data.calories} kcal</span></div>
    <div class="food-result-item"><span class="food-result-label">Protein</span><span class="food-result-value">${data.protein_g}g</span></div>
    <div class="food-result-item"><span class="food-result-label">Karbonhidrat</span><span class="food-result-value">${data.carbs_g}g</span></div>
    <div class="food-result-item"><span class="food-result-label">Yağ</span><span class="food-result-value">${data.fat_g}g</span></div>
    <div class="food-result-item"><span class="food-result-label">Güven</span><span class="food-result-value">${esc(data.confidence || 'orta')}</span></div>
    <button class="btn btn-primary btn-full" style="margin-top:12px" onclick="saveFoodFromAI(${JSON.stringify(data).replace(/"/g, '"')})">Günlüğe Ekle</button>
  `;
  container.classList.remove('hidden');
}

window.saveFoodFromAI = async function(data) {
  const user = getUser();
  if (!user) return;
  
  const { error } = await sb.from('food_logs').insert({
    user_id: user.id,
    logged_at: new Date().toISOString().slice(0, 10),
    meal_type: 'photo_ai',
    meal_name: data.meal_name,
    calories: data.calories,
    protein_g: data.protein_g,
    carbs_g: data.carbs_g,
    fat_g: data.fat_g,
    items: data.items || [],
    confidence: data.confidence,
    notes: 'AI analizi'
  });
  
  if (error) {
    toast('Kaydedilemedi: ' + error.message, 'error');
  } else {
    toast('Yemek günlüğe eklendi!', 'success');
    document.getElementById('foodResult').classList.add('hidden');
    document.getElementById('foodPreview').classList.add('hidden');
    document.getElementById('foodPhoto').value = '';
    foodDataUrl = null;
    loadFoodHistory();
    renderMacros(); // refresh totals
  }
};

export async function saveNutrition() {
  const user = getUser();
  if (!user) return;
  
  const data = {
    user_id: user.id,
    logged_at: new Date().toISOString().slice(0, 10),
    calories: +document.getElementById('inputCalories').value || 0,
    protein_g: +document.getElementById('inputProtein').value || 0,
    carbs_g: +document.getElementById('inputCarbs').value || 0,
    fat_g: +document.getElementById('inputFat').value || 0,
    notes: document.getElementById('foodNote').value || ''
  };
  
  const { error } = await sb.from('nutrition_logs').upsert(data, { onConflict: 'user_id,logged_at' });
  
  if (error) {
    toast('Kaydedilemedi: ' + error.message, 'error');
  } else {
    toast('Beslenme kaydedildi!', 'success');
    document.getElementById('inputCalories').value = '';
    document.getElementById('inputProtein').value = '';
    document.getElementById('inputCarbs').value = '';
    document.getElementById('inputFat').value = '';
    document.getElementById('foodNote').value = '';
    loadFoodHistory();
  }
}

export async function loadFoodHistory() {
  const user = getUser();
  if (!user) return;
  
  const { data } = await sb.from('food_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);
  
  const container = document.getElementById('nutritionHistory');
  container.innerHTML = (data || []).map(item => `
    <div class="history-item">
      <div class="history-item-header">
        <span class="history-item-date">${formatDate(item.logged_at)} - ${mealTypeTr(item.meal_type)}</span>
        <span class="history-item-value">${item.calories} kcal</span>
      </div>
      <div class="history-item-details">
        <span>P: ${item.protein_g}g</span>
        <span>C: ${item.carbs_g}g</span>
        <span>F: ${item.fat_g}g</span>
        ${item.meal_name ? `<span>${esc(item.meal_name)}</span>` : ''}
      </div>
    </div>
  `).join('') || '<div class="history-item" style="text-align:center;color:var(--text-muted)">Henüz kayıt yok</div>';
}

function mealTypeTr(type) {
  const map = {
    breakfast: 'Kahvaltı', lunch: 'Öğle', dinner: 'Akşam',
    snack: 'Ara', pre_workout: 'Antrenman Öncesi', post_workout: 'Antrenman Sonrası',
    photo_ai: '📸 AI'
  };
  return map[type] || type;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' });
}

function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, m => ({
    '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#039;'
  }[m]));
}