const safeText = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

export function sanitizeValue(value) {
  return safeText(value).replace(/[<>]/g, '');
}

export function validateUrl(value) {
  const text = safeText(value);
  if (!text) return false;
  try {
    const url = new URL(text.startsWith('http') ? text : `https://${text}`);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

export function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeText(value));
}

export function validatePhone(value) {
  return /\+?[0-9\s().-]{7,}/.test(safeText(value));
}

export function validateWifiName(value) {
  return safeText(value).length > 0;
}

export function validateCsvLink(value) {
  return validateUrl(value) || /^mailto:|^tel:|^geo:|^sms:|^wifi:/i.test(value);
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
