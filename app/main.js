// DealVerdict boot: reads the hash route, wires the toolbar, renders the
// grid or a deal detail page. Routes:
//   #/                          the full grid
//   #/?verdict=true&sort=...   the grid with filters applied (shareable)
//   #/deal/<id>                one deal's evidence page

import { CATEGORIES, CHECKED_DAY, DEALS, STORES, VERDICTS } from './data.js';
import { applyFilters, averageDiscount, countByVerdict, defaultState, SORTS, totalSavings } from './filters.js';
import { esc, renderDetail, renderFeatured, renderGrid } from './views.js';

const $ = (sel) => document.querySelector(sel);

const state = defaultState();

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  if (raw.startsWith('deal/')) return { view: 'deal', id: decodeURIComponent(raw.slice(5)) };
  const params = new URLSearchParams(raw.startsWith('?') ? raw.slice(1) : '');
  return { view: 'grid', params };
}

function applyParamsToState(params) {
  const next = defaultState();
  if (params.has('q')) next.q = params.get('q');
  if (params.has('cat') && (params.get('cat') === 'All' || CATEGORIES.includes(params.get('cat')))) next.category = params.get('cat');
  if (params.has('store') && (params.get('store') === 'All' || STORES.includes(params.get('store')))) next.store = params.get('store');
  if (params.has('min')) next.minDiscount = Math.max(0, Math.min(70, parseInt(params.get('min'), 10) || 0));
  if (params.has('verdict') && (params.get('verdict') === 'all' || params.get('verdict') in VERDICTS)) next.verdict = params.get('verdict');
  if (params.has('sort') && params.get('sort') in SORTS) next.sort = params.get('sort');
  Object.assign(state, next);
}

function stateToHash() {
  const p = new URLSearchParams();
  if (state.q) p.set('q', state.q);
  if (state.category !== 'All') p.set('cat', state.category);
  if (state.store !== 'All') p.set('store', state.store);
  if (state.minDiscount) p.set('min', String(state.minDiscount));
  if (state.verdict !== 'all') p.set('verdict', state.verdict);
  if (state.sort !== 'discount') p.set('sort', state.sort);
  const s = p.toString();
  return s ? '#/?' + s : '#/';
}

function buildToolbar() {
  $('#search').value = state.q;
  $('#category').innerHTML = ['All', ...CATEGORIES].map((c) => `<option${c === state.category ? ' selected' : ''}>${esc(c)}</option>`).join('');
  $('#store').innerHTML = ['All', ...STORES].map((s) => `<option${s === state.store ? ' selected' : ''}>${esc(s)}</option>`).join('');
  $('#min-discount').innerHTML = [0, 20, 30, 40, 50, 60].map((n) => `<option value="${n}"${n === state.minDiscount ? ' selected' : ''}>${n === 0 ? 'Any discount' : 'At least ' + n + '% off'}</option>`).join('');
  $('#sort').innerHTML = Object.entries(SORTS).map(([k, v]) => `<option value="${k}"${k === state.sort ? ' selected' : ''}>${esc(v.label)}</option>`).join('');
  $('#verdict-true').checked = state.verdict === 'true';
  $('#verdict-good').checked = state.verdict === 'good';
  $('#verdict-routine').checked = state.verdict === 'routine';
  $('#verdict-all').checked = state.verdict === 'all';
}

function render() {
  const route = parseHash();
  const gridWrap = $('#grid-wrap');
  const detailWrap = $('#detail-wrap');
  const featuredWrap = $('#featured-wrap');
  buildToolbar();
  if (route.view === 'deal') {
    const deal = DEALS.find((d) => d.id === route.id);
    if (deal) {
      document.title = `${deal.name} — DealVerdict`;
      gridWrap.innerHTML = '';
      featuredWrap.innerHTML = '';
      detailWrap.innerHTML = renderDetail(deal);
      $('#results-meta').textContent = `One deal · ${deal.store} · checked ${deal.checked}`;
      window.scrollTo(0, 0);
      return;
    }
  }
  applyParamsToState(route.params || new URLSearchParams());
  buildToolbar();
  document.title = 'DealVerdict — Real Black Friday Deals, Checked Nov 27, 2026';
  const shown = applyFilters(DEALS, state);
  const counts = countByVerdict(DEALS);
  $('#results-meta').textContent = `Showing ${shown.length} of ${DEALS.length} deals · ${counts.true} true deals · avg −${averageDiscount(DEALS)}% · ${totalSavings(DEALS).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })} total savings`;
  featuredWrap.innerHTML = state.q || state.category !== 'All' || state.store !== 'All' || state.verdict !== 'all' || state.minDiscount ? '' : renderFeatured(DEALS);
  detailWrap.innerHTML = '';
  gridWrap.innerHTML = renderGrid(shown, DEALS.length);
}

function bindToolbar() {
  $('#search').addEventListener('input', (e) => {
    state.q = e.target.value;
    history.replaceState(null, '', stateToHash());
    render();
  });
  $('#category').addEventListener('change', (e) => { state.category = e.target.value; history.replaceState(null, '', stateToHash()); render(); });
  $('#store').addEventListener('change', (e) => { state.store = e.target.value; history.replaceState(null, '', stateToHash()); render(); });
  $('#min-discount').addEventListener('change', (e) => { state.minDiscount = parseInt(e.target.value, 10); history.replaceState(null, '', stateToHash()); render(); });
  $('#sort').addEventListener('change', (e) => { state.sort = e.target.value; history.replaceState(null, '', stateToHash()); render(); });
  document.querySelectorAll('input[name="verdict"]').forEach((r) => r.addEventListener('change', (e) => {
    state.verdict = e.target.value;
    history.replaceState(null, '', stateToHash());
    render();
  }));
  $('#clear-filters').addEventListener('click', () => {
    Object.assign(state, defaultState());
    history.replaceState(null, '', '#/');
    render();
  });
}

function renderStats() {
  const counts = countByVerdict(DEALS);
  $('#stat-deals').textContent = String(DEALS.length);
  $('#stat-true').textContent = String(counts.true);
  $('#stat-avg').textContent = '−' + averageDiscount(DEALS) + '%';
  $('#stat-save').textContent = totalSavings(DEALS).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  $('#checked-day').textContent = CHECKED_DAY;
}

renderStats();
bindToolbar();
addEventListener('hashchange', render);
render();
