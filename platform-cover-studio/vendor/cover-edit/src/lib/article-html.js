function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function findAsset(model, assetId) {
  return model.assets?.find((item) => item.id === assetId) || null;
}

function blockHtml(block, model) {
  switch (block.type) {
    case 'title':
      return `<h2 class="ce-article-h2">${escapeHtml(block.text)}</h2>`;
    case 'subtitle':
      return `<h3 class="ce-article-h3">${escapeHtml(block.text)}</h3>`;
    case 'lead':
      return `<p class="ce-article-lead">${escapeHtml(block.text)}</p>`;
    case 'paragraph':
      return `<p class="ce-article-p">${escapeHtml(block.text)}</p>`;
    case 'quote':
      return `<blockquote class="ce-article-quote">${escapeHtml(block.text)}</blockquote>`;
    case 'list':
      return `<ul class="ce-article-list">${(block.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
    case 'divider':
      return '<hr class="ce-article-divider" />';
    case 'callout':
      return `<aside class="ce-article-callout">${escapeHtml(block.text)}</aside>`;
    case 'code':
      return `<pre class="ce-article-code"><code>${escapeHtml(block.text)}</code></pre>`;
    case 'image': {
      const asset = findAsset(model, block.assetId);
      const src = asset?.path || block.src || '';
      const caption = block.caption || asset?.alt || '';
      if (!src) return '';
      return `<figure class="ce-article-figure"><img src="${escapeHtml(src)}" alt="${escapeHtml(asset?.alt || caption)}" /><figcaption>${escapeHtml(caption)}</figcaption></figure>`;
    }
    default:
      return block.text ? `<p class="ce-article-p">${escapeHtml(block.text)}</p>` : '';
  }
}

export function renderArticleBodyHtml(model) {
  const blocks = (model.article?.blocks || []).map((block) => blockHtml(block, model)).join('\n');
  return `
    <article class="ce-article-doc">
      <header class="ce-article-header">
        <div class="ce-article-kicker">${escapeHtml(model.target.platform.replace('-', ' / '))}</div>
        <h1 class="ce-article-title">${escapeHtml(model.article.title)}</h1>
        ${model.article.subtitle ? `<p class="ce-article-subtitle">${escapeHtml(model.article.subtitle)}</p>` : ''}
        ${model.article.summary ? `<p class="ce-article-summary">${escapeHtml(model.article.summary)}</p>` : ''}
      </header>
      <section class="ce-article-body">${blocks}</section>
    </article>
  `;
}

export function renderStandaloneArticleHtml(model) {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(model.article.title)}</title>
    <style>
      body { margin: 0; background: #f5efe4; color: #1f2937; font-family: "Noto Sans CJK SC", "Source Han Sans SC", "PingFang SC", "Hiragino Sans GB", system-ui, sans-serif; }
      .ce-article-doc { max-width: 720px; margin: 0 auto; padding: 56px 28px 80px; line-height: 1.75; }
      .ce-article-kicker { margin-bottom: 16px; color: #0f766e; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 700; }
      .ce-article-title { margin: 0; font-family: "Noto Serif CJK SC", "Source Han Serif SC", "Songti SC", serif; font-size: 40px; line-height: 1.2; }
      .ce-article-subtitle { margin: 16px 0 0; color: rgba(31, 41, 55, 0.84); font-size: 20px; }
      .ce-article-summary { margin: 18px 0 0; color: rgba(31, 41, 55, 0.68); font-size: 17px; }
      .ce-article-body { margin-top: 42px; font-size: 17px; }
      .ce-article-body > * + * { margin-top: 1.15em; }
      .ce-article-h2 { margin-top: 2em; font-size: 28px; line-height: 1.3; }
      .ce-article-h3 { margin-top: 1.7em; font-size: 22px; line-height: 1.35; }
      .ce-article-lead { font-size: 22px; line-height: 1.7; color: #111827; }
      .ce-article-p { margin: 0; }
      .ce-article-quote { margin: 1.4em 0; padding: 1em 1.2em; border-left: 4px solid #0f766e; background: rgba(15, 118, 110, 0.08); color: #0f172a; }
      .ce-article-list { padding-left: 1.35em; }
      .ce-article-list li + li { margin-top: 0.55em; }
      .ce-article-divider { border: 0; border-top: 1px solid rgba(31, 41, 55, 0.12); margin: 2.2em 0; }
      .ce-article-callout { padding: 1em 1.2em; border-radius: 18px; background: rgba(245, 158, 11, 0.12); }
      .ce-article-code { overflow: auto; padding: 16px; border-radius: 18px; background: #111827; color: #f9fafb; font-size: 14px; }
      .ce-article-figure { margin: 1.5em 0; }
      .ce-article-figure img { display: block; width: 100%; border-radius: 18px; }
      .ce-article-figure figcaption { margin-top: 10px; font-size: 14px; color: rgba(31, 41, 55, 0.6); text-align: center; }
    </style>
  </head>
  <body>${renderArticleBodyHtml(model)}</body>
</html>`;
}
