/* ============================================================
   SALON DE L'UNION — main.js
   Countdown · Navbar · Scroll reveal · Forms · Billetterie
   ============================================================ */

/* ── Navbar ─────────────────────────────────────────────────── */
(function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-menu a');

  function updateNav() {
    if (window.scrollY > 60) {
      nav.classList.remove('transparent');
      nav.classList.add('scrolled');
    } else {
      nav.classList.add('transparent');
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      if (isOpen) {
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
      } else {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Active link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

/* ── Countdown ──────────────────────────────────────────────── */
(function initCountdown() {
  const target = new Date('2027-02-12T18:00:00');

  const elJours   = document.getElementById('cd-jours');
  const elHeures  = document.getElementById('cd-heures');
  const elMinutes = document.getElementById('cd-minutes');
  const elSecondes = document.getElementById('cd-secondes');

  if (!elJours) return;

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now  = new Date();
    const diff = target - now;

    if (diff <= 0) {
      elJours.textContent   = '00';
      elHeures.textContent  = '00';
      elMinutes.textContent = '00';
      elSecondes.textContent = '00';
      return;
    }

    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000)  / 60000);
    const seconds = Math.floor((diff % 60000)    / 1000);

    elJours.textContent    = pad(days);
    elHeures.textContent   = pad(hours);
    elMinutes.textContent  = pad(minutes);
    elSecondes.textContent = pad(seconds);
  }

  tick();
  setInterval(tick, 1000);
})();

/* ── Scroll Reveal (Intersection Observer) ──────────────────── */
(function initReveal() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* ── Billetterie : Calcul total temps réel ──────────────────── */
(function initBilletterie() {
  const form = document.getElementById('form-billetterie');
  if (!form) return;

  const PRICES = { standard: 4, vip: 15 };

  const selectType = document.getElementById('pass-type');
  const inputQty   = document.getElementById('nb-personnes');
  const totalEl    = document.getElementById('total-amount');
  const summaryEl  = document.getElementById('summary-text');

  function updateTotal() {
    const type = selectType ? selectType.value : 'standard';
    const qty  = parseInt(inputQty ? inputQty.value : 1, 10) || 1;
    const price = PRICES[type] || 4;
    const total = price * qty;

    if (totalEl) totalEl.textContent = total + ' €';
    if (summaryEl) {
      const label = type === 'vip' ? 'Pass VIP' : 'Entrée Standard';
      summaryEl.textContent = `${qty} × ${label} (${price} €)`;
    }
  }

  if (selectType) selectType.addEventListener('change', updateTotal);
  if (inputQty)   inputQty.addEventListener('input', updateTotal);
  updateTotal();

  /* Highlight VIP card when selected */
  if (selectType) {
    selectType.addEventListener('change', () => {
      document.querySelectorAll('.ticket-card').forEach(c => c.classList.remove('selected-ticket'));
      const selected = selectType.value;
      const card = document.querySelector(`.ticket-card[data-type="${selected}"]`);
      if (card) card.classList.add('selected-ticket');
    });
  }

  /* Ticket card click → select pass */
  document.querySelectorAll('.ticket-choose').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      if (selectType) {
        selectType.value = type;
        selectType.dispatchEvent(new Event('change'));
      }
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

/* ── Form Validation (generic) ──────────────────────────────── */
(function initForms() {
  function validateField(input) {
    const group = input.closest('.form-group');
    const error = group ? group.querySelector('.form-error') : null;
    let valid = true;
    let msg   = '';

    const val = input.value.trim();

    if (input.required && !val) {
      valid = false;
      msg = 'Ce champ est requis.';
    } else if (input.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      valid = false;
      msg = 'Adresse email invalide.';
    } else if (input.type === 'tel' && val && !/^[+0-9\s\-().]{7,}$/.test(val)) {
      valid = false;
      msg = 'Numéro de téléphone invalide.';
    }

    if (!valid) {
      input.classList.add('error');
      if (error) { error.textContent = msg; error.classList.add('visible'); }
    } else {
      input.classList.remove('error');
      if (error) error.classList.remove('visible');
    }

    return valid;
  }

  document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });

  document.querySelectorAll('form.validated-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let allValid = true;

      form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
        if (!validateField(input)) allValid = false;
      });

      const checkbox = form.querySelector('input[type="checkbox"][required]');
      if (checkbox && !checkbox.checked) {
        allValid = false;
        const err = checkbox.closest('.form-group')?.querySelector('.form-error');
        if (err) { err.textContent = 'Vous devez accepter la politique de confidentialité.'; err.classList.add('visible'); }
      }

      if (!allValid) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi en cours…';
      }

      setTimeout(() => {
        const action = form.dataset.action;
        if (action === 'billetterie') {
          // Gather data and redirect to paiement
          const prenom = form.querySelector('#prenom')?.value || '';
          const nom    = form.querySelector('#nom')?.value || '';
          const type   = form.querySelector('#pass-type')?.value || 'standard';
          const qty    = form.querySelector('#nb-personnes')?.value || 1;
          const email  = form.querySelector('#email')?.value || '';
          const params = new URLSearchParams({ prenom, nom, type, qty, email });
          window.location.href = 'paiement.html?' + params.toString();
        } else {
          // Generic: show toast and reset
          showToast('Message envoyé avec succès ! Nous vous répondrons sous 48h.');
          form.reset();
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitBtn.dataset.label || 'Envoyer'; }
        }
      }, 800);
    });
  });
})();

