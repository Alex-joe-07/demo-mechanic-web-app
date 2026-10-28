/**
 * Contact & Build Enquiry Controller
 * Handles model selection, scope checkboxes, client-side validation, demo feedback, and WhatsApp dispatch.
 */

document.addEventListener('DOMContentLoaded', () => {
  initModelSelector();
  initContactForm();
});

/**
 * Segmented Model Selector Buttons
 */
function initModelSelector() {
  const modelBtns = document.querySelectorAll('.model-pick-btn');
  const modelInput = document.getElementById('motorcycleModel');

  if (!modelBtns.length || !modelInput) return;

  modelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modelBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.getAttribute('data-val');
      modelInput.value = val;
    });
  });
}

/**
 * Form Validation and Submission
 */
function initContactForm() {
  const form = document.getElementById('build-enquiry-form');
  const statusBanner = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('submit-btn');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // 1. Gather fields
    const nameInput = document.getElementById('fullName');
    const phoneInput = document.getElementById('phoneNumber');
    const modelInput = document.getElementById('motorcycleModel');
    const budgetSelect = document.getElementById('budgetRange');
    const visionInput = document.getElementById('projectVision');
    const selectedScopes = Array.from(document.querySelectorAll('input[name="modTypes"]:checked'))
      .map(cb => cb.value);

    // 2. Validate
    let hasError = false;

    // Reset previous errors
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    form.querySelectorAll('.input-field, .textarea-field').forEach(el => el.classList.remove('error'));

    if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
      showError(nameInput, 'Please provide your full name (minimum 2 characters).');
      hasError = true;
    }

    const phoneClean = phoneInput.value.replace(/[^0-9+]/g, '');
    if (!phoneClean || phoneClean.length < 8) {
      showError(phoneInput, 'Please provide a valid phone or WhatsApp number.');
      hasError = true;
    }

    if (!visionInput.value.trim() || visionInput.value.trim().length < 8) {
      showError(visionInput, 'Please provide a brief description of your motorcycle build vision.');
      hasError = true;
    }

    if (hasError) return;

    // 3. Prepare structured WhatsApp dispatch message
    const formattedScopes = selectedScopes.length > 0 ? selectedScopes.join(', ') : 'Open Consultation';
    const budgetVal = budgetSelect.value !== 'Select a range' ? budgetSelect.value : 'Open Consultation';
    
    const whatsappSummary = 
`*NEW ATELIER BUILD ENQUIRY*
----------------------------
*Rider Name:* ${nameInput.value.trim()}
*Contact:* ${phoneInput.value.trim()}
*Base Motorcycle:* ${modelInput.value}
*Scope of Work:* ${formattedScopes}
*Estimated Budget:* ${budgetVal}
*Project Vision:*
${visionInput.value.trim()}
----------------------------
_Generated via Shayaan Mechanic Atelier Showcase_`;

    // 4. Update UI to processing state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>RECORDING ENQUIRY...</span>`;
    }

    setTimeout(() => {
      if (statusBanner) {
        statusBanner.classList.add('show');
        statusBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      if (submitBtn) {
        submitBtn.innerHTML = `<span>ENQUIRY RECORDED</span> <span class="material-symbols-outlined">check_circle</span>`;
        submitBtn.classList.remove('btn-primary');
        submitBtn.classList.add('btn-ghost');
      }

      // Show comprehensive modal with 1-click WhatsApp transmission
      if (typeof window.showAtelierModal === 'function') {
        const modalHtml = `
          <div style="margin-bottom: 1.25rem;">
            <p style="color: var(--text-primary); font-size: 1.05rem; margin-bottom: 0.5rem; font-weight: 600;">
              Thank you, ${nameInput.value.trim()}!
            </p>
            <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1rem;">
              Your build inquiry for the <strong>${modelInput.value}</strong> has been drafted. 
              Because this website is a live workshop demonstration, you can instantly forward these details to our lead mechanic via WhatsApp with one click below:
            </p>
            <div style="background-color: var(--surface-low); padding: 1rem; border: 1px solid var(--border-subtle); font-size: 0.8rem; font-family: var(--font-mono); color: var(--text-secondary); white-space: pre-line; line-height: 1.45;">
              ${whatsappSummary.replace(/\*/g, '')}
            </div>
          </div>
        `;
        window.showAtelierModal('COMMISSION ENQUIRY READY', modalHtml, whatsappSummary);
      }
    }, 600);
  });
}

function showError(field, message) {
  field.classList.add('error');
  const errorEl = document.createElement('div');
  errorEl.className = 'error-message';
  errorEl.textContent = message;
  field.parentNode.appendChild(errorEl);
  field.focus();
}
