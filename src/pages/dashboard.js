import { getStats, getRecentRecords } from '../services/storage-service.js';

export function renderDashboard() {
  const stats = getStats();
  const recent = getRecentRecords(4);

  return `
    <section class="page-header">
      <div>
        <p class="eyebrow">Bienvenue</p>
        <h1>Créez, personnalisez et exportez des QR codes</h1>
      </div>
      <button class="primary-btn" data-action="nav" data-target="generator">Créer un QR Code</button>
    </section>

    <div class="stats-grid">
      <div class="stat-card panel">
        <span class="label">Total</span>
        <strong>${stats.total}</strong>
        <small>QR codes créés</small>
      </div>
      <div class="stat-card panel">
        <span class="label">Enregistrés</span>
        <strong>${stats.saved}</strong>
        <small>dans l’historique</small>
      </div>
      <div class="stat-card panel">
        <span class="label">Dernières créations</span>
        <strong>${recent.length}</strong>
        <small>aujourd’hui</small>
      </div>
      <div class="stat-card panel">
        <span class="label">Collection</span>
        <strong>3</strong>
        <small>modèles actifs</small>
      </div>
    </div>

    <div class="dashboard-panels">
      <div class="panel">
        <h3>Dernières créations</h3>
        <div class="recent-list">
          ${recent.length ? recent.map((item) => `
            <div class="recent-item">
              <div>
                <strong>${item.name}</strong>
                <span>${item.type}</span>
              </div>
              <time>${new Date(item.createdAt).toLocaleDateString('fr-FR')}</time>
            </div>
          `).join('') : '<p class="muted">Aucune création pour le moment.</p>'}
        </div>
      </div>

      <div class="panel quick-actions-panel">
        <h3>Accès rapide</h3>
        <div class="quick-actions">
          <button class="quick-action" data-action="nav" data-target="generator">Créer un QR</button>
          <button class="quick-action" data-action="nav" data-target="history">Historique</button>
          <button class="quick-action" data-action="nav" data-target="bulk">Import CSV</button>
          <button class="quick-action" data-action="nav" data-target="settings">Paramètres</button>
        </div>
      </div>
    </div>

    <div class="panel features-panel">
      <h3>Fonctionnalités principales</h3>
      <div class="feature-grid">
        <article>
          <h4>Génération multi-type</h4>
          <p>URL, Wi‑Fi, e-mail, SMS, carte de visite, emplacement et événement.</p>
        </article>
        <article>
          <h4>Personnalisation</h4>
          <p>Couleurs, marge, correction, logo et aperçu instantané.</p>
        </article>
        <article>
          <h4>Export</h4>
          <p>PNG, SVG, résolution personnalisable et nom de fichier libre.</p>
        </article>
        <article>
          <h4>Historique</h4>
          <p>Recherche, filtres, doublons, édition et collections.</p>
        </article>
      </div>
    </div>
  `;
}
