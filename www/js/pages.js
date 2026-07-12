import {
  icon, refreshIcons, formatDate, formatWeekday, formatMonthLabel, formatMoney,
  getRelativeDateLabel, getCategory, formatDateShort, toISODate,
  firstDayOfMonth, lastDayOfMonth, addMonths, startOfWeek, startOfYear,
  groupByDate, openModal, closeModal, showToast, uuid,
  EXPENSE_CATEGORIES, INCOME_CATEGORIES,
} from './utils.js';
import {
  getTransactions, getBudgets, getSettings, saveBudget, deleteBudget, saveTransaction,
  deleteTransaction, clearAllData, exportData, importData,
  getUserProfile, saveUserProfile, getTotalBudget, saveTotalBudget,
} from './data.js';

// ===== Shared header helpers =====
function pageHeader(title, actionHtml = '') {
  return `
    <header class="page-header nb-animate-pop">
      <h1 class="page-title">${title}</h1>
      ${actionHtml}
    </header>
  `;
}

function backHeader(title, rightAction = '') {
  return `
    <header class="page-header nb-animate-pop">
      <button class="nb-icon-btn" style="width:40px;height:40px;" data-action="back" aria-label="返回">
        ${icon('arrow-left', { size: 20 })}
      </button>
      <h1 class="page-title">${title}</h1>
      ${rightAction || '<div style="width:40px;height:40px;flex-shrink:0;"></div>'}
    </header>
  `;
}

// ===== Onboarding =====
export async function renderOnboarding(state) {
  const profile = await getUserProfile();

  return `
    <div class="onboarding-container">
      <div class="onboarding-card nb-animate-pop">
        <div class="onboarding-brand">
          <div class="onboarding-logo">B</div>
          <h1 class="onboarding-title">BoldBook</h1>
          <p class="onboarding-subtitle">欢迎！第一次使用请填写以下信息</p>
        </div>

        <div class="onboarding-field nb-animate-pop nb-delay-1">
          <label class="onboarding-label">昵称</label>
          <input type="text" class="nb-input onboarding-input" placeholder="输入你的昵称" value="${profile.nickname || ''}" data-input="nickname" maxlength="20">
        </div>

        <div class="onboarding-field nb-animate-pop nb-delay-2">
          <label class="onboarding-label">性别</label>
          <div class="onboarding-gender" data-action="gender">
            <button type="button" class="gender-btn ${profile.gender === 'male' ? 'active' : ''}" data-value="male">${icon('mars', { size: 18 })}<span>男</span></button>
            <button type="button" class="gender-btn ${profile.gender === 'female' ? 'active' : ''}" data-value="female">${icon('venus', { size: 18 })}<span>女</span></button>
            <button type="button" class="gender-btn ${profile.gender === 'other' ? 'active' : ''}" data-value="other"><span>保密</span></button>
          </div>
        </div>

        <button class="nb-btn onboarding-start nb-animate-pop nb-delay-3" data-action="start">
          开始使用
        </button>
      </div>
    </div>
  `;
}

// ===== Home =====
export async function renderHome(state) {
  const transactions = await getTransactions();
  const totalBudget = await getTotalBudget();
  const currentMonth = state.month || new Date();
  const start = firstDayOfMonth(currentMonth);
  const end = lastDayOfMonth(currentMonth);

  const monthly = transactions.filter(t => {
    const d = new Date(t.date);
    return d >= start && d <= end;
  });

  const income = monthly.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = monthly.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  const recent = transactions.slice().sort((a, b) => new Date(b.date + 'T' + (b.time || '00:00')) - new Date(a.date + 'T' + (a.time || '00:00'))).slice(0, 5);

  const today = new Date();

  const totalSpent = expense;
  const totalPct = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;
  const totalRemain = totalBudget - totalSpent;
  const budgetWarning = totalBudget > 0 && totalPct >= 80;

  let html = `
    <div class="home-header nb-animate-pop">
      <div>
        <h1 class="home-brand">BoldBook</h1>
        <p class="home-date">${formatDateShort(today)} ${formatWeekday(today)}</p>
      </div>
    </div>

    <section class="overview-cards">
      <div class="nb-animate-pop nb-delay-1 flex-1">
        <div class="ov-card rotate-1" style="background:var(--bb-teal);color:#fff;">
          <div class="ov-label">本月收入</div>
          <div class="ov-value">${formatMoney(income)}</div>
          <div class="ov-meta">${icon('arrow-up', { size: 12, color: '#fff' })}<span>12%</span></div>
        </div>
      </div>
      <div class="nb-animate-pop nb-delay-2 flex-1">
        <div class="ov-card rotate-2" style="background:var(--bb-pink);color:#fff;">
          <div class="ov-label">本月支出</div>
          <div class="ov-value">${formatMoney(expense)}</div>
          <div class="ov-meta">${icon('arrow-down', { size: 12, color: '#fff' })}<span>5%</span></div>
        </div>
      </div>
      <div class="nb-animate-pop nb-delay-3 flex-1">
        <div class="ov-card rotate-1" style="background:var(--bb-yellow);color:var(--bb-ink);">
          <div class="ov-label">本月结余</div>
          <div class="ov-value">${formatMoney(balance)}</div>
          <div class="ov-meta">可支配</div>
        </div>
      </div>
    </section>

    <section>
      <h2 class="section-title nb-animate-pop nb-delay-2">月预算进度</h2>
      <div class="nb-animate-pop nb-delay-3">
        ${totalBudget > 0 ? `
          <div class="budget-card home-budget-card" data-action="nav" data-target="budget">
            <div class="budget-card-header">
              <div class="budget-card-info">
                <div class="icon-circle" style="background:rgba(155,139,244,0.15);">
                  ${icon('wallet', { size: 18, color: 'var(--bb-purple)' })}
                </div>
                <span class="budget-card-name">月预算</span>
              </div>
              <div class="budget-card-remain">
                ${budgetWarning ? icon('alert-triangle', { size: 14, color: 'var(--bb-pink)' }) : ''}
                <span>剩 ${formatMoney(totalRemain)}</span>
              </div>
            </div>
            <div class="budget-card-amounts">
              <span class="budget-card-spent">${formatMoney(totalSpent)}</span>
              <span class="budget-card-total">/ ${formatMoney(totalBudget)}</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width:${totalPct}%;background:${budgetWarning ? 'var(--bb-pink)' : (totalPct >= 60 ? 'var(--bb-teal)' : 'var(--bb-pink)')};"></div>
            </div>
          </div>
        ` : '<p style="color:var(--bb-gray);font-size:13px;">暂无预算，去我的页面设置</p>'}
      </div>
    </section>

    <section style="margin-top:24px;">
      <h2 class="section-title nb-animate-pop nb-delay-4">最近交易</h2>
      <div class="nb-animate-pop nb-delay-5">
        ${recent.length === 0 ? emptyState('暂无交易') : renderTxRows(recent)}
      </div>
    </section>
  `;
  return html;
}

