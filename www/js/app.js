import { initData, getUserProfile } from './data.js';
import { refreshIcons, icon } from './utils.js';
import {
  renderHome,
  renderTransactions,
  renderAdd,
  renderStats,
  renderBudget,
  renderProfile,
  renderOnboarding,
  attachEvents,
} from './pages.js';

const TABS = [
  { key: 'home', label: '首页', icon: 'layout-grid' },
  { key: 'transactions', label: '明细', icon: 'receipt' },
  { key: 'add', label: '记一笔', icon: 'plus', fab: true },
  { key: 'stats', label: '报表', icon: 'bar-chart-3' },
  { key: 'profile', label: '我的', icon: 'user' },
];

const ROUTES = {
  home: renderHome,
  transactions: renderTransactions,
  add: renderAdd,
  stats: renderStats,
  budget: renderBudget,
  profile: renderProfile,
  onboarding: renderOnboarding,
};

const state = {
  page: 'home',
  filter: 'all',
  month: new Date(),
  search: '',
  range: 'month',
  addType: 'expense',
  selectedCategory: null,
  amount: '',
  note: '',
  date: null,
  editId: null,
};

function renderTabBar(active) {
  const tabbar = document.getElementById('tabbar');
  if (!tabbar) return;
  if (active === 'onboarding') {
    tabbar.innerHTML = '';
    tabbar.style.display = 'none';
    return;
  }
  tabbar.style.display = '';
  tabbar.innerHTML = TABS.map(tab => {
    if (tab.fab) {
      return `
        <button class="boldbook-fab ${active === tab.key ? 'active' : ''}" data-action="nav" data-target="${tab.key}" aria-label="${tab.label}">
          ${icon(tab.icon, { size: 28, stroke: 2.5 })}
        </button>
      `;
    }
    return `
      <button class="boldbook-tab ${active === tab.key ? 'active' : ''}" data-action="nav" data-target="${tab.key}">
        ${icon(tab.icon, { size: 22 })}
        <span class="boldbook-tab-label">${tab.label}</span>
      </button>
    `;
  }).join('');
}

function updateTitle(page) {
  const titles = {
    home: 'BoldBook',
    transactions: '交易明细',
    add: '记一笔',
    stats: '统计报表',
    budget: '预算管理',
    profile: '我的',
  };
  document.title = titles[page] || 'BoldBook';
}

async function render(pushHistory = true) {
  const main = document.getElementById('main');
  const renderFn = ROUTES[state.page];
  if (!renderFn || !main) return;

  main.innerHTML = await renderFn(state);
  renderTabBar(state.page);
  updateTitle(state.page);
  attachEvents(main, state, navigate, () => render(false));

  // Tab bar lives outside <main>, so wire its navigation here
  document.getElementById('tabbar')?.querySelectorAll('[data-action="nav"]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.target));
  });

  refreshIcons();

  if (pushHistory && window.history) {
    window.history.pushState({ page: state.page }, '', `#${state.page}`);
  }
}

export function navigate(page, reset = true) {
  if (!ROUTES[page]) return;
  if (reset && page === 'add') {
    delete state.editId;
    state.addType = 'expense';
    state.selectedCategory = null;
    state.amount = '';
    state.note = '';
    state.date = null;
  }
  state.page = page;
  render(true);
}

window.addEventListener('popstate', e => {
  const page = e.state?.page || window.location.hash.replace('#', '') || 'home';
  if (ROUTES[page]) {
    state.page = page;
    render(false);
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  await initData();
  const profile = await getUserProfile();
  if (!profile.onboardingDone) {
    state.page = 'onboarding';
  } else {
    const initial = window.location.hash.replace('#', '');
    if (ROUTES[initial]) {
      state.page = initial;
    }
  }
  render(false);
});
