/**
 * Modifications & Builds Interactive Controller
 * Handles model category filtering, responsive before/after slider, and build quick-look specs.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCategoryFilters();
  initComparisonSlider();
  initBuildCardModals();
});

/**
 * Filter gallery cards by Royal Enfield platform
 */
function initCategoryFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.build-card');
  const countIndicator = document.getElementById('active-count');

  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active button state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');
      let visibleCount = 0;

      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterVal === 'all' || category === filterVal) {
          card.classList.remove('hidden');
          visibleCount++;
        } else {
          card.classList.add('hidden');
        }
      });

      if (countIndicator) {
        countIndicator.textContent = `${visibleCount < 10 ? '0' + visibleCount : visibleCount} ARCHIVED`;
      }
    });
  });
}

/**
 * Interactive Before / After Split Comparison Slider
 */
function initComparisonSlider() {
  const viewport = document.querySelector('.comparison-viewport');
  const clipLayer = document.querySelector('.comparison-before-layer');
  const beforeWrapper = document.querySelector('.comparison-before-wrapper');
  const handle = document.querySelector('.comparison-divider-handle');
  const rangeInput = document.querySelector('.comparison-range-input');

  if (!viewport || !clipLayer || !handle) return;

  // Ensure before image wrapper matches the exact width of viewport
  const updateWrapperWidth = () => {
    const width = viewport.getBoundingClientRect().width;
    viewport.style.setProperty('--viewport-width', `${width}px`);
    if (beforeWrapper) {
      beforeWrapper.style.width = `${width}px`;
    }
  };

  const updateSplit = (percent) => {
    const clamped = Math.max(0, Math.min(100, percent));
    clipLayer.style.width = `${clamped}%`;
    handle.style.left = `${clamped}%`;
  };

  // Sync with range input if present
  if (rangeInput) {
    rangeInput.addEventListener('input', (e) => {
      updateSplit(e.target.value);
    });
  }

  // Pointer drag support
  let isDragging = false;
  const onPointerMove = (e) => {
    if (!isDragging) return;
    const rect = viewport.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    if (!clientX) return;
    const x = clientX - rect.left;
    const percent = (x / rect.width) * 100;
    updateSplit(percent);
    if (rangeInput) rangeInput.value = percent;
  };

  const startDrag = () => { isDragging = true; };
  const stopDrag = () => { isDragging = false; };

  viewport.addEventListener('mousedown', (e) => {
    isDragging = true;
    onPointerMove(e);
  });
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', stopDrag);

  viewport.addEventListener('touchstart', (e) => {
    isDragging = true;
    onPointerMove(e);
  }, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
  window.addEventListener('touchend', stopDrag);

  // Resize listener
  window.addEventListener('resize', updateWrapperWidth);
  updateWrapperWidth();
  updateSplit(50);
}

/**
 * Quick-look modal inspection for build cards
 */
function initBuildCardModals() {
  const cards = document.querySelectorAll('.build-card');
  if (!cards.length || typeof window.showAtelierModal !== 'function') return;

  cards.forEach(card => {
    const titleEl = card.querySelector('.build-title');
    const badgeEl = card.querySelector('.build-engine-badge');
    const descEl = card.querySelector('.build-desc');
    const imgEl = card.querySelector('.build-media img');

    card.addEventListener('click', (e) => {
      // Don't trigger if clicked a link or button directly
      if (e.target.closest('a') || e.target.closest('button')) return;

      const title = titleEl ? titleEl.textContent.trim() : 'Atelier Motorcycle Build';
      const badge = badgeEl ? badgeEl.textContent.trim() : '';
      const desc = descEl ? descEl.textContent.trim() : '';
      const imgSrc = imgEl ? imgEl.getAttribute('src') : '';

      const contentHtml = `
        <div style="margin-bottom: 1.5rem; border: 1px solid var(--border-subtle); overflow: hidden;">
          <img src="${imgSrc}" alt="${title}" style="width: 100%; aspect-ratio: 16/9; object-fit: cover;" />
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <span style="color: var(--primary); font-family: var(--font-mono); font-size: 0.8rem; font-weight: 600;">${badge}</span>
          <span class="badge badge-primary">COMMISSION ALLOCATION OPEN</span>
        </div>
        <p style="font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem; color: var(--text-secondary);">${desc}</p>
        <div class="footer-disclaimer-box" style="margin-top: 0;">
          <span class="material-symbols-outlined text-primary text-sm">verified</span>
          <span>Bespoke coachbuilding scope: subframe loop, custom exhaust flow, and custom paint scheme.</span>
        </div>
      `;

      const whatsappText = `Hello Shayaan Mechanic! I am inquiring about the ${title} build (${badge}). Please let me know the estimated timeline and consultation details.`;

      window.showAtelierModal(title, contentHtml, whatsappText);
    });
  });
}
