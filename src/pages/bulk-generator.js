import JSZip from 'jszip';
import { generateQrCanvas, generateQrSvg } from '../services/qr-service.js';
import { downloadBulkZip, downloadPng } from '../services/export-service.js';
import { showToast } from '../components/notifications.js';

export function renderBulkGenerator() {
  return `
    <section class="page-header">
      <div>
        <p class="eyebrow">Génération en masse</p>
        <h1>Créer plusieurs QR codes</h1>
      </div>
      <button class="primary-btn" data-action="generate-bulk">Générer</button>
    </section>

    <div class="bulk-layout">
      <div class="panel bulk-input">
        <div class="field-group">
          <label>Liens ou URLs</label>
          <textarea id="bulk-list" rows="14" placeholder="https://site1.fr\nhttps://site2.fr\nhttps://site3.fr"></textarea>
        </div>
        <div class="actions-inline">
          <label class="secondary-btn file-label">
            Importer .csv
            <input id="bulk-csv" type="file" accept=".csv,text/csv" hidden>
          </label>
        </div>
      </div>
      <div class="panel bulk-gallery" id="bulk-gallery"></div>
    </div>
  `;
}

export function initBulkGenerator() {
  const gallery = document.getElementById('bulk-gallery');
  const textarea = document.getElementById('bulk-list');
  const csvInput = document.getElementById('bulk-csv');

  csvInput?.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      textarea.value = `${textarea.value}\n${content}`.trim();
      showToast('CSV importé.', 'success');
    };
    reader.readAsText(file);
  });

  document.querySelector('[data-action="generate-bulk"]')?.addEventListener('click', async () => {
    const lines = (textarea.value || '').split(/\r?\n|,/).map((entry) => entry.trim()).filter(Boolean);
    if (!lines.length) {
      showToast('Ajoutez au moins une URL valide.', 'error');
      return;
    }

    gallery.innerHTML = '';
    const items = [];

    for (const [index, line] of lines.entries()) {
      try {
        const url = line.startsWith('http') ? line : `https://${line}`;
        const canvas = document.createElement('canvas');
        const svg = await generateQrSvg(url, { size: 220, margin: 1, errorCorrectionLevel: 'M' });
        const pngUrl = await (async () => {
          await (async () => {})();
          const qrCanvas = document.createElement('canvas');
          await (await import('../services/qr-service.js')).generateQrCanvas({
            canvas: qrCanvas,
            payload: url,
            options: { size: 220, margin: 1, errorCorrectionLevel: 'M' },
          });
          return qrCanvas.toDataURL('image/png');
        })();

        const card = document.createElement('article');
        card.className = 'bulk-card panel';
        card.innerHTML = `
          <div class="bulk-card-preview"><img src="${pngUrl}" alt="QR ${index + 1}" /></div>
          <div class="bulk-card-meta">
            <strong>${(line || 'QR').slice(0, 20)}</strong>
            <span>${index + 1}</span>
          </div>
          <div class="bulk-actions">
            <button class="secondary-btn" data-download="png" data-url="${encodeURIComponent(pngUrl)}" data-name="qr-${index + 1}">PNG</button>
            <button class="secondary-btn" data-download="svg" data-svg="${encodeURIComponent(svg)}" data-name="qr-${index + 1}">SVG</button>
          </div>
        `;
        gallery.appendChild(card);
        items.push({ name: `qr-${index + 1}`, svgContent: svg, pngUrl });
      } catch (error) {
        const invalid = document.createElement('div');
        invalid.className = 'bulk-invalid';
        invalid.textContent = `Ligne invalide : ${line}`;
        gallery.appendChild(invalid);
      }
    }

    gallery.insertAdjacentHTML('beforeend', `<div class="bulk-download"><button class="primary-btn" id="bulk-zip">Télécharger l’archive ZIP</button></div>`);

    document.getElementById('bulk-zip')?.addEventListener('click', async () => {
      await downloadBulkZip(items);
      showToast('Archive ZIP créée.', 'success');
    });

    gallery.querySelectorAll('[data-download]').forEach((button) => {
      button.addEventListener('click', async () => {
        const name = button.dataset.name;
        const svg = decodeURIComponent(button.dataset.svg || '');
        const pngUrl = decodeURIComponent(button.dataset.url || '');
        if (button.dataset.download === 'png') {
          await downloadPng(pngUrl, name);
        }
        if (button.dataset.download === 'svg') {
          const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `${name}.svg`;
          anchor.click();
          URL.revokeObjectURL(url);
        }
      });
    });

    showToast(`${items.length} QR générés avec succès.`, 'success');
  });
}
