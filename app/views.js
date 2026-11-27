// DealVerdict views: the deal card, the grid, and the per-deal detail page.
// All markup is built from the deal data, so what the screenshots show is
// exactly what the data holds — no placeholder text anywhere.

import { discountOf, money, savedOf, VERDICTS } from './data.js';

export function esc(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function verdictBadge(deal) {
  const v = VERDICTS[deal.verdict];
  return `<span class="verdict verdict-${deal.verdict}" title="${esc(v.blurb)}">${v.label}</span>`;
}

export function dealCard(deal) {
  const pct = discountOf(deal);
  return `<article class="card" data-id="${esc(deal.id)}">
    <div class="card-top">
      <span class="store-chip">${esc(deal.store)}</span>
      <span class="cat-chip">${esc(deal.category)}</span>
      ${verdictBadge(deal)}
    </div>
    <h3 class="card-name"><a href="#/deal/${esc(deal.id)}">${esc(deal.name)}</a></h3>
    <p class="card-brand">${esc(deal.brand)}</p>
    <div class="card-prices">
      <span class="sale">${money(deal.price)}</span>
      <span class="was">${money(deal.was)}</span>
      <span class="pct">−${pct}%</span>
    </div>
    <p class="card-save">You save ${money(savedOf(deal))}</p>
    <p class="card-checked">Checked ${esc(deal.checked)} · via ${esc(deal.source)}</p>
    <a class="card-cta" href="${esc(deal.link)}" target="_blank" rel="noopener">View at ${esc(deal.store)} →</a>
  </article>`;
}

export function renderGrid(deals, total) {
  if (!deals.length) {
    return `<div class="empty">
      <p class="empty-big">No deals match those filters.</p>
      <p>Try clearing the search or lowering the minimum discount — all ${total} deals are still listed below the filters.</p>
    </div>`;
  }
  return `<div class="grid">${deals.map(dealCard).join('')}</div>`;
}

export function renderFeatured(deals) {
  const picks = deals.filter((d) => d.verdict === 'true').slice(0, 3);
  return `<section class="featured" aria-label="Top true deals">
    <h2>Today’s three strongest true deals</h2>
    <div class="grid featured-grid">${picks.map(dealCard).join('')}</div>
  </section>`;
}

export function renderDetail(deal) {
  const pct = discountOf(deal);
  const v = VERDICTS[deal.verdict];
  const also = deal.alsoAt.length
    ? `<section class="detail-block"><h2>Same product, other stores</h2>
       <ul class="also-list">${deal.alsoAt.map((a) => `<li><strong>${esc(a.store)}</strong> — ${money(a.price)}${a.price > deal.price ? ` (${money(a.price - deal.price)} more than ${esc(deal.store)})` : a.price < deal.price ? ` (${money(deal.price - a.price)} cheaper)` : ' (same price)'}</li>`).join('')}</ul></section>`
    : '';
  return `<article class="detail">
    <p class="crumb"><a href="#/">← All deals</a></p>
    <div class="detail-head">
      <div>
        <span class="store-chip">${esc(deal.store)}</span>
        <span class="cat-chip">${esc(deal.category)}</span>
        ${verdictBadge(deal)}
        <h2 class="detail-name">${esc(deal.name)}</h2>
        <p class="card-brand">${esc(deal.brand)}</p>
      </div>
      <div class="detail-prices">
        <span class="sale big">${money(deal.price)}</span>
        <span class="was big">${money(deal.was)}</span>
        <span class="pct big">−${pct}%</span>
        <p class="card-save">You save ${money(savedOf(deal))}</p>
      </div>
    </div>
    <section class="detail-block verdict-block">
      <h2>Is it really a deal? — ${v.label}</h2>
      <p>${esc(v.blurb)}</p>
      <p>${esc(deal.evidence)}</p>
    </section>
    <section class="detail-block">
      <h2>What to know</h2>
      <p>${esc(deal.note)}</p>
    </section>
    ${also}
    <section class="detail-block">
      <h2>Checked, and where</h2>
      <p>Price checked <strong>${esc(deal.checked)}</strong> at ${esc(deal.store)}. Source: <a href="${esc(deal.sourceUrl)}" target="_blank" rel="noopener">${esc(deal.source)}</a>. Prices move fast on Black Friday — the store link below opens the store’s search for this exact product, so you see the live price before you buy.</p>
      <p><a class="card-cta big-cta" href="${esc(deal.link)}" target="_blank" rel="noopener">Check the live price at ${esc(deal.store)} →</a></p>
    </section>
  </article>`;
}
