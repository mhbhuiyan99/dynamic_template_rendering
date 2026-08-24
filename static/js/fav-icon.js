
function initTileFavorites() {
  const storageKey = 'favorite_properties';
  let favorites = {};

  try {
    favorites = JSON.parse(localStorage.getItem(storageKey) || '{}');
  } catch (_error) {
    favorites = {};
  }

  document.querySelectorAll('.tile-favorite[data-property-id]').forEach((button) => {
    const propertyId = button.dataset.propertyId;
    const isFavorite = Boolean(favorites[propertyId]);
    button.classList.toggle('is-favorite', isFavorite);
    button.setAttribute('aria-pressed', String(isFavorite));
    button.textContent = isFavorite ? '\u2665' : '\u2661';
  });

  document.addEventListener('click', (event) => {
    const button = event.target.closest('.tile-favorite[data-property-id]');
    if (!button) return;

    const propertyId = button.dataset.propertyId;
    favorites[propertyId] = !favorites[propertyId];
    button.classList.toggle('is-favorite', favorites[propertyId]);
    button.setAttribute('aria-pressed', String(favorites[propertyId]));
    button.textContent = favorites[propertyId] ? '\u2665' : '\u2661';

    try {
      localStorage.setItem(storageKey, JSON.stringify(favorites));
    } catch (_error) {
      // Storage can be unavailable in private or restricted browser contexts.
    }
  });
}

initTileFavorites();