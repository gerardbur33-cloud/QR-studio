import { createQrRecord, generateQrCanvas, generateQrSvg } from '../services/qr-service.js';
import { addQrRecord, getHistory, getCollections, addCollection } from '../services/storage-service.js';
import { showToast } from '../components/notifications.js';
import { downloadPng, downloadSvg } from '../services/export-service.js';
import { validateEmail, validatePhone, validateUrl } from '../utils/validators.js';

const formTemplates = {
  url: `
    <div class="field-group">
      <label>URL du site</label>
      <input name="url" type="url" placeholder="https://example.com" required>
    </div>
  `,
  text: `
    <div class="field-group">
      <label>Texte libre</label>
      <textarea name="text" rows="4" placeholder="Votre message ou contenu..."></textarea>
    </div>
  `,
  wifi: `
    <div class="field-group">
      <label>Nom du réseau (SSID)</label>
      <input name="ssid" type="text" placeholder="Maison WiFi" required>
    </div>
    <div class="field-group">
      <label>Mot de passe</label>
      <input name="password" type="text" placeholder="••••••••" required>
    </div>
    <div class="field-group">
      <label>Type de sécurité</label>
      <select name="security">
        <option value="WPA">WPA/WPA2</option>
        <option value="WEP">WEP</option>
        <option value="nopass">Aucun</option>
      </select>
    </div>
    <div class="field-group checkbox-field">
      <label><input type="checkbox" name="hidden" value="true"> Réseau masqué</label>
    </div>
  `,
  vcard: `
    <div class="field-group">
      <label>Nom complet</label>
      <input name="name" type="text" placeholder="Dupont Martin" required>
    </div>
    <div class="field-group">
      <label>Entreprise</label>
      <input name="company" type="text" placeholder="QR Studio Consulting">
    </div>
    <div class="field-group">
      <label>Email</label>
      <input name="email" type="email" placeholder="contact@exemple.com">
    </div>
    <div class="field-group">
      <label>Téléphone</label>
      <input name="phone" type="tel" placeholder="+33 6 12 34 56 78">
    </div>
    <div class="field-group">
      <label>Site web</label>
      <input name="website" type="url" placeholder="https://votre-site.fr">
    </div>
  `,
  email: `
    <div class="field-group">
      <label>Email</label>
      <input name="email" type="email" placeholder="bonjour@exemple.com" required>
    </div>
    <div class="field-group">
      <label>Objet</label>
      <input name="subject" type="text" placeholder="Demande de devis">
    </div>
  `,
  phone: `
    <div class="field-group">
      <label>Numéro de téléphone</label>
      <input name="phone" type="tel" placeholder="+33 6 12 34 56 78" required>
    </div>
  `,
  sms: `
    <div class="field-group">
      <label>Numéro de téléphone</label>
      <input name="phone" type="tel" placeholder="+33 6 12 34 56 78" required>
    </div>
    <div class="field-group">
      <label>Message</label>
      <textarea name="message" rows="3" placeholder="Votre message prérempli..."></textarea>
    </div>
  `,
  geo: `
    <div class="field-group">
      <label>Latitude</label>
      <input name="latitude" type="number" step="0.000001" placeholder="48.8566" required>
    </div>
    <div class="field-group">
      <label>Longitude</label>
      <input name="longitude" type="number" step="0.000001" placeholder="2.3522" required>
    </div>
  `,
  event: `
    <div class="field-group">
      <label>Nom de l'événement</label>
      <input name="title" type="text" placeholder="Conférence 2026" required>
    </div>
    <div class="field-group">
      <label>Date</label>
      <input name="startDate" type="date" required>
    </div>
    <div class="field-group">
      <label>Lieu</label>
      <input name="location" type="text" placeholder="Paris, France" required>
    </div>
  `,
};

