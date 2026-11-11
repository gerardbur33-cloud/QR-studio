import QRCode from 'qrcode';

const defaultOptions = {
  foreground: '#111827',
  background: '#ffffff',
  size: 260,
  margin: 2,
  errorCorrectionLevel: 'M',
};

export function buildQrPayload(type, values) {
  switch (type) {
    case 'url':
      return String(values.url || '').trim();
    case 'text':
      return String(values.text || '').trim();
    case 'wifi': {
      const ssid = String(values.ssid || '').trim();
      const password = String(values.password || '').trim();
      return `WIFI:T:${values.security || 'WPA'};S:${ssid};P:${password};H:${values.hidden === 'true' ? 'true' : 'false'};;`;
    }
    case 'vcard': {
      const fullName = String(values.name || '').trim();
      const company = String(values.company || '').trim();
      const email = String(values.email || '').trim();
      const phone = String(values.phone || '').trim();
      const website = String(values.website || '').trim();
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${fullName}`,
        company ? `ORG:${company}` : '',
        email ? `EMAIL:${email}` : '',
        phone ? `TEL:${phone}` : '',
        website ? `URL:${website}` : '',
        'END:VCARD',
      ].filter(Boolean).join('\n');
    }
    case 'email':
      return `mailto:${String(values.email || '').trim()}?subject=${encodeURIComponent(String(values.subject || ''))}`;
    case 'phone':
      return `tel:${String(values.phone || '').trim()}`;
    case 'sms':
      return `smsto:${String(values.phone || '').trim()}:${encodeURIComponent(String(values.message || ''))}`;
    case 'geo':
      return `geo:${String(values.latitude || '').trim()},${String(values.longitude || '').trim()}`;
    case 'event':
      return [
        'BEGIN:VEVENT',
        `SUMMARY:${String(values.title || '').trim()}`,
        `DTSTART:${String(values.startDate || '').trim()}`,
        `LOCATION:${String(values.location || '').trim()}`,
        'END:VEVENT',
      ].join('\n');
    default:
      return '';
  }
}

export async function generateQrCanvas({ canvas, payload, options = {}, logoDataUrl = null }) {
  const settings = { ...defaultOptions, ...options };
  await QRCode.toCanvas(canvas, payload, {
    width: Number(settings.size) || 240,
    margin: Number(settings.margin) || 1,
    errorCorrectionLevel: settings.errorCorrectionLevel || 'M',
    color: {
      dark: settings.foreground || '#111827',
      light: settings.background || '#ffffff',
    },
  });

  if (logoDataUrl) {
    const context = canvas.getContext('2d');
    const image = new Image();
    image.src = logoDataUrl;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    const size = Math.max(48, Math.min(canvas.width * 0.2, 90));
    const x = (canvas.width - size) / 2;
    const y = (canvas.height - size) / 2;
    context.save();
    context.fillStyle = 'rgba(255,255,255,0.92)';
    context.beginPath();
    context.roundRect(x - 10, y - 10, size + 20, size + 20, 18);
    context.fill();
    context.strokeStyle = '#e5e7eb';
    context.lineWidth = 2;
    context.stroke();
    context.drawImage(image, x, y, size, size);
    context.restore();
  }

  return canvas.toDataURL('image/png');
}

export async function generateQrSvg(payload, options = {}) {
  const settings = { ...defaultOptions, ...options };
  return QRCode.toString(payload, {
    type: 'svg',
    width: Number(settings.size) || 240,
    margin: Number(settings.margin) || 1,
    errorCorrectionLevel: settings.errorCorrectionLevel || 'M',
    color: {
      dark: settings.foreground || '#111827',
      light: settings.background || '#ffffff',
    },
  });
}

export function createQrRecord(fields) {
  return {
    id: `qr-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    type: fields.type,
    name: fields.name || 'QR sans nom',
    content: fields.content,
    createdAt: new Date().toISOString(),
    customization: fields.customization || defaultOptions,
    saved: true,
  };
}
