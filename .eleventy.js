module.exports = function (eleventyConfig) {
  const MarkdownIt = require('markdown-it');

  const DEFAULT_BROAD_TAGS = [
    'psykiskhalsa',
    'samtal',
    'anonymt',
    'webb',
    'telefon',
    'chatt',
    'sms',
    'mejl',
    'e-post'
  ];

  const normalizePortalTagValue = (tag) => {
    const t = String(tag ?? '').trim().toLowerCase();
    if (!t) return '';

    const map = {
      'psykisk-ohalsa': 'psykiskhalsa',
      'valdsbrott': 'valdbrott',
      ptsd: 'trauma',
      panikangest: 'angest',
      nedstamdhet: 'depression',
      oro: 'angest',
      ungdom: 'barn-unga',
      samtalsstod: 'samtal',
      kris: 'akut'
    };

    return map[t] ?? t;
  };

  // Kopiera assets till output
  eleventyConfig.addPassthroughCopy('src/assets');

  // Watch för CSS och JS ändringar
  eleventyConfig.addWatchTarget('src/assets/');

  // Collection: Portaler (ämnes-sidor)
  eleventyConfig.addCollection('portaler', (collectionApi) => {
    return collectionApi
      .getFilteredByTag('portal')
      .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
  });

  // Shortcode: Icons (line by default, solid on hover/active via CSS)
  eleventyConfig.addNunjucksShortcode('icon', (id, className = '') => {
    if (!id) return '';

    const escapeAttr = (value) =>
      String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('"', '&quot;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');

    const safeId = escapeAttr(id);
    const safeClass = escapeAttr(className);
    const classes = ['icon-swap', safeClass].filter(Boolean).join(' ');
    const hrefLine = `/assets/symbols/line.svg#${safeId}`;
    const hrefSolid = `/assets/symbols/solid.svg#${safeId}`;

    return (
      `<span class="${classes}" aria-hidden="true">` +
      `<svg class="icon icon--line" focusable="false" aria-hidden="true">` +
      `<use href="${hrefLine}" xlink:href="${hrefLine}"></use>` +
      `</svg>` +
      `<svg class="icon icon--solid" focusable="false" aria-hidden="true">` +
      `<use href="${hrefSolid}" xlink:href="${hrefSolid}"></use>` +
      `</svg>` +
      `</span>`
    );
  });

  // Lägg till ett filter för svenska datum
  eleventyConfig.addFilter('svenskDatum', (dateObj) => {
    return new Date(dateObj).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  // Random filter för citat
  eleventyConfig.addFilter('random', (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
  });

  // Truncate text by word count (for card excerpts etc.)
  eleventyConfig.addFilter('truncateWords', (value, maxWords = 15, suffix = '…') => {
    const text = String(value ?? '').trim();
    if (!text) return '';

    const words = text.split(/\s+/).filter(Boolean);
    if (words.length <= maxWords) return text;

    return `${words.slice(0, Math.max(0, maxWords)).join(' ')}${suffix}`;
  });

  // Filter för tel:-länkar från stödlinje-nummer
  eleventyConfig.addFilter('telHref', (value) => {
    return String(value ?? '').replace(/[^0-9+]/g, '');
  });

  // Normalize portal tags to match supportline tags/categories.
  eleventyConfig.addFilter('normalizePortalTag', (tag) => {
    return normalizePortalTagValue(tag);
  });

  // Rank & limit supportlines shown on portal pages.
  // Goal: avoid "everything matches" when a portal includes broad tags like `psykiskhalsa`.
  eleventyConfig.addFilter('relevantSupportlines', (supportlines, portalTags, limit = 9, options) => {
    const opts = options && typeof options === 'object' ? options : {};
    const lines = Array.isArray(supportlines) ? supportlines : [];
    const rawTags = Array.isArray(portalTags)
      ? portalTags
      : portalTags
        ? [portalTags]
        : [];

    const normalizedTags = rawTags
      .map((t) => normalizePortalTagValue(t))
      .filter(Boolean)
      .filter((t) => t !== 'portal');

    const portalTagSet = new Set(normalizedTags);

    const broadTags = new Set(
      (Array.isArray(opts.broadTags) && opts.broadTags.length ? opts.broadTags : DEFAULT_BROAD_TAGS).map(
        normalizePortalTagValue
      )
    );

    const specificTags = new Set(normalizedTags.filter((t) => !broadTags.has(t)));

    const tagWeights = {
      suicid: 5,
      sjalvskada: 5,
      valdbrott: 4,
      vald: 4,
      trauma: 4,
      sorg: 3,
      angest: 3,
      missbruk: 3,
      spelproblem: 3,
      'barn-unga': 3,
      akut: 2,
      anhorig: 2,
      anhoriga: 2,
      'killar-man': 2,
      hbtqi: 2,
      stodgrupp: 1,
      myndighet: 1
    };

    const hintedCategories = new Set();
    if (portalTagSet.has('valdbrott') || portalTagSet.has('vald')) hintedCategories.add('vald');
    if (portalTagSet.has('missbruk') || portalTagSet.has('spelproblem')) hintedCategories.add('missbruk');
    if (portalTagSet.has('barn-unga') || portalTagSet.has('ungdom')) hintedCategories.add('barn-unga');
    if (portalTagSet.has('anhorig') || portalTagSet.has('anhoriga')) hintedCategories.add('anhoriga');
    if (portalTagSet.has('aldre')) hintedCategories.add('aldre');

    if (
      hintedCategories.size === 0 &&
      (portalTagSet.has('psykiskhalsa') ||
        portalTagSet.has('suicid') ||
        portalTagSet.has('sjalvskada') ||
        portalTagSet.has('angest') ||
        portalTagSet.has('trauma') ||
        portalTagSet.has('sorg') ||
        portalTagSet.has('depression'))
    ) {
      hintedCategories.add('psykiskhalsa');
    }

    const scoreLine = (line) => {
      const lineTags = new Set(line?.tags ?? []);
      let matchCount = 0;
      let matchScore = 0;
      for (const tag of specificTags) {
        if (lineTags.has(tag)) {
          matchCount += 1;
          matchScore += tagWeights[tag] ?? 1;
        }
      }

      let score = matchScore * 10;
      if (line?.urgent) score += 2;
      if (hintedCategories.has(line?.category)) score += 3;
      if (portalTagSet.has('akut') && lineTags.has('akut')) score += 2;

      return { line, score, matchCount };
    };

    const scored = lines.map(scoreLine);

    let candidates = scored.filter((x) => x.score > 0);

    const allowCategoryFallback = opts.allowCategoryFallback !== false;
    if (allowCategoryFallback && candidates.length === 0 && hintedCategories.size > 0) {
      candidates = scored.filter((x) => hintedCategories.has(x.line?.category));
    }

    candidates.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (Number(Boolean(b.line?.urgent)) !== Number(Boolean(a.line?.urgent))) {
        return Number(Boolean(b.line?.urgent)) - Number(Boolean(a.line?.urgent));
      }
      if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
      return String(a.line?.name ?? '').localeCompare(String(b.line?.name ?? ''), 'sv');
    });

    const max = Math.max(1, Number(limit) || 9);
    return candidates.slice(0, max).map((x) => x.line);
  });

  // Render safe inline markdown (useful for references list items)
  const mdInline = new MarkdownIt({ html: false, linkify: true, breaks: false });
  eleventyConfig.addFilter('mdInline', (value) => mdInline.renderInline(String(value ?? '')));

  // Shortcode för årtal (för copyright etc)
  eleventyConfig.addShortcode('year', () => `${new Date().getFullYear()}`);

  return {
    dir: {
      input: 'src',
      output: 'site',
      includes: '_includes',
      data: '_data'
    },
    templateFormats: ['njk', 'md', 'html'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk'
  };
};