function renderBudgetCard(budget, monthlyTransactions) {
  const cat = getCategory('expense', budget.category);
  const spent = monthlyTransactions.filter(t => t.type === 'expense' && t.category === budget.category).reduce((s, t) => s + t.amount, 0);
  const pct = budget.amount > 0 ? Math.min(100, Math.round((spent / budget.amount) * 100)) : 0;
  const remain = budget.amount - spent;
  const warning = pct >= 80;

  return `
    <div class="budget-card" data-action="nav" data-target="budget">
      <div class="budget-card-header">
        <div class="budget-card-info">
          <div class="icon-circle" style="background:${cat.bg};">
            ${icon(cat.icon, { size: 18, color: cat.color })}
          </div>
          <span class="budget-card-name">${cat.name}</span>
        </div>
        <div class="budget-card-remain">
          ${warning ? icon('alert-triangle', { size: 14, color: 'var(--bb-pink)' }) : ''}
          <span>剩 ${formatMoney(remain)}</span>
        </div>
      </div>
      <div class="budget-card-amounts">
        <span class="budget-card-spent">${formatMoney(spent)}</span>
        <span class="budget-card-total">/ ${formatMoney(budget.amount)}</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width:${pct}%;background:${warning ? 'var(--bb-pink)' : (pct >= 60 ? 'var(--bb-teal)' : 'var(--bb-pink)')};"></div>
      </div>
    </div>
  `;
}

function renderTxRows(transactions, showDate = false) {
  if (showDate) {
    const groups = groupByDate(transactions);
    return Object.entries(groups).map(([date, items]) => `
      <div class="tx-date-divider"><span>${getRelativeDateLabel(date)}</span><div class="line"></div></div>
      <div class="tx-card">
        ${items.map(t => renderTxRow(t)).join('')}
      </div>
    `).join('');
  }
  return `<div class="tx-card">${transactions.map(t => renderTxRow(t)).join('')}</div>`;
}

function renderTxRow(tx) {
  const cat = getCategory(tx.type, tx.category);
  const sign = tx.type === 'income' ? '+' : '-';
  const color = tx.type === 'income' ? 'var(--bb-teal)' : 'var(--bb-pink)';
  const time = tx.time || '';
  const noteLine = tx.note ? tx.note : (time || null);

  return `
    <div class="tx-row" data-action="tx-options" data-id="${tx.id}">
      <div class="icon-circle" style="background:${cat.bg};">
        ${icon(cat.icon, { size: 20, color: cat.color })}
      </div>
      <div class="tx-row-main">
        <div class="tx-row-title truncate">${cat.name}</div>
        <div class="tx-row-time truncate">${noteLine}</div>
      </div>
      <div class="tx-row-amount" style="color:${color};">${sign}${formatMoney(tx.amount)}</div>
    </div>
  `;
}

function emptyState(text) {
  return `
    <div class="empty-state">
      ${icon('receipt', { size: 48 })}
      <p>${text}</p>
    </div>
  `;
}

// ===== Transactions =====
export async function renderTransactions(state) {
  const filter = state.filter || 'all';
  const month = state.month || new Date();
  const search = (state.search || '').trim().toLowerCase();

  const all = await getTransactions();
  const start = firstDayOfMonth(month);
  const end = lastDayOfMonth(month);

  let filtered = all.filter(t => {
    const d = new Date(t.date);
    return d >= start && d <= end;
  });

  if (filter === 'income') filtered = filtered.filter(t => t.type === 'income');
  if (filter === 'expense') filtered = filtered.filter(t => t.type === 'expense');
  if (search) {
    filtered = filtered.filter(t => {
      const cat = getCategory(t.type, t.category);
      return cat.name.includes(search) || (t.note && t.note.toLowerCase().includes(search));
    });
  }

  return `
    ${pageHeader('交易明细', `
      <button class="nb-icon-btn" style="width:40px;height:40px;" data-action="nav" data-target="stats" aria-label="统计">
        ${icon('bar-chart-3', { size: 20 })}
      </button>
    `)}

    <div class="search-bar nb-animate-pop nb-delay-1">
      ${icon('search', { size: 16, color: 'var(--bb-gray)' })}
      <input type="text" placeholder="搜索交易..." value="${state.search || ''}" data-input="search">
    </div>

    <div class="filter-tags no-scrollbar nb-animate-pop nb-delay-2">
      <button class="nb-tag ${filter === 'all' ? 'active' : ''}" data-action="filter" data-value="all">全部</button>
      <button class="nb-tag ${filter === 'expense' ? 'active' : ''}" data-action="filter" data-value="expense">支出</button>
      <button class="nb-tag ${filter === 'income' ? 'active' : ''}" data-action="filter" data-value="income">收入</button>
    </div>

    <div class="month-selector nb-animate-pop nb-delay-3">
      <button data-action="prev-month" aria-label="上个月">${icon('chevron-left', { size: 20 })}</button>
      <span>${formatMonthLabel(month)}</span>
      <button data-action="next-month" aria-label="下个月">${icon('chevron-right', { size: 20 })}</button>
    </div>

    <div class="nb-animate-pop nb-delay-4">
      ${filtered.length === 0 ? emptyState('本月暂无交易') : renderTxRows(filtered, true)}
    </div>
  `;
}