const presetTemplates = [
  { key: 'professional', name: 'QR professionnel', options: { foreground: '#1f2937', background: '#f8fafc', errorCorrectionLevel: 'Q', margin: 2 } },
  { key: 'minimal', name: 'QR minimaliste', options: { foreground: '#111827', background: '#ffffff', errorCorrectionLevel: 'M', margin: 1 } },
  { key: 'colorful', name: 'QR coloré', options: { foreground: '#7c3aed', background: '#fef3c7', errorCorrectionLevel: 'Q', margin: 2 } },
  { key: 'restaurant', name: 'QR restaurant', options: { foreground: '#dc2626', background: '#fff7ed', errorCorrectionLevel: 'H', margin: 2 } },
  { key: 'vcard', name: 'QR carte de visite', options: { foreground: '#0f172a', background: '#eff6ff', errorCorrectionLevel: 'Q', margin: 2 } },
  { key: 'wifi', name: 'QR Wi‑Fi', options: { foreground: '#0f766e', background: '#ecfeff', errorCorrectionLevel: 'M', margin: 2 } },
  { key: 'event', name: 'QR événement', options: { foreground: '#b45309', background: '#fefce8', errorCorrectionLevel: 'H', margin: 2 } },
];

export function renderGenerator() {
  return `
    <section class="page-header">
      <div>
        <p class="eyebrow">Création</p>
        <h1>Créer un QR code</h1>
      </div>
      <button class="primary-btn" data-action="save-qr">Enregistrer</button>
    </section>

    <div class="generator-layout">
      <div class="panel form-panel">
        <div class="field-group">
          <label>Type de QR</label>
          <select id="qr-type">
            <option value="url">URL / Site Internet</option>
            <option value="text">Texte libre</option>
            <option value="wifi">Réseau Wi‑Fi</option>
            <option value="vcard">Carte de visite</option>
            <option value="email">Adresse e-mail</option>
            <option value="phone">Numéro de téléphone</option>
            <option value="sms">SMS</option>
            <option value="geo">Localisation</option>
            <option value="event">Événement</option>
          </select>
        </div>

        <div id="qr-form-fields"></div>

        <div class="template-grid">
          ${presetTemplates.map((template) => `
            <button class="template-chip" type="button" data-template="${template.key}">
              ${template.name}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="panel preview-panel">
        <div class="preview-box">
          <canvas id="qr-preview-canvas" width="280" height="280"></canvas>
        </div>

        <div class="preview-controls">
          <div class="field-group two-up">
            <label>Couleur principale</label>
            <input id="foreground-color" type="color" value="#111827">
          </div>
          <div class="field-group two-up">
            <label>Couleur de fond</label>
            <input id="background-color" type="color" value="#ffffff">
          </div>
          <div class="field-group">
            <label>Taille</label>
            <input id="qr-size" type="range" min="140" max="420" value="280">
          </div>
          <div class="field-group">
            <label>Marge</label>
            <input id="qr-margin" type="range" min="0" max="10" value="2">
          </div>
          <div class="field-group">
            <label>Correction d'erreur</label>
            <select id="qr-ecc">
              <option value="L">Faible</option>
              <option value="M" selected>Moyenne</option>
              <option value="Q">Élevée</option>
              <option value="H">Très élevée</option>
            </select>
          </div>
          <div class="field-group">
            <label>Nom du QR</label>
            <input id="qr-name" type="text" placeholder="Mon QR">
          </div>
          <div class="field-group">
            <label>Logo</label>
            <input id="logo-upload" type="file" accept="image/*">
          </div>
          <div class="field-group">
            <label>Format d'export</label>
            <div class="actions-inline">
              <button class="secondary-btn" type="button" data-action="export-png">PNG</button>
              <button class="secondary-btn" type="button" data-action="export-svg">SVG</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initGenerator() {
  const typeSelect = document.getElementById('qr-type');
  const formHost = document.getElementById('qr-form-fields');
  const previewCanvas = document.getElementById('qr-preview-canvas');
  const type = typeSelect.value;
  formHost.innerHTML = formTemplates[type] || formTemplates.url;

  const editId = sessionStorage.getItem('qrstudio-edit-id');
  if (editId) {
    const item = getHistory().find((record) => record.id === editId);
    if (item) {
      const values = item.content || {};
      const form = document.querySelector('#qr-form-fields');
      if (form) {
        for (const [key, value] of Object.entries(values)) {
          const field = form.querySelector(`[name="${key}"]`);
          if (field) field.value = value;
        }
      }
      const nameInput = document.getElementById('qr-name');
      if (nameInput) nameInput.value = item.name || '';
      const fg = document.getElementById('foreground-color');
      const bg = document.getElementById('background-color');
      const size = document.getElementById('qr-size');
      const margin = document.getElementById('qr-margin');
      const ecc = document.getElementById('qr-ecc');
      if (fg) fg.value = item.customization?.foreground || '#111827';
      if (bg) bg.value = item.customization?.background || '#ffffff';
      if (size) size.value = item.customization?.size || 280;
      if (margin) margin.value = item.customization?.margin || 2;
      if (ecc) ecc.value = item.customization?.errorCorrectionLevel || 'M';
      sessionStorage.removeItem('qrstudio-edit-id');
    }
  }

  const refreshPreview = async () => {
    const formData = new FormData(document.querySelector('#qr-form-fields form') || document.querySelector('#qr-form-fields'));
    const values = Object.fromEntries(formData.entries());
    const payload = buildPayloadFromGenerator(typeSelect.value, values);
    if (!payload) return;
    const settings = {
      foreground: document.getElementById('foreground-color')?.value || '#111827',
      background: document.getElementById('background-color')?.value || '#ffffff',
      size: Number(document.getElementById('qr-size')?.value || 280),
      margin: Number(document.getElementById('qr-margin')?.value || 2),
      errorCorrectionLevel: document.getElementById('qr-ecc')?.value || 'M',
    };
    const logoDataUrl = localStorage.getItem('qrstudio_logo_data_url');
    await generateQrCanvas({ canvas: previewCanvas, payload, options: settings, logoDataUrl });
  };

  typeSelect.addEventListener('change', () => {
    const selected = typeSelect.value;
    formHost.innerHTML = formTemplates[selected] || formTemplates.url;
    refreshPreview();
  });

  const handleInput = () => refreshPreview();
  document.addEventListener('input', handleInput);
  document.addEventListener('change', handleInput);

  document.querySelectorAll('[data-template]').forEach((button) => {
    button.addEventListener('click', () => {
      const preset = presetTemplates.find((item) => item.key === button.dataset.template);
      const fg = document.getElementById('foreground-color');
      const bg = document.getElementById('background-color');
      const size = document.getElementById('qr-size');
      const margin = document.getElementById('qr-margin');
      const ecc = document.getElementById('qr-ecc');
      if (preset) {
        fg.value = preset.options.foreground;
        bg.value = preset.options.background;
        size.value = 280;
        margin.value = preset.options.margin;
        ecc.value = preset.options.errorCorrectionLevel;
      }
      refreshPreview();
    });
  });

  document.getElementById('logo-upload')?.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem('qrstudio_logo_data_url', reader.result);
      refreshPreview();
      showToast('Logo ajouté au QR code.', 'success');
    };
    reader.readAsDataURL(file);
  });

  const saveButton = document.querySelector('[data-action="save-qr"]');
  saveButton?.addEventListener('click', () => {
    const form = document.getElementById('qr-form-fields');
    const qName = document.getElementById('qr-name')?.value || 'QR sans nom';
    const payload = buildPayloadFromGenerator(typeSelect.value, Object.fromEntries(new FormData(form).entries()));
    if (!payload) {
      showToast('Complétez correctement le formulaire avant d’enregistrer.', 'error');
      return;
    }

    const record = createQrRecord({
      type: typeSelect.value,
      name: qName,
      content: payload,
      customization: {
        foreground: document.getElementById('foreground-color')?.value || '#111827',
        background: document.getElementById('background-color')?.value || '#ffffff',
        size: Number(document.getElementById('qr-size')?.value || 280),
        margin: Number(document.getElementById('qr-margin')?.value || 2),
        errorCorrectionLevel: document.getElementById('qr-ecc')?.value || 'M',
      },
    });

    addQrRecord(record);
    showToast('QR enregistré dans l’historique.', 'success');
  });

  document.querySelector('[data-action="export-png"]')?.addEventListener('click', async () => {
    const finalPayload = buildPayloadFromGenerator(typeSelect.value, Object.fromEntries(new FormData(formHost).entries()));
    const settings = {
      foreground: document.getElementById('foreground-color')?.value || '#111827',
      background: document.getElementById('background-color')?.value || '#ffffff',
      size: Number(document.getElementById('qr-size')?.value || 280),
      margin: Number(document.getElementById('qr-margin')?.value || 2),
      errorCorrectionLevel: document.getElementById('qr-ecc')?.value || 'M',
    };
    const dataUrl = await generateQrCanvas({ canvas: previewCanvas, payload: finalPayload, options: settings, logoDataUrl: localStorage.getItem('qrstudio_logo_data_url') });
    await downloadPng(dataUrl, document.getElementById('qr-name')?.value || 'qr-studio');
    showToast('Téléchargement PNG réussi.', 'success');
  });

  document.querySelector('[data-action="export-svg"]')?.addEventListener('click', async () => {
    const finalPayload = buildPayloadFromGenerator(typeSelect.value, Object.fromEntries(new FormData(formHost).entries()));
    const settings = {
      foreground: document.getElementById('foreground-color')?.value || '#111827',
      background: document.getElementById('background-color')?.value || '#ffffff',
      size: Number(document.getElementById('qr-size')?.value || 280),
      margin: Number(document.getElementById('qr-margin')?.value || 2),
      errorCorrectionLevel: document.getElementById('qr-ecc')?.value || 'M',
    };
    const svg = await generateQrSvg(finalPayload, settings);
    await downloadSvg(svg, document.getElementById('qr-name')?.value || 'qr-studio');
    showToast('Téléchargement SVG réussi.', 'success');
  });

  refreshPreview();
}

