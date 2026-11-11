export const STORAGE_KEYS = {
  HISTORY: 'qrstudio_history',
  COLLECTIONS: 'qrstudio_collections',
  THEME: 'qrstudio_theme',
  LAST_PAGE: 'qrstudio_last_page',
};

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export function getTheme() {
  return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
}

export function setTheme(theme) {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
  document.body.classList.toggle('dark', theme === 'dark');
}

export function getHistory() {
  return safeParse(localStorage.getItem(STORAGE_KEYS.HISTORY), []);
}

export function saveHistory(items) {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(items));
}

export function addQrRecord(record) {
  const history = getHistory();
  history.unshift(record);
  saveHistory(history);
  return record;
}

export function updateQrRecord(id, updates) {
  const history = getHistory();
  const newList = history.map((item) => (item.id === id ? { ...item, ...updates } : item));
  saveHistory(newList);
  return newList;
}

export function deleteQrRecord(id) {
  const next = getHistory().filter((item) => item.id !== id);
  saveHistory(next);
}

export function duplicateQrRecord(id) {
  const history = getHistory();
  const source = history.find((item) => item.id === id);
  if (!source) return null;
  const copy = {
    ...source,
    id: `qr-${Date.now()}`,
    createdAt: new Date().toISOString(),
    name: `${source.name} (copie)`,
  };
  addQrRecord(copy);
  return copy;
}

export function getRecentRecords(limit = 5) {
  return getHistory().slice(0, limit);
}

export function getCollections() {
  return safeParse(localStorage.getItem(STORAGE_KEYS.COLLECTIONS), []);
}

export function saveCollections(items) {
  localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(items));
}

export function addCollection(name) {
  const safeName = String(name || '').trim();
  if (!safeName) return null;
  const collections = getCollections();
  if (collections.includes(safeName)) return null;
  const next = [...collections, safeName];
  saveCollections(next);
  return safeName;
}

export function getStats() {
  const records = getHistory();
  const total = records.length;
  const saved = records.filter((item) => item.saved !== false).length;
  return { total, saved, recent: records.slice(0, 4) };
}

export function setLastPage(page) {
  localStorage.setItem(STORAGE_KEYS.LAST_PAGE, page);
}

export function getLastPage() {
  return localStorage.getItem(STORAGE_KEYS.LAST_PAGE) || 'dashboard';
}

export function ensureDemoData() {
  if (getHistory().length) return;
  const demo = [
    {
      id: 'demo-1',
      type: 'url',
      name: 'Portfolio',
      content: 'https://www.example.com',
      createdAt: new Date().toISOString(),
      customization: {
        foreground: '#1d4ed8',
        background: '#ffffff',
        margin: 2,
        size: 220,
        errorCorrectionLevel: 'M',
      },
      saved: true,
    },
    {
      id: 'demo-2',
      type: 'wifi',
      name: 'Wi-Fi Maison',
      content: 'WIFI:T:WPA;S:Maison;P:motdepasse;H:false;;',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      customization: {
        foreground: '#111827',
        background: '#fef3c7',
        margin: 1,
        size: 210,
        errorCorrectionLevel: 'M',
      },
      saved: true,
    },
  ];
  saveHistory(demo);
}
