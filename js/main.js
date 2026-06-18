/* ─── Nav scroll state ───────────────────────────────────────────────────── */
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ─── Mobile menu ────────────────────────────────────────────────────────── */
const menuBtn    = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

function toggleMenu(open) {
  menuBtn.classList.toggle('open', open);
  mobileMenu.classList.toggle('open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  menuBtn.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
}

menuBtn.addEventListener('click', () => {
  toggleMenu(!menuBtn.classList.contains('open'));
});

document.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => toggleMenu(false));
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
    toggleMenu(false);
  }
});

/* ─── Scroll reveal (IntersectionObserver) ───────────────────────────────── */
function staggerReveal(entries, observer) {
  const groups = new Map();

  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const parent = entry.target.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(entry.target);
  });

  groups.forEach(siblings => {
    siblings.forEach((el, i) => {
      // 70ms stagger between siblings, capped at 280ms
      el.style.transitionDelay = `${Math.min(i * 70, 280)}ms`;
      el.classList.add('visible');
      observer.unobserve(el);
    });
  });
}

const revealObserver = new IntersectionObserver(staggerReveal, {
  threshold: 0.08,
  rootMargin: '0px 0px -48px 0px',
});

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ─── Stat count-up ──────────────────────────────────────────────────────── */
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  if (isNaN(target)) return;

  const prefix   = el.dataset.prefix || '';
  const suffix   = el.dataset.suffix || '';
  const duration = 1100;
  const start    = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = prefix + Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

const statsBand = document.querySelector('.stats-band');
if (statsBand) {
  const statObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('[data-count]').forEach(animateCount);
      statObserver.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  statObserver.observe(statsBand);
}

/* ─── Active nav link on scroll ──────────────────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  });
}, { threshold: 0.35 });

sections.forEach(s => sectionObserver.observe(s));

/* ─── Contact form (Formspree) ───────────────────────────────────────────── */
const form       = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const btn   = form.querySelector('.btn-submit');
    const label = btn.querySelector('.btn-label');
    const orig  = label.textContent;

    btn.disabled      = true;
    label.textContent = 'Sending…';
    formStatus.textContent = '';
    formStatus.className   = 'form-status';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        label.textContent       = 'Sent!';
        formStatus.textContent  = 'Thanks — I’ll be in touch shortly.';
        formStatus.className    = 'form-status success';
        form.reset();
      } else {
        throw new Error();
      }
    } catch {
      label.textContent      = 'Try again';
      formStatus.textContent = 'Something went wrong. Email me directly instead.';
      formStatus.className   = 'form-status error';
    } finally {
      setTimeout(() => {
        label.textContent = orig;
        btn.disabled = false;
      }, 3500);
    }
  });
}

/* ─── Research bar animation ─────────────────────────────────────────────── */
const barPanels = document.querySelectorAll('[data-bar-panel]');
if (barPanels.length) {
  const barObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.rbar-fill').forEach((bar, i) => {
        bar.style.transitionDelay = `${i * 180}ms`;
        bar.style.width = bar.dataset.w;
      });
      barObserver.unobserve(entry.target);
    });
  }, { threshold: 0.35 });
  barPanels.forEach(p => barObserver.observe(p));
}

/* ─── Footer year ────────────────────────────────────────────────────────── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
