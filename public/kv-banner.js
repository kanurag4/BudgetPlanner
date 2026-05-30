(function () {
  // Update LATEST when publishing a new article.
  const LATEST = {
    title: 'How to Value a Stock: DCF and the Dividend Discount Model',
    href: '/articles/dcf-ddm-stock-valuation/'
  };

  const style = document.createElement('style');
  style.textContent = `
    .kv-article-banner {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 16px;
      height: 40px;
      background: #1e293b;
      border-left: 3px solid #38bdf8;
      border-bottom: 1px solid #334155;
      font-size: 0.82rem;
      overflow: hidden;
    }
    .kv-article-banner-label {
      color: #94a3b8;
      flex-shrink: 0;
      white-space: nowrap;
    }
    .kv-article-banner a {
      color: #f1f5f9;
      text-decoration: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color 0.15s;
    }
    .kv-article-banner a:hover { color: #38bdf8; }
    html:not(.dark) .kv-article-banner {
      background: #d4dce8;
      border-left-color: #0369a1;
      border-bottom-color: #e2e8f0;
    }
    html:not(.dark) .kv-article-banner-label { color: #64748b; }
    html:not(.dark) .kv-article-banner a { color: #0f172a; }
    html:not(.dark) .kv-article-banner a:hover { color: #0369a1; }
    @media (max-width: 600px) {
      .kv-article-banner { font-size: 0.75rem; padding: 0 12px; }
    }
  `;
  document.head.appendChild(style);

  function buildBanner() {
    const div = document.createElement('div');
    div.className = 'kv-article-banner';
    div.innerHTML =
      '<span class="kv-article-banner-label">Hot article:</span>' +
      '<a href="' + LATEST.href + '">' + LATEST.title + ' →</a>';
    return div;
  }

  function tryInsert() {
    if (document.querySelector('.kv-article-banner')) return true;
    const nav = document.querySelector('.kv-tool-nav');
    if (nav) { nav.insertAdjacentElement('afterend', buildBanner()); return true; }
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

  if (document.body) { init(); } else { document.addEventListener('DOMContentLoaded', init); }
}());
