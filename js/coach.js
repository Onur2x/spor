// FitPro PWA - AI Coach Module
import { sb } from './config.js';
import { getUser, getProfile } from './auth.js';
import { toast } from './config.js';

export function renderCoach() {
  // Coach view is mostly static, just ensure answer area is cleared
  document.getElementById('aiAnswer').textContent = 'Henüz soru sorulmadı.';
  document.getElementById('aiQuestion').value = '';
}

export async function askAI(presetQuestion) {
  const user = getUser();
  const profile = getProfile();
  
  if (!user || !profile) {
    toast('Önce giriş yapın ve profil oluşturun', 'warning');
    return;
  }
  
  const question = presetQuestion || document.getElementById('aiQuestion').value.trim();
  if (!question) {
    toast('Bir soru yazın', 'warning');
    return;
  }
  
  const answerEl = document.getElementById('aiAnswer');
  answerEl.textContent = 'AI Coach düşünüyor...';
  
  try {
    const { data: { session } } = await sb.auth.getSession();
    
    // Get recent data for context
    const [recovery, workouts, nutrition, measurements] = await Promise.all([
      sb.from('recovery_logs').select('*').eq('user_id', user.id).order('logged_at', { ascending: false }).limit(7),
      sb.from('workouts').select('id, workout_date, name').eq('user_id', user.id).order('workout_date', { ascending: false }).limit(10),
      sb.from('nutrition_logs').select('*').eq('user_id', user.id).order('logged_at', { ascending: false }).limit(7),
      sb.from('body_measurements').select('*').eq('user_id', user.id).order('measured_at', { ascending: false }).limit(1)
    ]);
    
    const readiness = calcReadiness(recovery.data?.[0]);
    
    const res = await fetch(`${sb.supabaseUrl}/functions/v1/fitpro-coach`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        question,
        profile,
        plan: buildPlan(profile),
        recovery: recovery.data?.[0] || null,
        performance: {
          readiness,
          recentWorkouts: workouts.data || [],
          recentNutrition: nutrition.data || [],
          latestMeasurements: measurements.data?.[0] || null
        }
      })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'AI servisi hatası');
    
    answerEl.textContent = data.answer || 'Yanıt alınamadı.';
    
  } catch (err) {
    console.error('AI Coach error:', err);
    answerEl.textContent = 'Bağlantı hatası: ' + err.message;
    toast('AI Coach\'a ulaşılamadı', 'error');
  }
}

function calcReadiness(recovery) {
  if (!recovery) return null;
  
  const sleep = Math.min(10, Math.max(0, +recovery.sleep_hours || 0));
  const sleepQuality = Math.min(10, Math.max(1, +recovery.sleep_quality || 5));
  const energy = Math.min(10, Math.max(1, +recovery.energy || 5));
  const soreness = Math.min(10, Math.max(1, +recovery.soreness || 5));
  const stress = Math.min(10, Math.max(1, +recovery.stress || 5));
  const mood = Math.min(10, Math.max(1, +recovery.mood || 5));
  
  const score = (sleep / 10 * 2.5) + (sleepQuality / 10 * 1.5) + 
                (energy / 10 * 2.5) + (mood / 10 * 1) + 
                ((10 - soreness) / 10 * 1.5) + ((10 - stress) / 10 * 1);
  
  return Math.round(Math.max(0, Math.min(10, score)) * 10) / 10;
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