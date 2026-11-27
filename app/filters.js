// DealVerdict filters: search, category, store, minimum discount, verdict,
// and sorting. Pure functions over the deals list so the grid and the
// result count always agree, and so a hash route can restore a view.

import { discountOf } from './data.js';

export const SORTS = {
  discount: { label: 'Biggest discount first', fn: (a, b) => discountOf(b) - discountOf(a) || a.price - b.price },
  savings: { label: 'Most dollars saved', fn: (a, b) => (b.was - b.price) - (a.was - a.price) },
  priceLow: { label: 'Lowest price first', fn: (a, b) => a.price - b.price },
  priceHigh: { label: 'Highest price first', fn: (a, b) => b.price - a.price },
  name: { label: 'Name A–Z', fn: (a, b) => a.name.localeCompare(b.name) },
};

export function defaultState() {
  return { q: '', category: 'All', store: 'All', minDiscount: 0, verdict: 'all', sort: 'discount' };
}

export function applyFilters(deals, state) {
  const q = state.q.trim().toLowerCase();
  const out = deals.filter((d) => {
    if (state.category !== 'All' && d.category !== state.category) return false;
    if (state.store !== 'All' && d.store !== state.store) return false;
    if (state.verdict !== 'all' && d.verdict !== state.verdict) return false;
    if (discountOf(d) < state.minDiscount) return false;
    if (q) {
      const hay = [d.name, d.brand, d.category, d.store].join(' ').toLowerCase();
      if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  });
  const sort = SORTS[state.sort] || SORTS.discount;
  return [...out].sort(sort.fn);
}

export function countByVerdict(deals) {
  const counts = { true: 0, good: 0, routine: 0 };
  for (const d of deals) counts[d.verdict] += 1;
  return counts;
}

export function averageDiscount(deals) {
  if (!deals.length) return 0;
  return Math.round(deals.reduce((s, d) => s + discountOf(d), 0) / deals.length);
}

export function totalSavings(deals) {
  return deals.reduce((s, d) => s + (d.was - d.price), 0);
}