// ===== Stats =====
export async function renderStats(state) {
  const range = state.range || 'month';
  const transactions = await getTransactions();
  const budgets = await getBudgets();
  const now = new Date();

  let start, end;
  if (range === 'week') {
    start = startOfWeek(now);
    end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59);
  } else if (range === 'year') {
    start = startOfYear(now);
    end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
  } else {
    start = firstDayOfMonth(now);
    end = lastDayOfMonth(now);
  }

  const filtered = transactions.filter(t => {
    const d = new Date(t.date);
    return d >= start && d <= end;
  });

  const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // Expense by category
  const catMap = {};
  filtered.filter(t => t.type === 'expense').forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  });
  const catItems = Object.entries(catMap).map(([key, amount]) => ({ key, amount, cat: getCategory('expense', key) }));
  const totalExpense = catItems.reduce((s, c) => s + c.amount, 0) || 1;
  catItems.sort((a, b) => b.amount - a.amount);

  const colors = ['var(--bb-pink)', 'var(--bb-yellow)', 'var(--bb-teal)', 'var(--bb-purple)', 'var(--bb-ink)'];
  let conicStops = [];
  let acc = 0;
  const legendItems = catItems.map((item, i) => {
    const pct = item.amount / totalExpense;
    const startPct = acc * 100;
    const endPct = (acc + pct) * 100;
    conicStops.push(`${colors[i % colors.length]} ${startPct.toFixed(2)}% ${endPct.toFixed(2)}%`);
    acc += pct;
    return { ...item, pct: Math.round(pct * 100), color: colors[i % colors.length] };
  });

  // Monthly trend (last 6 months)
  const trend = [];
  for (let i = 5; i >= 0; i--) {
    const m = addMonths(now, -i);
    const s = firstDayOfMonth(m);
    const e = lastDayOfMonth(m);
    const monthTx = transactions.filter(t => {
      const d = new Date(t.date);
      return d >= s && d <= e;
    });
    const inc = monthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const exp = monthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    trend.push({ month: m.getMonth() + 1, income: inc, expense: exp });
  }
  const maxVal = Math.max(...trend.map(t => Math.max(t.income, t.expense)), 1);

  return `
    ${pageHeader('统计报表')}

    <div class="time-tabs nb-animate-pop nb-delay-1">
      <button class="time-tab ${range === 'week' ? 'active' : ''}" data-action="range" data-value="week">本周</button>
      <button class="time-tab ${range === 'month' ? 'active' : ''}" data-action="range" data-value="month">本月</button>
      <button class="time-tab ${range === 'year' ? 'active' : ''}" data-action="range" data-value="year">本年</button>
    </div>

    <div class="summary-grid">
      <div class="summary-card nb-animate-pop nb-delay-1" style="background:var(--bb-teal);color:#fff;transform:rotate(-1deg);">
        <div class="summary-label">总收入</div>
        <div class="summary-value">${formatMoney(income)}</div>
      </div>
      <div class="summary-card nb-animate-pop nb-delay-2" style="background:var(--bb-pink);color:#fff;transform:rotate(1.5deg);">
        <div class="summary-label">总支出</div>
        <div class="summary-value">${formatMoney(expense)}</div>
      </div>
    </div>

    <div class="nb-card nb-animate-pop nb-delay-3" style="padding:20px;margin-bottom:16px;">
      <h2 class="section-title-sm">支出构成</h2>
      <div class="donut-chart" style="background: conic-gradient(${conicStops.join(', ') || 'var(--bb-line) 0% 100%'});">
        <div class="donut-center">
          <span style="font-size:11px;color:var(--bb-gray);">总支出</span>
          <span class="bb-title" style="font-size:20px;font-weight:700;">${formatMoney(expense)}</span>
        </div>
      </div>
      <div class="legend-grid">
        ${legendItems.map(item => `
          <div class="legend-item">
            <span class="legend-dot" style="background:${item.color};"></span>
            <span class="legend-name">${item.cat.name}</span>
            <span class="legend-value">${formatMoney(item.amount)}</span>
            <span class="legend-percent">${item.pct}%</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="nb-card nb-animate-pop nb-delay-4" style="padding:16px;margin-bottom:16px;">
      <div class="flex items-center justify-between" style="margin-bottom:16px;">
        <h2 class="section-title-sm">收支趋势</h2>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1"><span style="width:10px;height:10px;background:var(--bb-teal);border:1.5px solid var(--bb-ink);border-radius:2px;"></span><span style="font-size:11px;">收入</span></div>
          <div class="flex items-center gap-1"><span style="width:10px;height:10px;background:var(--bb-pink);border:1.5px solid var(--bb-ink);border-radius:2px;"></span><span style="font-size:11px;">支出</span></div>
        </div>
      </div>
      <div class="bar-chart">
        ${trend.map(t => `
          <div class="bar-group">
            <div class="bar" style="height:${(t.income / maxVal * 120).toFixed(1)}px;background:var(--bb-teal);"></div>
            <div class="bar" style="height:${(t.expense / maxVal * 120).toFixed(1)}px;background:var(--bb-pink);"></div>
          </div>
        `).join('')}
      </div>
      <div class="bar-labels">
        ${trend.map(t => `<span class="bar-label-item">${t.month}月</span>`).join('')}
      </div>
    </div>

    <button class="nb-btn nb-animate-pop nb-delay-5 w-full flex items-center justify-between" style="height:48px;padding:0 16px;background:var(--bb-purple);color:#fff;" data-action="nav" data-target="budget">
      <span class="flex items-center gap-2">${icon('piggy-bank', { size: 20, color: '#fff' })}<span>设置预算</span></span>
      ${icon('chevron-right', { size: 20, color: '#fff' })}
    </button>
  `;
}

// ===== Add Transaction =====
export async function renderAdd(state) {
  const isEdit = !!state.editId;
  const tx = isEdit ? (await getTransactions()).find(t => t.id === state.editId) : null;
  const type = state.addType || tx?.type || 'expense';
  const selectedCat = state.selectedCategory || tx?.category || (type === 'income' ? 'salary' : 'dining');
  const amount = state.amount || (tx ? String(tx.amount) : '0');
  const note = state.note || tx?.note || '';
  const date = state.date || tx?.date || toISODate(new Date());

  const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return `
    ${backHeader(isEdit ? '编辑账单' : '记一笔')}

    <div class="type-toggle nb-animate-pop nb-delay-1">
      <button class="${type === 'expense' ? 'active-expense' : ''}" data-action="type" data-value="expense">支出</button>
      <button class="${type === 'income' ? 'active-income' : ''}" data-action="type" data-value="income">收入</button>
    </div>

    <div class="amount-display nb-card nb-animate-pop nb-delay-2" style="position:relative;">
      <div class="amount-row">
        <span class="amount-symbol">¥</span>
        <span class="amount-value" data-amount-display>${formatAmount(amount)}</span>
        <span class="blink-cursor" style="display:inline-block;width:3px;height:40px;background:var(--bb-ink);margin-left:2px;"></span>
      </div>
      <p class="amount-hint">点击输入金额</p>
      <input type="text" inputmode="decimal" data-input="amount" value="${amount === '0' ? '' : amount}" placeholder="0" style="position:absolute;inset:0;opacity:0;z-index:2;">
    </div>

    <div class="nb-animate-pop nb-delay-3">
      <h2 class="section-title-sm">选择分类</h2>
      <div class="category-grid">
        ${cats.map(c => `
          <button type="button" class="cat-cell ${selectedCat === c.key ? 'active' : ''}" data-action="category" data-value="${c.key}">
            ${icon(c.icon, { size: 24, color: selectedCat === c.key ? '#fff' : 'var(--bb-ink)' })}
            <span>${c.name}</span>
          </button>
        `).join('')}
      </div>
    </div>

    <div class="add-form-row nb-animate-pop nb-delay-4" data-action="pick-date">
      <div class="flex items-center gap-2" style="min-width:0;">
        ${icon('calendar', { size: 18 })}
        <span style="font-size:14px;" data-date-label>${formatDate(date)}</span>
      </div>
      <input type="date" value="${date}" data-input="date" style="position:absolute;opacity:0;width:100%;height:100%;left:0;top:0;">
      ${icon('chevron-right', { size: 18, color: 'var(--bb-gray)' })}
    </div>

    <div class="add-form-row nb-animate-pop nb-delay-5">
      ${icon('pencil', { size: 18, color: 'var(--bb-gray)' })}
      <input type="text" placeholder="添加备注..." value="${note}" data-input="note">
    </div>

    <div class="add-actions nb-animate-pop nb-delay-5">
      <button class="nb-btn" style="background:var(--bb-yellow);color:var(--bb-ink);height:52px;font-size:16px;" data-action="save-view">
        ${isEdit ? '保存修改' : '保存并查看明细'}
      </button>
      <button class="nb-btn nb-btn-sm" style="background:var(--bb-card);color:var(--bb-ink);height:48px;font-size:15px;" data-action="save-only">
        ${isEdit ? '保存' : '仅保存'}
      </button>
    </div>

    ${isEdit ? `<button class="nb-btn nb-btn-sm w-full" style="background:var(--bb-pink);color:#fff;height:48px;" data-action="delete-tx">删除</button>` : ''}
  `;
}

function formatAmount(amount) {
  if (!amount || amount === '0') return '0.00';
  const n = parseFloat(amount);
  if (isNaN(n)) return '0.00';
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ===== Budget =====
export async function renderBudget(state) {
  const transactions = await getTransactions();
  const totalBudget = await getTotalBudget();
  const now = new Date();
  const start = firstDayOfMonth(now);
  const end = lastDayOfMonth(now);

  const monthly = transactions.filter(t => {
    const d = new Date(t.date);
    return d >= start && d <= end && t.type === 'expense';
  });

  const totalSpent = monthly.reduce((s, t) => s + t.amount, 0);
  const totalRemain = totalBudget - totalSpent;
  const totalPct = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;
  const warning = totalBudget > 0 && totalPct >= 80;

  return `
    ${backHeader('预算管理')}

    <div class="nb-card budget-overview nb-animate-pop nb-delay-1" style="background:var(--bb-purple);color:#fff;">
      <div class="budget-overview-header">本月总预算</div>
      <div class="budget-overview-value">${formatMoney(totalBudget)}</div>
      <div class="budget-overview-track">
        <div class="budget-overview-fill" style="width:${totalPct}%;"></div>
      </div>
      <div class="budget-overview-meta">
        <span>已花费 ${formatMoney(totalSpent)}</span>
        <span style="font-weight:700;">剩余 ${formatMoney(totalRemain)}</span>
      </div>
    </div>

    <div class="nb-animate-pop nb-delay-3" style="margin-top:20px;">
      ${totalBudget === 0 ? '<p style="color:var(--bb-gray);font-size:13px;text-align:center;margin-top:20px;">暂无预算，去我的页面设置</p>' : ''}
    </div>

    <div class="nb-animate-pop nb-delay-5" style="margin-top:24px;">
      <button class="nb-btn w-full flex items-center justify-between" style="height:48px;padding:0 16px;background:var(--bb-card);" data-action="nav" data-target="profile">
        <span class="flex items-center gap-2">${icon('user', { size: 18 })}<span>去设置预算</span></span>
        ${icon('chevron-right', { size: 18 })}
      </button>
    </div>
  `;
}

function renderBudgetCatCard(budget, monthly) {
  const cat = getCategory('expense', budget.category);
  const spent = monthly.filter(t => t.category === budget.category).reduce((s, t) => s + t.amount, 0);
  const pct = budget.amount > 0 ? Math.min(100, Math.round((spent / budget.amount) * 100)) : 0;
  const remain = budget.amount - spent;
  const warning = pct >= 80;
  const ringColor = warning ? 'var(--bb-pink)' : (pct >= 60 ? 'var(--bb-teal)' : 'var(--bb-pink)');

  return `
    <button class="budget-cat-card ${warning ? 'warning' : ''} nb-animate-pop" data-action="edit-budget" data-category="${budget.category}">
      <div class="flex items-center" style="gap:12px;">
        <div class="budget-icon-circle" style="background:${cat.bg};">
          ${icon(cat.icon, { size: 22, color: cat.color })}
        </div>
        <div style="flex:1;min-width:0;">
          <div class="flex items-center" style="gap:5px;">
            <span class="bb-title truncate" style="font-size:14px;font-weight:700;">${cat.name}</span>
            ${warning ? icon('alert-triangle', { size: 14, color: 'var(--bb-pink)' }) : ''}
          </div>
          <div class="bb-body truncate" style="font-size:12px;color:var(--bb-gray);">${formatMoney(spent)} / ${formatMoney(budget.amount)}</div>
        </div>
        <div class="flex-col items-center" style="gap:4px;flex-shrink:0;">
          <div class="progress-ring" style="background:conic-gradient(${ringColor} 0% ${pct}%, var(--bb-line) ${pct}% 100%);">
            <div class="progress-ring-inner">${pct}%</div>
          </div>
          <span class="bb-body" style="font-size:11px;font-weight:700;color:${warning ? 'var(--bb-pink)' : 'var(--bb-teal)'};white-space:nowrap;">${formatMoney(remain)}</span>
        </div>
      </div>
    </button>
  `;
}

// ===== Profile =====
export async function renderProfile(state) {
  const transactions = await getTransactions();
  const settings = await getSettings();
  const userProfile = await getUserProfile();
  const totalBudget = await getTotalBudget();
  const firstOpen = settings.firstOpenDate ? new Date(settings.firstOpenDate) : new Date();
  const days = Math.max(1, Math.floor((Date.now() - firstOpen.getTime()) / (1000 * 60 * 60 * 24)));
  const nickname = userProfile.nickname || '点击设置昵称';
  const avatarSrc = userProfile.avatar || '';
  const hasAvatar = !!avatarSrc;
  const genderMap = { male: '男', female: '女', other: '保密' };
  const genderLabel = genderMap[userProfile.gender] || '';

  return `
    ${backHeader('我的')}

    <div class="profile-user-card nb-animate-pop nb-delay-1">
      <div class="flex items-center" style="gap:14px;">
        <div class="profile-avatar-wrap" data-action="change-avatar">
          ${hasAvatar
            ? `<img src="${avatarSrc}" alt="头像" class="profile-avatar-img">`
            : `<div class="profile-avatar"><span>B</span></div>`
          }
          <div class="profile-avatar-overlay">
            ${icon('camera', { size: 18, color: '#fff' })}
          </div>
        </div>
        <input type="file" accept="image/*" data-action="avatar-input" style="display:none;">
        <div style="min-width:0;flex:1;">
          <div class="profile-name-editable" data-action="edit-name">
            <span data-name-display class="profile-name-display">${nickname}</span>
            <input type="text" data-input="nickname" class="profile-name-input" value="${nickname === '点击设置昵称' ? '' : nickname}" placeholder="点击设置昵称" maxlength="20" style="display:none;">
            ${icon('pencil', { size: 14, color: 'var(--bb-gray)' })}
          </div>
          <div class="profile-gender-row" data-action="edit-gender">
            ${genderLabel ? `<span class="profile-gender-tag nb-tag" data-gender-display>${genderLabel}</span>` : `<span class="profile-gender-placeholder" data-gender-display>点击设置性别</span>`}
            ${icon('chevron-down', { size: 14, color: 'var(--bb-gray)' })}
          </div>
        </div>
      </div>
      <div class="profile-stats">
        <div class="profile-stat">
          <div class="profile-stat-icon">${icon('receipt', { size: 15 })}</div>
          <span class="profile-stat-text">${transactions.length} 笔记账</span>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-icon">${icon('calendar', { size: 15 })}</div>
          <span class="profile-stat-text">使用 ${days} 天</span>
        </div>
      </div>
    </div>

    <section style="margin-bottom:24px;">
      <h2 class="section-title-sm nb-animate-pop nb-delay-2">月预算</h2>
      <div class="nb-animate-pop nb-delay-2">
        <button class="profile-action w-full" data-action="edit-budget" style="background:var(--bb-card);border:3px solid var(--bb-ink);border-radius:12px;box-shadow:4px 4px 0 var(--bb-ink);padding:16px;display:flex;align-items:center;gap:12px;width:100%;cursor:pointer;">
          <div class="profile-action-icon" style="background:var(--bb-purple);width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${icon('wallet', { size: 20, color: '#fff' })}
          </div>
          <div style="flex:1;min-width:0;text-align:left;">
            <div class="profile-action-title">月预算：${formatMoney(totalBudget)}</div>
            <div class="profile-action-sub">点击设置月度预算</div>
          </div>
        </button>
      </div>
    </section>

    <section style="margin-bottom:24px;">
      <h2 class="section-title-sm nb-animate-pop nb-delay-2">数据管理</h2>
      <div class="profile-grid nb-animate-pop nb-delay-2">
        <button class="profile-action" data-action="export-data" style="transform:rotate(-1deg);">
          <div class="profile-action-icon" style="background:var(--bb-teal);">${icon('download', { size: 20, color: '#fff' })}</div>
          <div class="text-center">
            <div class="profile-action-title">导出数据</div>
            <div class="profile-action-sub">导出为 JSON</div>
          </div>
        </button>
        <button class="profile-action" data-action="import-data" style="transform:rotate(1.5deg);">
          <div class="profile-action-icon" style="background:var(--bb-purple);">${icon('upload', { size: 20, color: '#fff' })}</div>
          <div class="text-center">
            <div class="profile-action-title">导入数据</div>
            <div class="profile-action-sub">从文件导入</div>
          </div>
        </button>
      </div>
    </section>

    <section style="margin-bottom:24px;">
      <h2 class="section-title-sm nb-animate-pop nb-delay-3" style="color:var(--bb-pink);">危险操作</h2>
      <button class="profile-danger nb-animate-pop nb-delay-3" data-action="clear-data">
        <div class="profile-danger-icon">${icon('trash-2', { size: 20 })}</div>
        <div style="flex:1;min-width:0;text-align:left;">
          <div class="profile-danger-title">清空所有数据</div>
          <div class="profile-danger-sub">删除所有交易记录，不可恢复</div>
        </div>
        ${icon('chevron-right', { size: 20, color: '#fff' })}
      </button>
    </section>

    <section>
      <h2 class="section-title-sm nb-animate-pop nb-delay-4">关于</h2>
      <div class="profile-list nb-animate-pop nb-delay-4">
        <div class="profile-list-row"><span style="font-size:13px;">版本</span><span style="font-size:13px;color:var(--bb-gray);">v1.0.0</span></div>
        <div class="profile-list-row"><span style="font-size:13px;">隐私政策</span>${icon('chevron-right', { size: 18 })}</div>
        <div class="profile-list-row"><span style="font-size:13px;">关于 BoldBook</span>${icon('chevron-right', { size: 18 })}</div>
      </div>
    </section>
  `;
}

// ===== Event wiring =====
export function attachEvents(main, state, navigate, refresh) {
  // Navigation
  main.querySelectorAll('[data-action="nav"]').forEach(el => {
    el.addEventListener('click', () => {
      const target = el.dataset.target;
      navigate(target);
    });
  });

  // Back
  main.querySelectorAll('[data-action="back"]').forEach(el => {
    el.addEventListener('click', () => navigate('home'));
  });

  // Filter tags
  main.querySelectorAll('[data-action="filter"]').forEach(el => {
    el.addEventListener('click', () => {
      state.filter = el.dataset.value;
      refresh();
    });
  });

  // Month navigation
  main.querySelector('[data-action="prev-month"]')?.addEventListener('click', () => {
    state.month = addMonths(state.month || new Date(), -1);
    refresh();
  });
  main.querySelector('[data-action="next-month"]')?.addEventListener('click', () => {
    state.month = addMonths(state.month || new Date(), 1);
    refresh();
  });

  // Search input
  const searchInput = main.querySelector('[data-input="search"]');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      state.search = e.target.value;
      refresh();
    });
  }

  // Range tabs
  main.querySelectorAll('[data-action="range"]').forEach(el => {
    el.addEventListener('click', () => {
      state.range = el.dataset.value;
      refresh();
    });
  });

  // Transaction options
  main.querySelectorAll('[data-action="tx-options"]').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.id;
      openModal(`
        <h3 class="modal-title">选择操作</h3>
        <div class="flex-col gap-3">
          <button class="nb-btn" style="height:48px;background:var(--bb-yellow);color:var(--bb-ink);" data-modal-action="edit" data-id="${id}">编辑</button>
          <button class="nb-btn nb-btn-sm" style="height:48px;background:var(--bb-card);color:var(--bb-ink);" data-modal-action="delete" data-id="${id}">删除</button>
          <button class="nb-btn nb-btn-sm" style="height:48px;background:var(--bb-line);color:var(--bb-ink);" data-modal-action="cancel">取消</button>
        </div>
      `);
      document.querySelector('[data-modal-action="edit"]')?.addEventListener('click', () => {
        closeModal();
        state.editId = id;
        navigate('add', false);
      });
      document.querySelector('[data-modal-action="delete"]')?.addEventListener('click', async () => {
        closeModal();
        await deleteTransaction(id);
        showToast('已删除');
        refresh();
      });
    });
  });

  // Add transaction events
  main.querySelectorAll('[data-action="type"]').forEach(el => {
    el.addEventListener('click', () => {
      state.addType = el.dataset.value;
      state.selectedCategory = el.dataset.value === 'income' ? 'salary' : 'dining';
      refresh();
    });
  });

  main.querySelectorAll('[data-action="category"]').forEach(el => {
    el.addEventListener('click', () => {
      state.selectedCategory = el.dataset.value;
      refresh();
    });
  });

  const dateInput = main.querySelector('[data-input="date"]');
  if (dateInput) {
    dateInput.addEventListener('change', e => {
      state.date = e.target.value;
      refresh();
    });
  }

  const noteInput = main.querySelector('[data-input="note"]');
  if (noteInput) {
    noteInput.addEventListener('input', e => {
      state.note = e.target.value;
    });
  }

  // Amount input: hidden text field drives the display
  const amountInput = main.querySelector('[data-input="amount"]');
  if (amountInput) {
    amountInput.addEventListener('input', e => {
      let val = e.target.value;
      if (val === '' || val === '.') {
        state.amount = '';
        const display = main.querySelector('[data-amount-display]');
        if (display) display.textContent = '0.00';
        return;
      }
      val = val.replace(/[^0-9.]/g, '');
      const parts = val.split('.');
      if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
      if (parts[1] && parts[1].length > 2) val = parts[0] + '.' + parts[1].slice(0, 2);
      e.target.value = val;
      state.amount = val;
      const display = main.querySelector('[data-amount-display]');
      if (display) display.textContent = formatAmount(val);
    });

    const amountCard = amountInput.closest('.amount-display');
    if (amountCard) {
      amountCard.addEventListener('click', () => amountInput.focus());
    }
  }

  // Date row: trigger native date picker explicitly
  const dateRow = main.querySelector('[data-action="pick-date"]');
  if (dateRow && dateInput) {
    dateRow.addEventListener('click', () => {
      if (typeof dateInput.showPicker === 'function') {
        dateInput.showPicker();
      } else {
        dateInput.focus();
      }
    });
  }

  main.querySelector('[data-action="save-view"]')?.addEventListener('click', () => saveTx(state, navigate, 'transactions'));
  main.querySelector('[data-action="save-only"]')?.addEventListener('click', () => saveTx(state, navigate, 'home'));
  main.querySelector('[data-action="delete-tx"]')?.addEventListener('click', async () => {
    if (state.editId) {
      await deleteTransaction(state.editId);
      showToast('已删除');
      navigate('transactions');
    }
  });

  // Onboarding events
  main.querySelectorAll('[data-action="gender"] .gender-btn').forEach(el => {
    el.addEventListener('click', () => {
      main.querySelectorAll('[data-action="gender"] .gender-btn').forEach(b => b.classList.remove('active'));
      el.classList.add('active');
    });
  });

  main.querySelector('[data-action="start"]')?.addEventListener('click', async () => {
    const nicknameInput = main.querySelector('[data-input="nickname"]');
    const activeGender = main.querySelector('[data-action="gender"] .gender-btn.active');
    const nickname = nicknameInput?.value?.trim() || '';
    const gender = activeGender?.dataset?.value || '';
    if (!nickname) {
      showToast('请填写昵称');
      return;
    }
    const profile = await getUserProfile();
    profile.nickname = nickname;
    profile.gender = gender;
    profile.onboardingDone = true;
    await saveUserProfile(profile);
    navigate('home');
  });

  // Profile: avatar upload
  const avatarWrap = main.querySelector('[data-action="change-avatar"]');
  const avatarInput = main.querySelector('[data-action="avatar-input"]');
  if (avatarWrap && avatarInput) {
    avatarWrap.addEventListener('click', () => avatarInput.click());
    avatarInput.addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        showToast('图片不能超过 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = async () => {
        const profile = await getUserProfile();
        profile.avatar = reader.result;
        await saveUserProfile(profile);
        showToast('头像已更新');
        refresh();
      };
      reader.readAsDataURL(file);
      avatarInput.value = '';
    });
  }

  // Profile: edit nickname
  const nameEditable = main.querySelector('[data-action="edit-name"]');
  if (nameEditable) {
    const nameDisplay = nameEditable.querySelector('[data-name-display]');
    const nameInput = nameEditable.querySelector('[data-input="nickname"]');
    if (nameDisplay && nameInput) {
      nameEditable.addEventListener('click', () => {
        nameDisplay.style.display = 'none';
        nameInput.style.display = '';
        nameInput.focus();
        nameInput.select();
      });
      nameInput.addEventListener('blur', async () => {
        await saveNickname(nameInput, nameDisplay, refresh);
      });
      nameInput.addEventListener('keydown', async e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          nameInput.blur();
        }
      });
    }
  }

  // Profile: edit gender
  const genderRow = main.querySelector('[data-action="edit-gender"]');
  if (genderRow) {
    genderRow.addEventListener('click', () => openGenderPicker(refresh));
  }

  // Profile: edit budget (open modal)
  main.querySelector('[data-action="edit-budget"]')?.addEventListener('click', () => openTotalBudgetModal(refresh));

  // Profile: export / import / clear
  main.querySelector('[data-action="export-data"]')?.addEventListener('click', handleExport);
  main.querySelector('[data-action="import-data"]')?.addEventListener('click', handleImport);
  main.querySelector('[data-action="clear-data"]')?.addEventListener('click', async () => {
    openModal(`
      <h3 class="modal-title">确认清空？</h3>
      <p style="font-size:13px;color:var(--bb-gray);margin-bottom:16px;">此操作将删除所有交易和预算数据，不可恢复。</p>
      <div class="modal-actions">
        <button class="nb-btn nb-btn-sm" style="background:var(--bb-line);color:var(--bb-ink);" data-modal-action="cancel">取消</button>
        <button class="nb-btn" style="background:var(--bb-pink);color:#fff;" data-modal-action="confirm">确认清空</button>
      </div>
    `);
    document.querySelector('[data-modal-action="confirm"]')?.addEventListener('click', async () => {
      closeModal();
      await clearAllData();
      showToast('数据已清空');
      refresh();
    });
  });

  refreshIcons();
}

async function saveNickname(input, display, refresh) {
  const val = input.value.trim();
  const profile = await getUserProfile();
  profile.nickname = val;
  await saveUserProfile(profile);
  display.textContent = val || '点击设置昵称';
  input.style.display = 'none';
  display.style.display = '';
}

async function saveTx(state, navigate, target) {
  const amount = parseFloat(state.amount || '0');
  if (!amount || amount <= 0) {
    showToast('请输入金额');
    return;
  }
  const existing = state.editId ? (await getTransactions()).find(t => t.id === state.editId) : null;
  const tx = {
    id: state.editId || uuid(),
    type: state.addType || 'expense',
    amount,
    category: state.selectedCategory || (state.addType === 'income' ? 'salary' : 'dining'),
    note: state.note || '',
    date: state.date || toISODate(new Date()),
    time: existing?.time || new Date().toTimeString().slice(0, 5),
    createdAt: existing?.createdAt || Date.now(),
  };
  await saveTransaction(tx);
  showToast('保存成功');
  resetAddState(state);
  navigate(target);
}

function resetAddState(state) {
  delete state.editId;
  delete state.addType;
  delete state.selectedCategory;
  delete state.amount;
  delete state.note;
  delete state.date;
}

async function openGenderPicker(refresh) {
  const profile = await getUserProfile();
  const current = profile.gender || '';
  const genderMap = { male: '男', female: '女', other: '保密' };

  openModal(`
    <h3 class="modal-title">选择性别</h3>
    <div class="flex-col gap-3">
      ${Object.entries(genderMap).map(([key, label]) => `
        <button class="gender-picker-btn ${current === key ? 'active' : ''}" data-gender-value="${key}">
          ${key === 'male' ? icon('mars', { size: 18 }) : key === 'female' ? icon('venus', { size: 18 }) : ''}
          <span>${label}</span>
          ${current === key ? icon('check', { size: 18, color: 'var(--bb-teal)' }) : ''}
        </button>
      `).join('')}
    </div>
    <button class="nb-btn nb-btn-sm w-full" style="margin-top:16px;background:var(--bb-line);color:var(--bb-ink);" data-modal-action="cancel">取消</button>
  `);

  document.querySelectorAll('[data-gender-value]').forEach(el => {
    el.addEventListener('click', async () => {
      const gender = el.dataset.genderValue;
      const pf = await getUserProfile();
      pf.gender = gender;
      await saveUserProfile(pf);
      closeModal();
      showToast('性别已更新');
      refresh();
    });
  });
}

async function openTotalBudgetModal(refresh) {
  const currentBudget = await getTotalBudget();

  openModal(`
    <h3 class="modal-title">设置月预算</h3>
    <p style="font-size:13px;color:var(--bb-gray);margin-bottom:16px;">设置当月总预算，所有支出会自动从预算中扣除</p>
    <label style="display:block;font-family:var(--font-title);font-size:14px;font-weight:700;margin-bottom:8px;">月度预算金额</label>
    <input type="text" inputmode="decimal" class="nb-input" style="width:100%;height:48px;padding:0 14px;box-sizing:border-box;font-size:16px;" value="${currentBudget > 0 ? currentBudget : ''}" placeholder="输入预算金额" data-input="budget-amount">
    <div class="modal-actions" style="margin-top:20px;">
      <button class="nb-btn nb-btn-sm" style="background:var(--bb-line);color:var(--bb-ink);" data-modal-action="cancel">取消</button>
      <button class="nb-btn" style="background:var(--bb-purple);color:#fff;" data-modal-action="save-budget">保存</button>
    </div>
  `);

  document.querySelector('[data-modal-action="save-budget"]')?.addEventListener('click', async () => {
    const input = document.querySelector('[data-input="budget-amount"]');
    const val = parseFloat(input?.value || '0');
    if (isNaN(val) || val < 0) {
      showToast('请输入有效金额');
      return;
    }
    await saveTotalBudget(val);
    closeModal();
    showToast('预算已更新');
    refresh();
  });
}

async function openBudgetModal(categoryKey, refresh) {
  const budgets = await getBudgets();
  const budget = budgets.find(b => b.category === categoryKey);
  const cat = categoryKey ? getCategory('expense', categoryKey) : null;

  openModal(`
    <h3 class="modal-title">${budget ? '编辑' : '添加'}预算</h3>
    ${!budget ? `
      <select class="nb-input modal-input" data-modal-input="category">
        ${EXPENSE_CATEGORIES.filter(c => !budgets.some(b => b.category === c.key)).map(c => `<option value="${c.key}">${c.name}</option>`).join('')}
      </select>
    ` : `<input type="hidden" data-modal-input="category" value="${categoryKey}">`}
    <input type="number" class="nb-input modal-input" placeholder="预算金额" data-modal-input="amount" value="${budget ? budget.amount : ''}">
    <div class="modal-actions">
      <button class="nb-btn nb-btn-sm" style="background:var(--bb-line);color:var(--bb-ink);" data-modal-action="cancel">取消</button>
      <button class="nb-btn" style="background:var(--bb-yellow);color:var(--bb-ink);" data-modal-action="save">保存</button>
    </div>
    ${budget ? `<button class="nb-btn nb-btn-sm w-full" style="margin-top:12px;background:var(--bb-pink);color:#fff;" data-modal-action="delete">删除预算</button>` : ''}
  `);

  document.querySelector('[data-modal-action="save"]')?.addEventListener('click', async () => {
    const catInput = document.querySelector('[data-modal-input="category"]');
    const amountInput = document.querySelector('[data-modal-input="amount"]');
    const category = catInput?.value;
    const amount = parseFloat(amountInput?.value || '0');
    if (!category || amount <= 0) {
      showToast('请填写完整');
      return;
    }
    await saveBudget({ category, amount });
    closeModal();
    showToast('预算已保存');
    refresh();
  });

  document.querySelector('[data-modal-action="delete"]')?.addEventListener('click', async () => {
    await deleteBudget(categoryKey);
    closeModal();
    showToast('预算已删除');
    refresh();
  });
}

async function handleExport() {
  const data = await exportData();
  const json = JSON.stringify(data, null, 2);
  const filename = `boldbook_backup_${new Date().toISOString().slice(0, 10)}.json`;

  const cap = window.Capacitor;
  if (cap && cap.Plugins && cap.Plugins.Filesystem) {
    const fs = cap.Plugins.Filesystem;
    try {
      await fs.mkdir({ path: 'BoldBook', directory: 'DOCUMENTS', recursive: true });
    } catch (_) {}
    try {
      await fs.writeFile({
        path: `BoldBook/${filename}`,
        data: json,
        directory: 'DOCUMENTS',
        encoding: 'utf8',
      });
      showToast('已导出到 Documents/BoldBook');
    } catch (e) {
      showToast('导出失败: ' + e.message);
    }
  } else {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('数据已导出');
  }
}

async function handleImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importData(data);
      showToast('数据已导入');
      window.location.reload();
    } catch (err) {
      showToast('导入失败：文件格式错误');
    }
  });
  input.click();
}
