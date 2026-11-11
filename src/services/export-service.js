import JSZip from 'jszip';

export async function downloadBlob(blob, fileName) {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function downloadPng(dataUrl, fileName) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  await downloadBlob(blob, `${fileName}.png`);
}

export async function downloadSvg(svgString, fileName) {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  await downloadBlob(blob, `${fileName}.svg`);
}

export async function downloadBulkZip(items) {
  const zip = new JSZip();
  items.forEach((item) => {
    zip.file(`${item.name || 'qr'}.svg`, item.svgContent || '');
  });
  const blob = await zip.generateAsync({ type: 'blob' });
  await downloadBlob(blob, 'qr-studio-archive.zip');
}
