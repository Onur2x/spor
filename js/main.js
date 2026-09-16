// FitPro PWA - Main Entry Point
import { sb } from './config.js';
import { initAuth, showAuth, showApp, signOut } from './auth.js';
import { renderHome, startWorkout } from './home.js';
import { renderExercises, openExerciseModal, closeExerciseModal } from './exercises.js';
import { renderNutrition, previewFood, analyzeFood, saveNutrition, addWater, loadFoodHistory } from './nutrition.js';
import { renderProgress, saveMeasurements } from './progress.js';
import { renderRecovery, saveRecovery } from './recovery.js';
import { renderCoach, askAI } from './coach.js';
import { renderProfile, saveProfile, fillProfile, openProfileSetup, syncDayChecks } from './profile.js';
import { navigateTo, initNavigation } from './navigation.js';
import { initTheme, toggleTheme } from './theme.js';
import { toast } from './config.js';

// Global functions for inline onclick handlers
window.navigateTo = navigateTo;
window.startWorkout = startWorkout;
window.finishWorkout = finishWorkout;
window.completeSet = completeSet;
window.startRest = startRest;
window.openExerciseModal = openExerciseModal;
window.closeExerciseModal = closeExerciseModal;
window.previewFood = previewFood;
window.analyzeFood = analyzeFood;
window.saveNutrition = saveNutrition;
window.addWater = addWater;
window.saveMeasurements = saveMeasurements;
window.saveRecovery = saveRecovery;
window.askAI = askAI;
window.saveProfile = saveProfile;
window.syncDayChecks = syncDayChecks;
window.toggleTheme = toggleTheme;
window.signOut = signOut;
window.closeRestModal = closeRestModal;
window.skipRest = skipRest;

// State
let currentWorkout = null;
let restTimer = null;
let restEndTime = 0;
let restExerciseName = '';

// Initialize app
async function init() {
  initTheme();
  initNavigation();
  await initAuth();
  
  // Check for PWA install prompt
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Could show custom install button here
  });
  
  // Register service worker update listener
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    registration.addEventListener('updatefound', () => {
      toast('Yeni sürüm hazır. Sayfayı yenileyin.', 'info', 5000);
    });
  }
}

document.addEventListener('DOMContentLoaded', init);

// ============================================
// WORKOUT FUNCTIONS (used globally)
// ============================================

