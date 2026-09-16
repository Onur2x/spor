// FitPro PWA - Supabase Configuration
// Replace with your Supabase project URL and anon key

export const SUPABASE_URL = 'https://avqkhjspoytglbnpcgmc.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_1huPeOVVLmePoXo5CIfggQ_HPFakepo';

// Create Supabase client
import { createClient } from '@supabase/supabase-js';

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Helper for localStorage with user prefix
export const storageKey = (key) => `fitpro:${sb.auth.getSession().then(r => r.data.session?.user?.id || 'local')}:${key}`;

export function lsSet(key, value) {
  try {
    localStorage.setItem(storageKey(key), JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage write failed:', e);
  }
}

export function lsGet(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(storageKey(key));
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

// Escape HTML
export function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, m => ({
    '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#039;'
  }[m]));
}

// Today date string
export const today = () => new Date().toISOString().slice(0, 10);

// Day of week (0=Monday, 6=Sunday)
export const dow = () => (new Date().getDay() + 6) % 7;

// Format number with Turkish locale
export function fmtNum(n) {
  return Number(n).toLocaleString('tr-TR');
}

// Debounce function
export function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Show toast notification
export function toast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer') || createToastContainer();
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = message;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, duration);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toastContainer';
  container.style.cssText = `
    position: fixed;
    bottom: 90px;
    left: 16px;
    right: 16px;
    z-index: 300;
    display: flex;
    flex-direction: column;
    gap: 8px;
    pointer-events: none;
  `;
  document.body.appendChild(container);
  return container;
}

// Add toast styles dynamically
const toastStyles = `
  .toast {
    padding: 12px 16px;
    border-radius: 12px;
    background: var(--panel);
    border: 1px solid var(--panel-border);
    color: var(--text);
    font-weight: 600;
    font-size: 14px;
    transform: translateY(100px);
    opacity: 0;
    transition: all 0.3s ease;
    pointer-events: auto;
  }
  .toast.show { transform: translateY(0); opacity: 1; }
  .toast-success { border-color: var(--primary); background: var(--primary-light); }
  .toast-error { border-color: var(--danger); background: var(--danger-bg); color: var(--danger); }
  .toast-warning { border-color: var(--warning); background: color-mix(in srgb, var(--warning) 15%, transparent); }
`;
const styleSheet = document.createElement('style');
styleSheet.textContent = toastStyles;
document.head.appendChild(styleSheet);