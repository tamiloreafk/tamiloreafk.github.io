// ============================================================
// Shiloh Oni — Portfolio interactions
// ============================================================

(function () {
  'use strict';

  /* ----- Theme system ----- */
  const THEME_KEY = 'shiloh-theme';
  const root = document.documentElement;

  function applyTheme(theme) { root.setAttribute('data-theme', theme); }
  function getStoredTheme() { try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; } }
  function setStoredTheme(theme) { try { localStorage.setItem(THEME_KEY, theme); } catch (e) {} }

  const stored = getStoredTheme();
  if (stored) applyTheme(stored);
  else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) applyTheme('light');
  else applyTheme('dark');

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      setStoredTheme(next);
    });
  }

  /* ----- Mobile nav ----- */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navList = document.getElementById('navList');

  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    navList.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (navList.classList.contains('is-open')) {
          navList.classList.remove('is-open');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /* ----- Scroll-based nav border ----- */
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 12) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----- Smooth scroll with nav offset ----- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId.length < 2) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = nav ? nav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ----- Typed role animation ----- */
  const roleEl = document.getElementById('roleType');
  if (roleEl && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const roles = [
      'ML Researcher',
      'Veterinary Doctor',
      'Multilingual NLP',
      'CV for Healthcare',
      'Research Methodologist'
    ];
    let idx = 0, char = 0, deleting = false;
    function tick() {
      const current = roles[idx];
      if (!deleting) {
        char++;
        roleEl.textContent = current.slice(0, char);
        if (char === current.length) { deleting = true; setTimeout(tick, 1800); return; }
        setTimeout(tick, 60 + Math.random() * 40);
      } else {
        char--;
        roleEl.textContent = current.slice(0, char);
        if (char === 0) { deleting = false; idx = (idx + 1) % roles.length; }
        setTimeout(tick, 30);
      }
    }
    setTimeout(tick, 600);
  }

  /* ----- Radar chart for Proficiency section ----- */
  function renderRadar() {
    const container = document.getElementById('profRadar');
    if (!container) return;
    const data = [
      { label: 'Multilingual NLP',    score: 85 },
      { label: 'Computer Vision',     score: 82 },
      { label: 'Few-Shot Learning',   score: 80 },
      { label: 'Medical Imaging',     score: 75 },
      { label: 'Information Retrieval', score: 84 },
      { label: 'Research Methodology', score: 88 }
    ];
    const size = 460, cx = size / 2, cy = size / 2, R = 140;
    const n = data.length;
    const angles = data.map((_, i) => -Math.PI / 2 + i * (2 * Math.PI / n));
    const point = (a, r) => `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;

    const grids = [0.25, 0.5, 0.75, 1].map(level =>
      `<polygon points="${angles.map(a => point(a, R * level)).join(' ')}" class="radar-grid" />`
    ).join('');

    const spokes = angles.map(a =>
      `<line x1="${cx}" y1="${cy}" x2="${cx + R * Math.cos(a)}" y2="${cy + R * Math.sin(a)}" class="radar-spoke" />`
    ).join('');

    const dataPolyPoints = data.map((d, i) => point(angles[i], R * d.score / 100)).join(' ');
    const dataDots = data.map((d, i) => {
      const r = R * d.score / 100;
      return `<circle cx="${(cx + r * Math.cos(angles[i])).toFixed(2)}" cy="${(cy + r * Math.sin(angles[i])).toFixed(2)}" r="4" class="radar-dot" />`;
    }).join('');

    const labels = data.map((d, i) => {
      const labelR = R + 22;
      const x = cx + labelR * Math.cos(angles[i]);
      const y = cy + labelR * Math.sin(angles[i]);
      let anchor = 'middle';
      if (x < cx - 10) anchor = 'end';
      else if (x > cx + 10) anchor = 'start';
      return `<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" class="radar-label" text-anchor="${anchor}" dominant-baseline="middle">${d.label}</text>`;
    }).join('');

    container.innerHTML = `
      <svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        ${grids}
        ${spokes}
        <polygon points="${dataPolyPoints}" class="radar-data" style="opacity:0; transition: opacity .8s ease;" />
        <g class="radar-dots" style="opacity:0; transition: opacity .8s ease .2s;">${dataDots}</g>
        ${labels}
      </svg>
    `;
  }
  renderRadar();

  /* ----- Reveal-on-scroll + proficiency animations ----- */
  if ('IntersectionObserver' in window) {
    const revealEls = document.querySelectorAll(
      '.section__head, .section__title, .section__lede, .role, .project, .paper, .skill-group, .about, .awards, .hero__float'
    );
    revealEls.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
      el.style.transition = 'opacity .55s ease, transform .55s ease';
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, Math.min(i * 40, 200));
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => observer.observe(el));

    const bars = document.querySelectorAll('.prof-bar');
    if (bars.length) {
      const barObs = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('is-visible'), i * 80);
            barObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      bars.forEach((b) => barObs.observe(b));
    }

    const radar = document.getElementById('profRadar');
    if (radar) {
      const radarObs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const svg = entry.target.querySelector('svg');
            if (svg) {
              const poly = svg.querySelector('.radar-data');
              const dots = svg.querySelector('.radar-dots');
              if (poly) poly.style.opacity = '1';
              if (dots) dots.style.opacity = '1';
            }
            radarObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      radarObs.observe(radar);
    }
  }

  /* ----- Reduced motion ----- */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[style*="opacity: 0"]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.transition = 'none';
    });
  }
})();