async function finishWorkout() {
  const sets = document.querySelectorAll('.active-set-row .btn-done.completed');
  if (!sets.length) {
    toast('En az bir seti tamamlayın', 'warning');
    return;
  }
  
  const workoutData = {
    user_id: (await sb.auth.getUser()).data.user.id,
    workout_date: new Date().toISOString().slice(0, 10),
    name: document.getElementById('activeWorkoutName').textContent,
    split_name: currentWorkout?.splitName,
    status: 'completed',
    completed_at: new Date().toISOString(),
    duration_seconds: Math.floor((Date.now() - currentWorkout.startTime) / 1000)
  };
  
  const { data: workout, error } = await sb.from('workouts').insert(workoutData).select().single();
  if (error) { toast('Antrenman kaydedilemedi: ' + error.message, 'error'); return; }
  
  const setRows = document.querySelectorAll('.active-set-row');
  const setData = [];
  let setNum = 1;
  
  setRows.forEach(row => {
    const doneBtn = row.querySelector('.btn-done');
    if (doneBtn?.classList.contains('completed')) {
      const exerciseId = row.dataset.exerciseId;
      const weight = parseFloat(row.querySelector('.set-weight')?.value) || 0;
      const reps = parseInt(row.querySelector('.set-reps')?.value) || 0;
      const rir = parseInt(row.querySelector('.set-rir')?.value) || 0;
      
      if (reps > 0) {
        setData.push({
          workout_id: workout.id,
          user_id: workoutData.user_id,
          exercise_id: exerciseId,
          set_number: setNum++,
          weight_kg: weight,
          reps: reps,
          rir: rir,
          completed: true
        });
      }
    }
  });
  
  if (!setData.length) { toast('Geçerli set bulunamadı', 'warning'); return; }
  
  const { error: setError } = await sb.from('workout_sets').insert(setData);
  if (setError) { toast('Setler kaydedilemedi: ' + setError.message, 'error'); return; }
  
  // Update PRs
  for (const s of setData) {
    const e1rm = s.weight_kg * (1 + s.reps / 30);
    const { data: old } = await sb.from('personal_records')
      .select('value').eq('user_id', workoutData.user_id)
      .eq('exercise_id', s.exercise_id).eq('record_type', 'e1rm').maybeSingle();
    
    if (!old || e1rm > +old.value) {
      await sb.from('personal_records').upsert({
        user_id: workoutData.user_id,
        exercise_id: s.exercise_id,
        record_type: 'e1rm',
        value: e1rm,
        achieved_at: new Date().toISOString()
      }, { onConflict: 'user_id,exercise_id,record_type' });
    }
  }
  
  // Update exercise progress
  for (const s of setData) {
    await sb.from('exercise_progress').upsert({
      user_id: workoutData.user_id,
      exercise_id: s.exercise_id,
      current_weight_kg: s.weight_kg,
      current_reps: s.reps,
      current_sets: (await sb.from('workout_sets').select('set_number').eq('workout_id', workout.id).eq('exercise_id', s.exercise_id)).data?.length || 1,
      current_rir: s.rir,
      last_updated: new Date().toISOString()
    }, { onConflict: 'user_id,exercise_id' });
  }
  
  if (window.confetti) confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
  toast('Antrenman kaydedildi! 💪', 'success');
  
  currentWorkout = null;
  navigateTo('home');
  renderHome();
  renderProgress();
}

function completeSet(btn) {
  btn.classList.toggle('completed');
  const row = btn.closest('.active-set-row');
  const inputs = row.querySelectorAll('input');
  inputs.forEach(input => input.disabled = btn.classList.contains('completed'));
  
  // Auto-start rest timer for non-last sets
  const exerciseCard = row.closest('.active-exercise');
  const allSets = exerciseCard.querySelectorAll('.active-set-row');
  const currentIndex = Array.from(allSets).indexOf(row);
  const isLastSet = currentIndex === allSets.length - 1;
  
  if (!isLastSet && btn.classList.contains('completed')) {
    const restSec = parseInt(exerciseCard.dataset.restSec) || 90;
    startRest(restSec, exerciseCard.dataset.exerciseName);
  }
}

function startRest(seconds, exerciseName) {
  restEndTime = Date.now() + seconds * 1000;
  restExerciseName = exerciseName;
  
  const modal = document.getElementById('restModal');
  const timerText = document.getElementById('timerTextLarge');
  const circle = document.getElementById('timerCircleLarge');
  const exerciseNameEl = document.getElementById('restExerciseName');
  
  exerciseNameEl.textContent = `${exerciseName} - Dinlenme`;
  modal.classList.remove('hidden');
  
  const circumference = 2 * Math.PI * 90;
  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = 0;
  
  restTimer = setInterval(() => {
    const left = Math.max(0, Math.ceil((restEndTime - Date.now()) / 1000));
    const mins = Math.floor(left / 60);
    const secs = left % 60;
    timerText.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    
    const progress = left / seconds;
    circle.style.strokeDashoffset = circumference * (1 - progress);
    
    if (left <= 0) {
      clearInterval(restTimer);
      closeRestModal();
      toast(`${exerciseName} - Dinlenme bitti!`, 'info');
    }
  }, 250);
}

function closeRestModal() {
  document.getElementById('restModal').classList.add('hidden');
  if (restTimer) { clearInterval(restTimer); restTimer = null; }
}

function skipRest() {
  closeRestModal();
  toast('Dinlenme atlandı', 'info');
}

// PWA install handler
window.addEventListener('appinstalled', () => {
  toast('Uygulama yüklendi! 🎉', 'success');
});