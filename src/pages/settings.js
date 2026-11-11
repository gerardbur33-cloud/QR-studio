import { getHistory, deleteQrRecord, duplicateQrRecord, addCollection, getCollections } from '../services/storage-service.js';
import { showToast } from '../components/notifications.js';

export function renderSettings() {
  const collections = getCollections();
  return `
    <section class="page-header">
      <div>
        <p class="eyebrow">Paramètres</p>
        <h1>Personnalisation globale</h1>
      </div>
    </section>

    <div class="settings-grid">
      <div class="panel">
        <h3>Thème</h3>
        <div class="actions-inline">
          <button class="secondary-btn" data-theme="light">Clair</button>
          <button class="secondary-btn" data-theme="dark">Sombre</button>
        </div>
      </div>

      <div class="panel">
        <h3>Collections</h3>
        <div class="collection-list">
          ${collections.length ? collections.map((collection) => `<span class="collection-pill">${collection}</span>`).join('') : '<p class="muted">Aucune collection enregistrée.</p>'}
        </div>
      </div>

      <div class="panel">
        <h3>Historique</h3>
        <p>${getHistory().length} QR enregistrés</p>
        <button class="danger-btn" data-action="clear-history">Vider l'historique</button>
      </div>
    </div>
  `;
}

export function initSettings() {
  document.querySelectorAll('[data-theme]').forEach((button) => {
    button.addEventListener('click', () => {
      const theme = button.dataset.theme;
      localStorage.setItem('qrstudio_theme', theme);
      document.body.classList.toggle('dark', theme === 'dark');
      showToast(`Thème ${theme === 'dark' ? 'sombre' : 'clair'} activé.`, 'success');
    });
  });

  document.querySelector('[data-action="clear-history"]')?.addEventListener('click', () => {
    localStorage.removeItem('qrstudio_history');
    showToast('Historique vidé.', 'success');
    window.location.reload();
  });
}
