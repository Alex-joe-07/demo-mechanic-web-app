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

    // 3. Build Structured JSON Object
    const enquiryId = 'ENQ-' + Date.now().toString().slice(-6);
    const timestamp = new Date().toISOString();
    const formattedScopes = selectedScopes.length > 0 ? selectedScopes : ['Open Consultation'];
    const budgetVal = budgetSelect.value !== 'Select a range' ? budgetSelect.value : 'Open Consultation';

    const enquiryJSON = {
      id: enquiryId,
      timestamp: timestamp,
      workshop: window.ATELIER_CONFIG.workshopName,
      location: window.ATELIER_CONFIG.locationShort,
      customer: {
        fullName: nameInput.value.trim(),
        phoneNumber: phoneInput.value.trim()
      },
      motorcycle: {
        basePlatform: modelInput.value,
        modificationScopes: formattedScopes,
        estimatedBudget: budgetVal
      },
      projectVision: visionInput.value.trim(),
      status: "COMMISSION_REQUESTED"
    };

    // Save to LocalStorage JSON database (zero backend needed)
    window.saveEnquiryJSON(enquiryJSON);

    // Prepare text for WhatsApp
    const whatsappSummary = 
`*NEW ATELIER BUILD ENQUIRY [${enquiryId}]*
----------------------------
*Rider Name:* ${nameInput.value.trim()}
*Contact:* ${phoneInput.value.trim()}
*Base Motorcycle:* ${modelInput.value}
*Scope of Work:* ${formattedScopes.join(', ')}
*Estimated Budget:* ${budgetVal}
*Project Vision:*
${visionInput.value.trim()}
----------------------------
_Generated via Shayaan Mechanic Atelier Showcase_`;

    // Prepare text for Gmail (human readable + clean JSON block)
    const emailSubject = `[Commission Inquiry #${enquiryId}] ${modelInput.value} - ${nameInput.value.trim()}`;
    const emailBody = 
`Hello Shayaan Mechanic Atelier,

A new custom Royal Enfield commission inquiry has been submitted:

CUSTOMER DETAILS:
- Name: ${nameInput.value.trim()}
- Phone/WhatsApp: ${phoneInput.value.trim()}

PROJECT SPECIFICATION:
- Base Platform: ${modelInput.value}
- Modification Scope: ${formattedScopes.join(', ')}
- Budget Guidance: ${budgetVal}

PROJECT VISION:
${visionInput.value.trim()}

--------------------------------------------------
STRUCTURED JSON SPECIFICATION:
${JSON.stringify(enquiryJSON, null, 2)}
--------------------------------------------------

Sent from Atelier Bespoke Moto Demo Showcase (Nallasopara, Maharashtra)`;

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

      // Refresh recent JSON ledger if visible
      renderEnquiriesLedger();

      // Show comprehensive modal with multi-channel options
      if (typeof window.showAtelierModal === 'function') {
        const jsonString = JSON.stringify(enquiryJSON, null, 2);
        
        const modalHtml = `
          <div style="margin-bottom: 0.5rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
              <span class="badge badge-primary">SPEC ID: ${enquiryId}</span>
              <span class="text-xs text-muted font-mono" style="display: flex; align-items: center; gap: 0.35rem;">
                <span class="badge-pulse-dot" style="display: inline-block;"></span>
                SAVED TO LOCAL STORAGE
              </span>
            </div>
            
            <h4 style="color: var(--text-primary); font-size: 1.15rem; margin-bottom: 0.35rem;">
              Thank you, ${nameInput.value.trim()}!
            </h4>
            <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.55;">
              Your build inquiry for the <strong>${modelInput.value}</strong> has been structured into an authentic <strong>JSON specification</strong> and stored in your browser without needing any backend server.
            </p>

            <!-- Technical Blueprint Terminal Code Box -->
            <div class="modal-terminal">
              <div class="terminal-header">
                <span style="display: flex; align-items: center; gap: 0.4rem;">
                  <span class="material-symbols-outlined" style="font-size: 0.95rem; color: var(--primary);">code</span>
                  enquiry-specification.json
                </span>
                <span style="color: var(--primary); font-size: 0.65rem;">JSON SPEC V1.0</span>
              </div>
              <div class="terminal-body" id="modal-json-text">${jsonString}</div>
            </div>

            <!-- Primary Dispatch Actions (2 Columns) -->
            <div style="margin-top: 1.25rem;">
              <span class="text-xs text-muted font-display tracking-widest block" style="margin-bottom: 0.5rem;">
                TRANSMIT INQUIRY TO ATELIER:
              </span>
              <div class="modal-primary-grid">
                <button type="button" class="btn btn-primary" id="btn-modal-gmail" style="width: 100%; justify-content: center;">
                  <span class="material-symbols-outlined">mail</span>
                  <span>SEND VIA GMAIL</span>
                </button>
                <button type="button" class="btn btn-outline" id="btn-modal-whatsapp" style="width: 100%; justify-content: center;">
                  <span class="material-symbols-outlined text-bronze">chat</span>
                  <span>SEND WHATSAPP</span>
                </button>
              </div>
            </div>
          </div>
        `;

        window.showAtelierModal('COMMISSION ENQUIRY READY', modalHtml, {
          gmail: {
            subject: emailSubject,
            body: emailBody
          },
          whatsappText: whatsappSummary,
          json: {
            data: enquiryJSON,
            filename: `shayaan-enquiry-${enquiryId}.json`
          }
        });

        // Bind the prominent action buttons inside modalHtml
        setTimeout(() => {
          const gmailBtn = document.getElementById('btn-modal-gmail');
          const waBtn = document.getElementById('btn-modal-whatsapp');
          if (gmailBtn) {
            gmailBtn.onclick = () => {
              const url = window.getGmailComposeLink(emailSubject, emailBody);
              window.open(url, '_blank');
            };
          }
          if (waBtn) {
            waBtn.onclick = () => {
              window.open(window.getWhatsAppLink(whatsappSummary), '_blank');
            };
          }
        }, 50);
      }
    }, 600);
  });

  // Render recent enquiries on page load
  renderEnquiriesLedger();
}

