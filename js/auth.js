// FitPro PWA - Auth Module
import { sb } from './config.js';
import { renderHome } from './home.js';
import { renderProfile, fillProfile, openProfileSetup } from './profile.js';
import { toast } from './config.js';

let user = null;
let profile = null;

export async function initAuth() {
  // Check existing session
  const { data: { session } } = await sb.auth.getSession();
  user = session?.user || null;
  
  if (user) {
    showApp();
    await loadUserData();
  } else {
    showAuth();
  }
  
  // Listen for auth changes
  sb.auth.onAuthStateChange(async (event, session) => {
    user = session?.user || null;
    if (user) {
      showApp();
      await loadUserData();
    } else {
      showAuth();
    }
  });
  
  // Bind form events
  bindAuthForms();
}

export function showAuth() {
  document.getElementById('authScreen').style.display = 'flex';
  document.getElementById('appScreen').style.display = 'none';
  document.getElementById('bottomNav').style.display = 'none';
  document.getElementById('logoutBtn').style.display = 'none';
}

export function showApp() {
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('appScreen').style.display = 'flex';
  document.getElementById('bottomNav').style.display = 'flex';
  document.getElementById('logoutBtn').style.display = 'flex';
}

export async function signOut() {
  await sb.auth.signOut();
  user = null;
  profile = null;
  localStorage.clear();
  location.reload();
}

function bindAuthForms() {
  // Tab switching
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const isLogin = tab.dataset.tab === 'login';
      document.getElementById('loginForm').style.display = isLogin ? 'flex' : 'none';
      document.getElementById('registerForm').style.display = isLogin ? 'none' : 'flex';
      document.getElementById('authMessage').textContent = '';
    });
  });
  
  // Login form
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    await handleSignIn(email, password);
  });
  
  // Register form
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regPasswordConfirm').value;
    
    if (password !== confirm) {
      showAuthMessage('Şifreler eşleşmiyor', 'error');
      return;
    }
    if (password.length < 6) {
      showAuthMessage('Şifre en az 6 karakter olmalı', 'error');
      return;
    }
    
    await handleSignUp(email, password);
  });
}

async function handleSignIn(email, password) {
  showAuthMessage('Giriş yapılıyor...', 'info');
  const { error } = await sb.auth.signInWithPassword({ email, password });
  
  if (error) {
    showAuthMessage(friendlyAuthError(error), 'error');
  } else {
    showAuthMessage('Giriş başarılı!', 'success');
  }
}

async function handleSignUp(email, password) {
  showAuthMessage('Hesap oluşturuluyor...', 'info');
  const { data, error } = await sb.auth.signUp({ email, password });
  
  if (error) {
    showAuthMessage(friendlyAuthError(error), 'error');
  } else if (data.session) {
    showAuthMessage('Kayıt ve giriş başarılı!', 'success');
  } else {
    showAuthMessage('Kayıt tamamlandı. E-posta doğrulama linkini kontrol edin.', 'info');
  }
}

function friendlyAuthError(error) {
  const msg = error.message;
  if (msg.includes('Invalid login credentials') || msg.includes('Email not confirmed')) {
    return 'E-posta veya şifre hatalı. E-posta doğrulaması gerekiyorsa gelen linke tıklayın.';
  }
  if (msg.includes('User already registered')) {
    return 'Bu e-posta zaten kayıtlı. Giriş yapmayı deneyin.';
  }
  if (msg.includes('Password should be at least')) {
    return 'Şifre çok zayıf. En az 6 karakter kullanın.';
  }
  return msg;
}

function showAuthMessage(message, type) {
  const el = document.getElementById('authMessage');
  el.textContent = message;
  el.className = 'auth-message ' + type;
}

async function loadUserData() {
  try {
    // Load profile
    const { data, error } = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (error) throw error;
    
    profile = data;
    
    if (!profile || !profile.full_name) {
      // First time user - open profile setup
      openProfileSetup();
      return;
    }
    
    // Load all views
    renderHome();
    renderProfile();
    fillProfile();
    
  } catch (err) {
    console.error('Load user data error:', err);
    toast('Profil yüklenemedi: ' + err.message, 'error');
  }
}

export function getUser() { return user; }
export function getProfile() { return profile; }
export function setProfile(p) { profile = p; }