function buildPayloadFromGenerator(type, values) {
  const payload = {
    url: values.url,
    text: values.text,
    ssid: values.ssid,
    password: values.password,
    security: values.security || 'WPA',
    hidden: values.hidden || 'false',
    name: values.name,
    company: values.company,
    email: values.email,
    phone: values.phone,
    website: values.website,
    subject: values.subject,
    message: values.message,
    latitude: values.latitude,
    longitude: values.longitude,
    title: values.title,
    startDate: values.startDate,
    location: values.location,
  };

  if (type === 'url' && !validateUrl(payload.url)) {
    return '';
  }
  if (type === 'text' && !payload.text) return '';
  if (type === 'wifi' && (!payload.ssid || !payload.password)) return '';
  if (type === 'vcard' && !payload.name) return '';
  if (type === 'email' && !validateEmail(payload.email)) return '';
  if (type === 'phone' && !validatePhone(payload.phone)) return '';
  if (type === 'sms' && (!validatePhone(payload.phone) || !payload.message)) return '';
  if (type === 'geo' && (!payload.latitude || !payload.longitude)) return '';
  if (type === 'event' && (!payload.title || !payload.startDate || !payload.location)) return '';

  return {
    url: payload.url,
    text: payload.text,
    ssid: payload.ssid,
    password: payload.password,
    security: payload.security,
    hidden: payload.hidden,
    name: payload.name,
    company: payload.company,
    email: payload.email,
    phone: payload.phone,
    website: payload.website,
    subject: payload.subject,
    message: payload.message,
    latitude: payload.latitude,
    longitude: payload.longitude,
    title: payload.title,
    startDate: payload.startDate,
    location: payload.location,
  };
}

function buildPayloadFromGenerator(type, values) {
  switch (type) {
    case 'url':
      return values.url;
    case 'text':
      return values.text;
    case 'wifi':
      return `WIFI:T:${values.security || 'WPA'};S:${values.ssid};P:${values.password};H:${values.hidden === 'true' ? 'true' : 'false'};;`;
    case 'vcard':
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${values.name}\nORG:${values.company || ''}\nEMAIL:${values.email || ''}\nTEL:${values.phone || ''}\nURL:${values.website || ''}\nEND:VCARD`;
    case 'email':
      return `mailto:${values.email}?subject=${encodeURIComponent(values.subject || '')}`;
    case 'phone':
      return `tel:${values.phone}`;
    case 'sms':
      return `smsto:${values.phone}:${encodeURIComponent(values.message || '')}`;
    case 'geo':
      return `geo:${values.latitude},${values.longitude}`;
    case 'event':
      return `BEGIN:VEVENT\nSUMMARY:${values.title}\nDTSTART:${values.startDate}\nLOCATION:${values.location}\nEND:VEVENT`;
    default:
      return '';
  }
}
