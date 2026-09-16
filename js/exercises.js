// FitPro PWA - Exercises Library View
import { EXERCISES, searchExercises, filterExercisesByMuscle, MUSCLE_GROUPS } from './exercises-data.js';
import { esc } from './config.js';

let currentFilter = 'all';
let searchQuery = '';

export function renderExercises() {
  renderFilterChips();
  renderExercisesList();
  
  // Search input
  document.getElementById('exerciseSearch').addEventListener('input', debounce((e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderExercisesList();
  }, 200));
}

function renderFilterChips() {
  const container = document.querySelector('.filter-chips');
  container.innerHTML = `
    <button class="filter-chip active" data-filter="all">Tümü</button>
    ${MUSCLE_GROUPS.map(mg => `
      <button class="filter-chip" data-filter="${mg.key}">${mg.label}</button>
    `).join('')}
  `;
  
  container.querySelectorAll('.filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderExercisesList();
    });
  });
}

function renderExercisesList() {
  let exercises = EXERCISES;
  
  if (currentFilter !== 'all') {
    exercises = filterExercisesByMuscle(currentFilter);
  }
  
  if (searchQuery) {
    exercises = searchExercises(searchQuery);
  }
  
  const container = document.getElementById('exercisesList');
  container.innerHTML = exercises.map(ex => `
    <article class="exercise-item" onclick="openExerciseModal('${ex.id}')">
      <img class="exercise-gif" src="${ex.gifUrl}" alt="${esc(ex.nameTr)}" loading="lazy"
           onerror="this.src='https://via.placeholder.com/320x240/101b2d/22c55e?text=${encodeURIComponent(ex.nameTr)}'">
      <div class="exercise-item-content">
        <div class="exercise-item-name">${esc(ex.nameTr)}</div>
        <div class="exercise-item-meta">
          <span>${esc(ex.muscleTr)}</span>
          <span>${ex.equipment}</span>
          <span>${ex.sets}×${ex.minReps}-${ex.maxReps}</span>
        </div>
      </div>
    </article>
  `).join('');
}

export function openExerciseModal(exerciseId) {
  const ex = EXERCISES.find(e => e.id === exerciseId);
  if (!ex) return;
  
  const modal = document.getElementById('exerciseModal');
  const body = document.getElementById('modalBody');
  
  body.innerHTML = `
    <div class="modal-exercise-header">
      <img class="modal-gif" src="${ex.gifUrl}" alt="${esc(ex.nameTr)}"
           onerror="this.src='https://via.placeholder.com/320x240/101b2d/22c55e?text=${encodeURIComponent(ex.nameTr)}'">
      <div class="modal-exercise-info">
        <h2 class="modal-exercise-name">${esc(ex.nameTr)}</h2>
        <div class="modal-exercise-meta">
          <span>${esc(ex.muscleTr)}</span>
          <span>${ex.equipment}</span>
          <span>${ex.pattern}</span>
          <span>${ex.sets} set × ${ex.minReps}-${ex.maxReps} tek</span>
          <span>${ex.restSec}s dinlenme</span>
          <span>Zorluk: ${'⭐'.repeat(ex.difficulty)}</span>
        </div>
      </div>
    </div>
    
    <div class="modal-section">
      <div class="modal-section-title">Nasıl Yapılır</div>
      <p class="modal-instructions">${esc(ex.instructionsTr)}</p>
    </div>
    
    <div class="modal-section">
      <div class="modal-section-title">İpucu</div>
      <p class="modal-tips">${esc(ex.tipsTr)}</p>
    </div>
  `;
  
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

export function closeExerciseModal() {
  document.getElementById('exerciseModal').classList.add('hidden');
  document.body.style.overflow = '';
}

// Close modal on backdrop click
document.getElementById('exerciseModal').addEventListener('click', (e) => {
  if (e.target.id === 'exerciseModal') closeExerciseModal();
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeExerciseModal();
});

function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}