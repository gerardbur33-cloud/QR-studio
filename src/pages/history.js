import { getHistory, getCollections, addCollection, deleteQrRecord, duplicateQrRecord } from '../services/storage-service.js';
import { confirmAction, showToast } from '../components/notifications.js';

export function renderHistory() {
  const records = getHistory();
  const collections = getCollections();

  return `
    <section class="page-header">
      <div>
        <p class="eyebrow">Historique</p>
        <h1>Mes QR codes</h1>
      </div>
      <button class="primary-btn" data-action="new-collection">Créer une collection</button>
    </section>

    <div class="panel history-toolbar">
      <input id="history-search" type="search" placeholder="Rechercher un QR code..." />
      <select id="history-filter-type">
        <option value="all">Tous les types</option>
        <option value="url">URL</option>
        <option value="text">Texte</option>
        <option value="wifi">Wi‑Fi</option>
        <option value="vcard">Carte de visite</option>
        <option value="email">Email</option>
        <option value="phone">Téléphone</option>
        <option value="sms">SMS</option>
        <option value="geo">Localisation</option>
        <option value="event">Événement</option>
      </select>
      <select id="history-sort">
        <option value="desc">Plus récents</option>
        <option value="asc">Plus anciens</option>
      </select>
    </div>

    <div class="collection-strip">
      ${collections.length ? collections.map((collection) => `
        <span class="collection-pill">${collection}</span>
      `).join('') : '<span class="muted">Aucune collection pour le moment.</span>'}
    </div>

    <div class="history-grid">
      ${records.length ? records.map((record) => `
        <article class="history-card panel">
          <div class="history-preview">
            <img src="${record.preview || 'data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 200\"><rect fill=\"#f3f4f6\" width=\"200\" height=\"200\"/><text x=\"50%\" y=\"50%\" dominant-baseline=\"middle\" text-anchor=\"middle\" font-size=\"18\" fill=\"#374151\">QR</text></svg>'}" alt="${record.name}" />
          </div>
          <div class="history-meta">
            <div>
              <h3>${record.name}</h3>
              <p>${record.type}</p>
            </div>
            <span>${new Date(record.createdAt).toLocaleDateString('fr-FR')}</span>
          </div>
          <div class="history-content">${record.content?.slice(0, 80) || '—'}</div>
          <div class="history-actions">
            <button data-action="edit-qr" data-id="${record.id}" class="secondary-btn">Modifier</button>
            <button data-action="duplicate-qr" data-id="${record.id}" class="secondary-btn">Dupliquer</button>
            <button data-action="delete-qr" data-id="${record.id}" class="danger-btn">Supprimer</button>
          </div>
        </article>
      `).join('') : '<div class="empty-state panel"><h3>Aucun QR enregistré</h3><p>Créez votre premier code pour le voir apparaître ici.</p><button class="primary-btn" data-action="nav" data-target="generator">Créer un QR</button></div>' }
    </div>
  `;
}

export function initHistory() {
  document.getElementById('history-search')?.addEventListener('input', () => {
    const list = document.querySelectorAll('.history-card');
    const term = document.getElementById('history-search').value.toLowerCase();
    list.forEach((card) => {
      const content = card.textContent.toLowerCase();
      card.style.display = content.includes(term) ? 'block' : 'none';
    });
  });

  document.getElementById('history-filter-type')?.addEventListener('change', () => {
    const type = document.getElementById('history-filter-type').value;
    const cards = document.querySelectorAll('.history-card');
    cards.forEach((card) => {
      const text = card.querySelector('p')?.textContent || '';
      card.style.display = type === 'all' || text === type ? 'block' : 'none';
    });
  });

  document.getElementById('history-sort')?.addEventListener('change', () => {
    const sort = document.getElementById('history-sort').value;
    const cards = [...document.querySelectorAll('.history-card')];
    const container = document.querySelector('.history-grid');
    cards.sort((a, b) => {
      const timeA = new Date(a.querySelector('span')?.textContent || 0).getTime();
      const timeB = new Date(b.querySelector('span')?.textContent || 0).getTime();
      return sort === 'asc' ? timeA - timeB : timeB - timeA;
    });
    cards.forEach((card) => container.appendChild(card));
  });

  document.querySelector('[data-action="new-collection"]')?.addEventListener('click', () => {
    const name = window.prompt('Nom de la collection :');
    if (!name) return;
    const added = addCollection(name.trim());
    if (added) {
      showToast('Collection créée.', 'success');
      window.location.reload();
    }
  });

  document.querySelectorAll('[data-action="edit-qr"]').forEach((button) => {
    button.addEventListener('click', () => {
      sessionStorage.setItem('qrstudio-edit-id', button.dataset.id);
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'generator' }));
    });
  });

  document.querySelectorAll('[data-action="duplicate-qr"]').forEach((button) => {
    button.addEventListener('click', () => {
      const duplicated = duplicateQrRecord(button.dataset.id);
      if (duplicated) {
        showToast('QR dupliqué.', 'success');
        window.location.reload();
      }
    });
  });

  document.querySelectorAll('[data-action="delete-qr"]').forEach((button) => {
    button.addEventListener('click', () => {
      confirmAction('Voulez-vous vraiment supprimer ce QR ?', () => {
        deleteQrRecord(button.dataset.id);
        showToast('QR supprimé.', 'success');
        window.location.reload();
      });
    });
  });
}
