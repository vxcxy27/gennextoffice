(() => {
  const config = window.GNO_SITE || {};
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];

  // Where the Flask backend (app.py) is running. Change this once you
  // deploy it - see backend/README.txt.
  const BASE_URL = 'http://localhost:5000';
  const ENQUIRY_URL = BASE_URL + '/send-enquiry';
  const DEVICE_CHECK_URL = BASE_URL + '/check-device';

  // mobile menu
  const menuBtn = qs('[data-menu-button]');
  const nav = qs('[data-nav]');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open', !open);
    });
    qsa('a', nav).forEach(a => a.addEventListener('click', () => {
      menuBtn.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
    }));
  }

  // header on scroll
  const header = qs('.site-header');
  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // scroll progress bar
  const progress = qs('[data-scroll-progress]');
  if (progress) {
    const updateProgress = () => {
      const h = document.documentElement;
      const scrollable = h.scrollHeight - h.clientHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      progress.style.width = pct + '%';
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
  }

  // sticky mobile CTA bar
  const mobileCta = qs('[data-mobile-cta]');
  if (mobileCta) {
    const toggleCta = () => mobileCta.classList.toggle('visible', window.scrollY > 480);
    toggleCta();
    window.addEventListener('scroll', toggleCta, { passive: true });
  }

  // theme toggle (light/dark)
  const themeToggle = qs('[data-theme-toggle]');
  const root = document.documentElement;
  const storedTheme = (() => { try { return localStorage.getItem('gno-theme'); } catch (e) { return null; } })();
  if (storedTheme) root.setAttribute('data-theme', storedTheme);
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      if (next === 'dark') root.setAttribute('data-theme', 'dark'); else root.removeAttribute('data-theme');
      try { localStorage.setItem('gno-theme', next); } catch (e) {}
    });
  }

  // footer year
  const year = qs('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  // contact details: only show links that are actually configured,
  // instead of leaking setup instructions to visitors
  const hasEmail = !!config.salesEmail;
  const hasPhone = !!config.phone;
  const hasWhatsapp = !!config.whatsapp;

  qsa('[data-config-email]').forEach(el => {
    if (!hasEmail) { el.hidden = true; return; }
    el.hidden = false;
    el.textContent = config.salesEmail;
    if (el.tagName === 'A') el.href = `mailto:${config.salesEmail}`;
  });
  qsa('[data-config-phone]').forEach(el => {
    if (!hasPhone) { el.hidden = true; return; }
    el.hidden = false;
    el.textContent = config.phone;
    if (el.tagName === 'A') el.href = `tel:${config.phone.replace(/\s/g, '')}`;
  });
  qsa('[data-whatsapp]').forEach(el => {
    if (!hasWhatsapp) { el.hidden = true; return; }
    const wa = config.whatsapp.replace(/\D/g, '');
    el.hidden = false;
    el.href = `https://wa.me/${wa}?text=${encodeURIComponent('Hello, I would like to know more about GenNextOffice.')}`;
    el.target = '_blank';
    el.rel = 'noopener';
  });
  qsa('[data-company]').forEach(el => { if (config.companyName) el.textContent = config.companyName; });
  qsa('[data-contact-fallback]').forEach(el => {
    el.hidden = hasEmail || hasPhone || hasWhatsapp;
  });
  qsa('[data-demo-link]').forEach(el => {
    if (config.demoUrl) { el.href = config.demoUrl; el.target = '_blank'; el.rel = 'noopener'; }
  });

  // shared helper: POST a form's data to the backend as JSON
  const postJson = async (url, payload) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok && data.status === 'success', data };
  };

  // demo form -> emails the backend (app.py) instead of opening mailto
  const form = qs('#demo-form');
  const status = qs('#form-status');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const company = String(data.get('company') || '').trim();
      const email = String(data.get('email') || '').trim();
      const phone = String(data.get('phone') || '').trim();
      const message = String(data.get('message') || '').trim();

      if (!name || !email) {
        if (status) { status.textContent = 'Please add your name and email so we can reply.'; status.classList.add('is-error'); }
        return;
      }
      status?.classList.remove('is-error');

      const submitBtn = qs('button[type="submit"]', form);
      if (submitBtn) submitBtn.disabled = true;
      if (status) status.textContent = 'Sending…';

      try {
        const { ok, data: result } = await postJson(ENQUIRY_URL, { name, company, email, phone, message });
        if (ok) {
          if (status) status.textContent = 'Thanks! Your enquiry has been sent.';
          form.reset();
        } else {
          if (status) { status.textContent = result.message || 'Something went wrong. Please try again.'; status.classList.add('is-error'); }
        }
      } catch (err) {
        if (status) { status.textContent = 'Could not reach the server. Please try again later.'; status.classList.add('is-error'); }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // ROI / time-savings calculator
  const roiEmployees = qs('[data-roi-employees]');
  const roiHours = qs('[data-roi-hours]');
  const roiProcess = qs('[data-roi-process]');
  if (roiEmployees && roiHours && roiProcess) {
    const employeesLabel = qs('[data-roi-employees-value]');
    const hoursLabel = qs('[data-roi-hours-value]');
    const summaryLabel = qs('[data-roi-summary]');
    const hoursSavedOut = qs('[data-roi-hours-saved]');
    const daysSavedOut = qs('[data-roi-days-saved]');
    const calc = () => {
      const employees = parseInt(roiEmployees.value, 10);
      const hours = parseInt(roiHours.value, 10);
      const factor = parseFloat(roiProcess.value);
      if (employeesLabel) employeesLabel.textContent = `${employees} employees`;
      if (hoursLabel) hoursLabel.textContent = `${hours} hrs/week`;
      const savedPerWeek = hours * factor;
      const savedPerMonth = Math.round(savedPerWeek * 4.33);
      const daysSaved = Math.round((savedPerMonth / 8) * 10) / 10;
      if (hoursSavedOut) hoursSavedOut.textContent = savedPerMonth;
      if (daysSavedOut) daysSavedOut.textContent = daysSaved;
      if (summaryLabel) summaryLabel.textContent = `For a team of ${employees}, spending ${hours} hrs/week on manual admin:`;
    };
    [roiEmployees, roiHours, roiProcess].forEach(el => el.addEventListener('input', calc));
    calc();
  }

  // device compatibility check form -> emails the backend (app.py) instead of opening mailto
  const deviceForm = qs('#device-check-form');
  const deviceStatus = qs('#device-check-status');
  if (deviceForm) {
    deviceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(deviceForm);
      const device = String(data.get('device') || '').trim();
      const email = String(data.get('email') || '').trim();
      if (!device || !email) {
        if (deviceStatus) { deviceStatus.textContent = 'Please add the device model and your email.'; deviceStatus.classList.add('is-error'); }
        return;
      }
      deviceStatus?.classList.remove('is-error');

      const submitBtn = qs('button[type="submit"]', deviceForm);
      if (submitBtn) submitBtn.disabled = true;
      if (deviceStatus) deviceStatus.textContent = 'Sending…';

      try {
        const { ok, data: result } = await postJson(DEVICE_CHECK_URL, { device, email });
        if (ok) {
          if (deviceStatus) deviceStatus.textContent = "Thanks! We'll confirm compatibility shortly.";
          deviceForm.reset();
        } else {
          if (deviceStatus) { deviceStatus.textContent = result.message || 'Something went wrong. Please try again.'; deviceStatus.classList.add('is-error'); }
        }
      } catch (err) {
        if (deviceStatus) { deviceStatus.textContent = 'Could not reach the server. Please try again later.'; deviceStatus.classList.add('is-error'); }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // scroll reveal
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.12 }) : null;
  qsa('[data-reveal], [data-reveal-stagger]').forEach(el => observer ? observer.observe(el) : el.classList.add('visible'));

  // --- live shift-clock hand + digital readout in hero ---
  const clockTime = qs('[data-clock-time]');
  const clockDate = qs('[data-clock-date]');
  const hand = qs('[data-clock-hand]');
  if (clockTime || hand) {
    const tick = () => {
      const now = new Date();
      if (clockTime) clockTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (clockDate) clockDate.textContent = now.toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short' });
      if (hand) {
        const angle = ((now.getHours() % 24) / 24) * 360 + (now.getMinutes() / 24 / 60) * 360;
        hand.style.transform = `translate(-50%,-100%) rotate(${angle}deg)`;
      }
      // highlight the arc for the current shift period
      const hour = now.getHours();
      const period = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
      qsa('.shift-clock .arc').forEach(arc => arc.classList.toggle('is-current', arc.classList.contains('arc-' + period)));
      qsa('.shift-legend span').forEach(el => {
        el.classList.toggle('is-current-label', el.textContent.toLowerCase().startsWith(period));
      });
    };
    tick();
    setInterval(tick, 1000);
  }

  // --- count-up for mono stat numbers ---
  const counters = qsa('[data-count-to]');
  if (counters.length && 'IntersectionObserver' in window) {
    const countObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.countTo);
        const suffix = el.dataset.countSuffix || '';
        const decimals = el.dataset.countTo.includes('.') ? 1 : 0;
        const duration = 1100;
        const start = performance.now();
        const step = (now) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        countObs.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(el => countObs.observe(el));
  }

  // --- reveal the workflow connecting line when the section scrolls in ---
  const workflowLine = qs('.workflow-line');
  if (workflowLine && 'IntersectionObserver' in window) {
    const lineObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        lineObs.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    lineObs.observe(workflowLine);
  }
})();
