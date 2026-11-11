export function showToast(message, type = 'success') {
  const host = document.querySelector('#toast-container');
  if (!host) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  host.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

export function confirmAction(message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card">
      <h3>Confirmation</h3>
      <p>${message}</p>
      <div class="modal-actions">
        <button class="secondary-btn" data-close-modal="true">Annuler</button>
        <button class="danger-btn" data-confirm-modal="true">Confirmer</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.addEventListener('click', (event) => {
    if (event.target.dataset.closeModal === 'true') close();
    if (event.target.dataset.confirmModal === 'true') {
      close();
      onConfirm();
    }
  });
}
