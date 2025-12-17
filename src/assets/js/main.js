// Mitt Psyke – Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initThemeToggle();
  initPortalToc();
});

/**
 * Mobile navigation toggle
 */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  const nav = document.querySelector('.main-nav');

  if (!toggle || !navList || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen);
    toggle.classList.toggle('is-open', isOpen);
    nav.classList.toggle('is-open', isOpen);
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (
      !e.target.closest('.main-nav') &&
      !e.target.closest('.nav-toggle') &&
      navList.classList.contains('is-open')
    ) {
      navList.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.classList.remove('is-open');
      nav.classList.remove('is-open');
    }
  });

  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navList.classList.contains('is-open')) {
      navList.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.classList.remove('is-open');
      nav.classList.remove('is-open');
      toggle.focus();
    }
  });
}

/**
 * Theme toggle (light/dark)
 */
function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  // Check for saved preference or system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  toggle.addEventListener('click', () => {
    const root = document.documentElement;
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      return;
    }

    root.classList.add('theme-transition');
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    window.clearTimeout(initThemeToggle._transitionTimeout);
    initThemeToggle._transitionTimeout = window.setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 260);
  });
}

/**
 * Portal table of contents (based on h2 in portal content)
 */
function initPortalToc() {
  const toc = document.getElementById('portalToc');
  const article = document.querySelector('.portal-article');
  const tocCard = document.querySelector('.portal-toc-card');

  if (!toc || !article || !tocCard) return;

  const headings = Array.from(article.querySelectorAll('h2, h3')).filter(
    (heading) => !heading.hasAttribute('data-toc-exclude')
  );
  if (headings.length < 1) return;

  const usedIds = new Set();
  for (const heading of headings) {
    if (!heading.id) {
      heading.id = getUniqueId(slugify(heading.textContent || ''), usedIds);
    } else {
      heading.id = getUniqueId(heading.id, usedIds);
    }
  }

  toc.innerHTML = headings
    .map(
      (heading) =>
        `<li class="portal-toc-item portal-toc-item--${heading.tagName.toLowerCase()}">` +
        `<a href="#${heading.id}">${escapeHtml(heading.textContent || '')}</a>` +
        `</li>`
    )
    .join('');

  tocCard.hidden = false;
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function getUniqueId(baseId, usedIds) {
  const normalized = baseId || 'section';
  let candidate = normalized;
  let i = 2;
  while (usedIds.has(candidate)) {
    candidate = `${normalized}-${i}`;
    i += 1;
  }
  usedIds.add(candidate);
  return candidate;
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