/* ── Paiement : Préfill depuis URL params ───────────────────── */
(function initPaiement() {
  const summary = document.getElementById('paiement-summary');
  if (!summary) return;

  const params = new URLSearchParams(window.location.search);
  const prenom = params.get('prenom') || '';
  const nom    = params.get('nom') || '';
  const type   = params.get('type') || 'standard';
  const qty    = parseInt(params.get('qty') || '1', 10);
  const email  = params.get('email') || '';

  const PRICES = { standard: 4, vip: 15 };
  const LABELS = { standard: 'Entrée Standard', vip: 'Pass VIP' };

  const price = PRICES[type] || 4;
  const total = price * qty;
  const label = LABELS[type] || 'Entrée Standard';

  summary.innerHTML = `
    <div class="recap-row"><span>Titulaire</span><strong>${prenom} ${nom}</strong></div>
    <div class="recap-row"><span>Email</span><strong>${email}</strong></div>
    <div class="recap-row"><span>Type</span><strong>${label}</strong></div>
    <div class="recap-row"><span>Quantité</span><strong>${qty}</strong></div>
    <div class="recap-row recap-total"><span>Total</span><strong>${total} €</strong></div>
  `;

  const totalPay = document.getElementById('total-paiement');
  if (totalPay) totalPay.textContent = total + ' €';

  const confirmForm = document.getElementById('form-paiement');
  if (confirmForm) {
    confirmForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = confirmForm.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Traitement…'; }
      setTimeout(() => {
        const p = new URLSearchParams({ prenom, nom, type, qty: String(qty), total: String(total) });
        window.location.href = 'confirmation.html?' + p.toString();
      }, 1200);
    });
  }
})();

/* ── Confirmation : Afficher les données ────────────────────── */
(function initConfirmation() {
  const box = document.querySelector('.confirmation-box');
  if (!box || !window.location.search) return;

  const params = new URLSearchParams(window.location.search);
  const prenom = params.get('prenom') || 'Visiteur';
  const nom    = params.get('nom')    || '';
  const type   = params.get('type')   || 'standard';
  const qty    = params.get('qty')    || '1';
  const total  = params.get('total')  || '4';
  const LABELS = { standard: 'Entrée Standard', vip: 'Pass VIP' };

  const nameEl  = document.getElementById('conf-name');
  const typeEl  = document.getElementById('conf-type');
  const qtyEl   = document.getElementById('conf-qty');
  const totalEl = document.getElementById('conf-total');

  if (nameEl)  nameEl.textContent  = prenom + ' ' + nom;
  if (typeEl)  typeEl.textContent  = LABELS[type] || type;
  if (qtyEl)   qtyEl.textContent   = qty;
  if (totalEl) totalEl.textContent = total + ' €';

  // Generate decorative QR code pattern
  const qr = document.querySelector('.qr-code');
  if (qr) {
    const pattern = [
      1,1,1,0,1,1,1,
      1,0,1,0,1,0,1,
      1,1,1,1,0,1,0,
      0,1,0,0,1,0,1,
      1,0,1,1,0,1,0,
      1,0,1,0,0,1,1,
      1,1,0,1,1,1,1,
    ];
    qr.innerHTML = pattern.map(p =>
      `<div style="opacity:${p ? 1 : 0}"></div>`
    ).join('');
  }
})();

/* ── Toast helper ───────────────────────────────────────────── */
function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

/* ── Exposant form : confirmation inline ────────────────────── */
(function initExposantForm() {
  const form = document.getElementById('form-exposant');
  if (!form) return;

  form.dataset.action = 'generic';
  form.classList.add('validated-form');
})();

/* ── Sponsor form ───────────────────────────────────────────── */
(function initSponsorPackage() {
  document.querySelectorAll('.pkg-choose').forEach(btn => {
    btn.addEventListener('click', () => {
      const pkg = btn.dataset.pkg;
      const select = document.getElementById('pkg-select');
      if (select) {
        select.value = pkg;
        const form = document.getElementById('form-sponsor');
        if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
