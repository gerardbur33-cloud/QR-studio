import { renderDashboard } from './dashboard.js';
import { renderGenerator, initGenerator } from './generator.js';
import { renderHistory, initHistory } from './history.js';
import { renderBulkGenerator, initBulkGenerator } from './bulk-generator.js';
import { renderSettings, initSettings } from './settings.js';
import { getTheme, setTheme, ensureDemoData } from '../services/storage-service.js';
import { showToast } from '../components/notifications.js';

const pageBuilders = {
  dashboard: renderDashboard,
  generator: renderGenerator,
  history: renderHistory,
  bulk: renderBulkGenerator,
  settings: renderSettings,
};

const pageInitializers = {
  dashboard: () => {},
  generator: initGenerator,
  history: initHistory,
  bulk: initBulkGenerator,
  settings: initSettings,
};

function renderShell() {
  const app = document.querySelector('#app');
  if (!app) return;
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark">Q</div>
          <div>
            <strong>QR Studio</strong>
            <small>Professional Suite</small>
          </div>
        </div>

        <nav class="side-nav">
          <button class="nav-item active" data-nav="dashboard">Tableau de bord</button>
          <button class="nav-item" data-nav="generator">Créer</button>
          <button class="nav-item" data-nav="history">Historique</button>
          <button class="nav-item" data-nav="bulk">Génération en masse</button>
          <button class="nav-item" data-nav="settings">Paramètres</button>
        </nav>
      </aside>

      <div class="main-panel">
        <header class="topbar">
          <div>
            <p class="eyebrow">Logiciel professionnel</p>
            <h2>QR Studio</h2>
          </div>
          <div class="topbar-actions">
            <button class="secondary-btn" data-action="theme-toggle">Changer le thème</button>
          </div>
        </header>

        <main id="page-root"></main>
      </div>
    </div>
    <div id="toast-container"></div>
  `;
}

function renderPage(name) {
  const root = document.querySelector('#page-root');
  const builder = pageBuilders[name] || renderDashboard;
  root.innerHTML = builder();
  const init = pageInitializers[name] || (() => {});
  init();

  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.nav === name);
  });
}

function switchPage(name) {
  localStorage.setItem('qrstudio_last_page', name);
  renderPage(name);
}

document.addEventListener('click', (event) => {
  const navTarget = event.target.closest('[data-nav]');
  if (navTarget) {
    switchPage(navTarget.dataset.nav);
    return;
  }

  const actionTarget = event.target.closest('[data-action]');
  if (!actionTarget) return;

  const { action, target, theme } = actionTarget.dataset;
  if (action === 'nav') switchPage(target);
  if (action === 'theme-toggle') {
    const current = getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
    showToast(`Thème ${next === 'dark' ? 'sombre' : 'clair'} activé.`, 'success');
  }
});

window.addEventListener('navigate', (event) => {
  switchPage(event.detail);
});

function initApp() {
  renderShell();
  ensureDemoData();
  setTheme(getTheme());
  switchPage(localStorage.getItem('qrstudio_last_page') || 'dashboard');
}

initApp();