/**
 * Renders stored JSON enquiries in the client-side ledger
 */
function renderEnquiriesLedger() {
  const ledgerContainer = document.getElementById('json-enquiries-list');
  const countBadge = document.getElementById('json-enquiries-count');
  if (!ledgerContainer) return;

  const records = window.getEnquiriesJSON ? window.getEnquiriesJSON() : [];
  if (countBadge) countBadge.textContent = `${records.length} STORED`;

  if (records.length === 0) {
    ledgerContainer.innerHTML = `
      <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
        No local inquiries submitted yet. Submit the form above to see live JSON records generated instantly.
      </div>
    `;
    return;
  }

  ledgerContainer.innerHTML = records.map((rec, index) => `
    <div style="background-color: var(--surface-low); border: 1px solid var(--border-subtle); padding: 1rem; margin-bottom: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--primary); font-weight: 700;">#${rec.id}</span>
        <span style="font-size: 0.7rem; color: var(--text-muted);">${new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: baseline;">
        <strong style="color: var(--text-primary); font-size: 0.95rem;">${rec.customer.fullName}</strong>
        <span style="color: var(--text-secondary); font-size: 0.8rem; font-family: var(--font-display);">${rec.motorcycle.basePlatform}</span>
      </div>
      <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0; line-height: 1.4;">${rec.projectVision.slice(0, 80)}${rec.projectVision.length > 80 ? '...' : ''}</p>
      <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05);">
        <button type="button" class="btn btn-ghost btn-sm" onclick='window.downloadJSONFile(${JSON.stringify(rec).replace(/'/g, "&#39;")}, "enquiry-${rec.id}.json")' style="padding: 0.3rem 0.65rem; font-size: 0.725rem;">
          <span class="material-symbols-outlined" style="font-size: 0.9rem;">download</span> JSON
        </button>
        <button type="button" class="btn btn-primary btn-sm" onclick='window.open(window.getGmailComposeLink("Enquiry #${rec.id} - ${rec.motorcycle.basePlatform}", "Customer: ${rec.customer.fullName} (${rec.customer.phoneNumber})\\nModel: ${rec.motorcycle.basePlatform}\\nVision: ${rec.projectVision.replace(/"/g, '\\"')}"), "_blank")' style="padding: 0.3rem 0.65rem; font-size: 0.725rem;">
          <span class="material-symbols-outlined" style="font-size: 0.9rem;">mail</span> GMAIL
        </button>
      </div>
    </div>
  `).join('');
}

function showError(field, message) {
  field.classList.add('error');
  const errorEl = document.createElement('div');
  errorEl.className = 'error-message';
  errorEl.textContent = message;
  field.parentNode.appendChild(errorEl);
  field.focus();
}

window.exportAllEnquiriesJSON = function() {
  const records = window.getEnquiriesJSON ? window.getEnquiriesJSON() : [];
  if (records.length === 0) {
    alert('No stored inquiries to export. Submit an enquiry first!');
    return;
  }
  window.downloadJSONFile(records, `shayaan-all-enquiries-${Date.now()}.json`);
};

window.clearEnquiriesJSON = function() {
  if (confirm('Are you sure you want to clear locally stored inquiry history?')) {
    localStorage.removeItem('atelier_enquiries_json');
    renderEnquiriesLedger();
  }
};

