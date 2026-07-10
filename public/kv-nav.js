(function () {
  const TOOLS = [
    { name: 'Stock Evaluator',  slug: 'stock' },
    { name: 'DCF Valuation',    slug: 'dcf' },
    { name: 'Gordon Growth',    slug: 'gordon-growth' },
    { name: 'Budget',           slug: 'budget' },
    { name: 'Debt Recycling',   slug: 'debt-recycling' },
    { name: 'Portfolio',        slug: 'portfolio-health' },
    { name: 'FIRE',             slug: 'fire' },
    { name: 'Mortgage Calculator', slug: 'mortgage' },
    { name: 'Salary Sacrifice', slug: 'super-compare' },
    { name: 'Rent vs Buy',      slug: 'rent-vs-buy' },
    { name: 'Life Buyback',     slug: 'life-buyback' },
    { name: 'Budget Impact',    slug: 'budget-impact' },
    { name: 'Articles',         slug: 'articles' },
  ];

  const path = window.location.pathname;
  const currentSlug = TOOLS.find(
    t => path.includes('/' + t.slug + '/') || path.endsWith('/' + t.slug)
  )?.slug;

  // CSS — nested var fallbacks: --kv-* (most tools) → --* (Stock Evaluator) → hardcoded
  const style = document.createElement('style');
  style.textContent = `
    .kv-tool-nav{display:flex;justify-content:center;overflow-x:auto;border-bottom:1px solid var(--kv-border,var(--border,#334155));background:var(--kv-bg,var(--bg,#0f172a));padding:0 16px;scrollbar-width:none;}
    .kv-tool-nav::-webkit-scrollbar{display:none;}
    .kv-tool-nav a{flex-shrink:0;padding:10px 14px;font-size:0.82rem;font-weight:500;color:var(--kv-muted,var(--muted,#94a3b8));text-decoration:none;border-bottom:2px solid transparent;white-space:nowrap;transition:color 0.15s;}
    .kv-tool-nav a:hover{color:var(--kv-text,var(--text,#f1f5f9));}
    .kv-tool-nav a.kv-nav-active{color:var(--kv-accent,var(--accent,#38bdf8));border-bottom-color:var(--kv-accent,var(--accent,#38bdf8));}
    html:not(.dark) .kv-tool-nav{background:#edf2f7;border-color:#e2e8f0;}
    html:not(.dark) .kv-tool-nav a{color:#64748b;}
    html:not(.dark) .kv-tool-nav a:hover{color:#0f172a;}
    html:not(.dark) .kv-tool-nav a.kv-nav-active{color:#0369a1;border-bottom-color:#0369a1;}
    @media(max-width:800px){.kv-tool-nav{justify-content:flex-start;}}
  `;
  document.head.appendChild(style);

  function buildNav() {
    const nav = document.createElement('nav');
    nav.className = 'kv-tool-nav';
    nav.setAttribute('aria-label', 'KashVector tools');
    nav.innerHTML = TOOLS.map(t =>
      `<a href="/${t.slug}/"${t.slug === currentSlug ? ' class="kv-nav-active" aria-current="page"' : ''}>${t.name}</a>`
    ).join('');
    return nav;
  }

  function tryInsert() {
    if (document.querySelector('.kv-tool-nav')) return true;
    const header = document.querySelector('header.app-header') || document.querySelector('header');
    if (header) {
      header.insertAdjacentElement('afterend', buildNav());
      return true;
    }
    return false;
  }

  function init() {
    if (!tryInsert()) {
      const observer = new MutationObserver(function () {
        if (tryInsert()) observer.disconnect();
      });
      observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
    }
  }

  // Run immediately if body is available (script placed after <header>) so nav is
  // part of the initial layout — no post-paint shift. Fall back to DOMContentLoaded
  // for scripts in <head> or React apps where the header isn't in DOM yet.
  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
}());
