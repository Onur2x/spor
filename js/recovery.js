// FitPro PWA - Recovery Module
import { sb } from './config.js';
import { getUser } from './auth.js';
import { toast } from './config.js';

export function renderRecovery() {
  loadTodayRecovery();
  renderRecoveryHistory();
}

async function loadTodayRecovery() {
  const user = getUser();
  if (!user) return;
  
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await sb.from('recovery_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('logged_at', today)
    .maybeSingle();
  
  if (data) {
    document.getElementById('sleepHours').value = data.sleep_hours || '';
    document.getElementById('sleepQuality').value = data.sleep_quality || '';
    document.getElementById('energyLevel').value = data.energy || '';
    document.getElementById('sorenessLevel').value = data.soreness || '';
    document.getElementById('stressLevel').value = data.stress || '';
    document.getElementById('moodLevel').value = data.mood || '';
    
    const readiness = calcReadiness(data);
    showReadinessResult(readiness);
  }
}

export async function saveRecovery() {
  const user = getUser();
  if (!user) return;
  
  const data = {
    user_id: user.id,
    logged_at: new Date().toISOString().slice(0, 10),
    sleep_hours: +document.getElementById('sleepHours').value || null,
    sleep_quality: +document.getElementById('sleepQuality').value || null,
    energy: +document.getElementById('energyLevel').value || null,
    soreness: +document.getElementById('sorenessLevel').value || null,
    stress: +document.getElementById('stressLevel').value || null,
    mood: +document.getElementById('moodLevel').value || null
  };
  
  // Validate required fields
  if (!data.sleep_hours || !data.energy || !data.soreness || !data.stress) {
    toast('Lütfen tüm alanları doldurun', 'warning');
    return;
  }
  
  const { error } = await sb.from('recovery_logs').upsert(data, { onConflict: 'user_id,logged_at' });
  
  if (error) {
    toast('Kaydedilemedi: ' + error.message, 'error');
  } else {
    const readiness = calcReadiness(data);
    showReadinessResult(readiness);
    toast('Recovery kaydedildi!', 'success');
    renderRecoveryHistory();
  }
}

function calcReadiness(r) {
  if (!r) return null;
  
  const sleep = Math.min(10, Math.max(0, +r.sleep_hours || 0));
  const sleepQuality = Math.min(10, Math.max(1, +r.sleep_quality || 5));
  const energy = Math.min(10, Math.max(1, +r.energy || 5));
  const soreness = Math.min(10, Math.max(1, +r.soreness || 5));
  const stress = Math.min(10, Math.max(1, +r.stress || 5));
  const mood = Math.min(10, Math.max(1, +r.mood || 5));
  
  const score = (sleep / 10 * 2.5) + (sleepQuality / 10 * 1.5) + 
                (energy / 10 * 2.5) + (mood / 10 * 1) + 
                ((10 - soreness) / 10 * 1.5) + ((10 - stress) / 10 * 1);
  
  return Math.round(Math.max(0, Math.min(10, score)) * 10) / 10;
}

function showReadinessResult(score) {
  const container = document.getElementById('recoveryResult');
  let label, className, emoji;
  
  if (score >= 7) {
    label = 'Harika! Antrenman için hazırsın 🚀';
    className = 'readiness-high';
    emoji = '🟢';
  } else if (score >= 5) {
    label = 'Orta. Kontrollü antrenman yapabilirsin ⚖️';
    className = 'readiness-medium';
    emoji = '🟡';
  } else {
    label = 'Düşük. Dinlenmeye odaklan 🛡️';
    className = 'readiness-low';
    emoji = '🔴';
  }
  
  container.innerHTML = `
    <div class="readiness-badge ${className}">
      ${emoji} Hazırlık Skoru: ${score}/10 - ${label}
    </div>
  `;
  container.classList.remove('hidden');
}

async function renderRecoveryHistory() {
  const user = getUser();
  if (!user) return;
  
  const { data } = await sb.from('recovery_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })
    .limit(14);
  
  const container = document.getElementById('recoveryHistory');
  container.innerHTML = (data || []).map(r => {
    const score = calcReadiness(r);
    let badgeClass = score >= 7 ? 'readiness-high' : score >= 5 ? 'readiness-medium' : 'readiness-low';
    
    return `
      <div class="history-item">
        <div class="history-item-header">
          <span class="history-item-date">${formatDate(r.logged_at)}</span>
          <span class="readiness-badge ${badgeClass}" style="font-size:12px;padding:4px 10px">${score}/10</span>
        </div>
        <div class="history-item-details">
          <span>😴 ${r.sleep_hours || '-'}h (${r.sleep_quality || '-'})</span>
          <span>⚡ ${r.energy || '-'}</span>
          <span>😣 ${r.soreness || '-'}</span>
          <span>😰 ${r.stress || '-'}</span>
          <span>😊 ${r.mood || '-'}</span>
        </div>
      </div>
    `;
  }).join('') || '<div class="history-item" style="text-align:center;color:var(--text-muted)">Henüz recovery kaydı yok</div>';
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' });
}