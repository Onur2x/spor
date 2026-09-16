// FitPro PWA - Navigation Module

export function initNavigation() {
  // Bottom nav click handlers
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.view));
  });
}

export function navigateTo(view) {
  // Update views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${view}`)?.classList.add('active');
  
  // Update nav
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  
  // Scroll to top
  window.scrollTo(0, 0);
  
  // View-specific initialization
  switch (view) {
    case 'home':
      import('./home.js').then(m => m.renderHome());
      break;
    case 'exercises':
      import('./exercises.js').then(m => m.renderExercises());
      break;
    case 'nutrition':
      import('./nutrition.js').then(m => m.renderNutrition());
      break;
    case 'progress':
      import('./progress.js').then(m => m.renderProgress());
      break;
    case 'recovery':
      import('./recovery.js').then(m => m.renderRecovery());
      break;
    case 'coach':
      import('./coach.js').then(m => m.renderCoach());
      break;
    case 'profile':
      import('./profile.js').then(m => m.renderProfile());
      break;
  }
}

// Make globally available for inline onclick
window.navigateTo = navigateTo;