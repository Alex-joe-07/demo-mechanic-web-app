/**
 * Master JavaScript Controller for Atelier Bespoke Moto / Shayaan Mechanic
 * Handles global navigation, mobile drawer, dynamic configuration, and interactive modals.
 */

document.addEventListener('DOMContentLoaded', () => {
  initGlobalConfig();
  initNavigation();
  initWhatsAppLinks();
  initDemoModal();
});

/**
 * Injects values from window.ATELIER_CONFIG into marked elements
 */
function initGlobalConfig() {
  const config = window.ATELIER_CONFIG;
  if (!config) return;

  // Replace text in elements with data-config attribute
  document.querySelectorAll('[data-config]').forEach(el => {
    const key = el.getAttribute('data-config');
    if (config[key]) {
      el.textContent = config[key];
    }
  });

  // Replace hrefs in elements with data-config-href
  document.querySelectorAll('[data-config-href]').forEach(el => {
    const key = el.getAttribute('data-config-href');
    if (key === 'mapDirections' && config.mapDirectionsUrl) {
      el.setAttribute('href', config.mapDirectionsUrl);
    } else if (key === 'phone' && config.phoneNumberRaw) {
      el.setAttribute('href', `tel:${config.phoneNumberRaw}`);
    } else if (key === 'whatsapp') {
      el.setAttribute('href', window.getWhatsAppLink());
    } else if (key === 'instagram' && config.instagramUrl) {
      el.setAttribute('href', config.instagramUrl);
    }
  });
}

/**
 * Navigation Bar, Active Links, and Mobile Menu Drawer
 */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');

  // Header background on scroll
  if (header) {
    const updateHeader = () => {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  // Mobile menu toggle
  if (mobileBtn && mobileDrawer) {
    mobileBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileBtn.setAttribute('aria-expanded', isOpen);
      const icon = mobileBtn.querySelector('.material-symbols-outlined');
      if (icon) {
        icon.textContent = isOpen ? 'close' : 'menu';
      }
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close mobile menu on link click
    mobileDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        document.body.style.overflow = '';
        const icon = mobileBtn.querySelector('.material-symbols-outlined');
        if (icon) icon.textContent = 'menu';
      });
    });
  }

  // Active link detection based on pathname
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html') || (currentPath === 'index.html' && href === 'index.html')) {
      link.classList.add('active');
    } else if (href && href !== '#' && currentPath.includes(href)) {
      link.classList.add('active');
    }
  });
}

/**
 * Sets dynamic WhatsApp links with relevant prefilled messages
 */
function initWhatsAppLinks() {
  document.querySelectorAll('[data-whatsapp-btn]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const customMsg = btn.getAttribute('data-whatsapp-msg') || 
        `Hello Shayaan Mechanic! I am interested in building a custom Royal Enfield. Please share consultation details.`;
      const url = window.getWhatsAppLink(customMsg);
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  });
}

/**
 * Generic Modal Controller for demo info & build confirmations
 */
function initDemoModal() {
  const modalOverlay = document.getElementById('demo-modal');
  const closeBtns = document.querySelectorAll('[data-close-modal]');

  if (!modalOverlay) return;

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // Expose helper to show modal globally with flexible action buttons
  window.showAtelierModal = function(title, contentHtml, options) {
    const modalTitle = modalOverlay.querySelector('#modal-title');
    const modalBody = modalOverlay.querySelector('#modal-body');
    const modalAction = modalOverlay.querySelector('#modal-whatsapp-action');
    const footerLeft = modalOverlay.querySelector('#modal-footer-left');
    const footerRight = modalOverlay.querySelector('#modal-footer-right') || modalAction?.parentElement;

    if (modalTitle) modalTitle.textContent = title;
    if (modalBody) modalBody.innerHTML = contentHtml;

    // Reset dynamic buttons and footer containers
    modalOverlay.querySelectorAll('.dynamic-modal-btn').forEach(btn => btn.remove());
    if (footerLeft) footerLeft.innerHTML = '';
    if (modalAction) modalAction.style.display = 'none';

    if (typeof options === 'string') {
      // Legacy backwards-compatible string = WhatsApp single action
      if (modalAction) {
        modalAction.onclick = () => window.open(window.getWhatsAppLink(options), '_blank');
        modalAction.style.display = 'inline-flex';
        modalAction.innerHTML = '<span class="material-symbols-outlined">chat</span> OPEN IN WHATSAPP';
      }
    } else if (options && typeof options === 'object') {
      // 1. JSON Utilities (Download & Copy) -> placed in modal-footer-left
      if (options.json && footerLeft) {
        const jsonBtn = document.createElement('button');
        jsonBtn.type = 'button';
        jsonBtn.className = 'btn btn-ghost btn-sm dynamic-modal-btn';
        jsonBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 1rem;">download</span> DOWNLOAD JSON';
        jsonBtn.onclick = () => {
          window.downloadJSONFile(options.json.data, options.json.filename);
        };
        footerLeft.appendChild(jsonBtn);

        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'btn btn-ghost btn-sm dynamic-modal-btn';
        copyBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 1rem;">content_copy</span> COPY JSON';
        copyBtn.onclick = () => {
          const textToCopy = JSON.stringify(options.json.data, null, 2);
          navigator.clipboard.writeText(textToCopy)
            .then(() => {
              copyBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 1rem; color: var(--primary);">check</span> COPIED!';
              setTimeout(() => {
                copyBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 1rem;">content_copy</span> COPY JSON';
              }, 2000);
            })
            .catch(() => {
              copyBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 1rem; color: var(--primary);">check</span> COPIED!';
            });
        };
        footerLeft.appendChild(copyBtn);
      }

      // Check if primary actions are already placed in modalBody
      const hasGmailInBody = modalBody && modalBody.querySelector('#btn-modal-gmail');
      const hasWaInBody = modalBody && modalBody.querySelector('#btn-modal-whatsapp');

      // 2. Fallback buttons in footerRight if not embedded in modal body
      if (!hasWaInBody && options.whatsappText && footerRight) {
        const waBtn = document.createElement('button');
        waBtn.type = 'button';
        waBtn.className = 'btn btn-outline btn-sm dynamic-modal-btn';
        waBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 1rem;">chat</span> SEND WHATSAPP';
        waBtn.onclick = () => {
          window.open(window.getWhatsAppLink(options.whatsappText), '_blank');
        };
        footerRight.insertBefore(waBtn, footerRight.firstChild);
      }

      if (!hasGmailInBody && options.gmail && footerRight) {
        const gmailBtn = document.createElement('button');
        gmailBtn.type = 'button';
        gmailBtn.className = 'btn btn-primary btn-sm dynamic-modal-btn';
        gmailBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 1rem;">mail</span> SEND VIA GMAIL';
        gmailBtn.onclick = () => {
          const url = window.getGmailComposeLink(options.gmail.subject, options.gmail.body);
          window.open(url, '_blank');
        };
        footerRight.insertBefore(gmailBtn, footerRight.firstChild);
      }
    }

    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
}
