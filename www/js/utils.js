// ===== Categories =====
export const EXPENSE_CATEGORIES = [
  { key: 'dining', name: '餐饮', icon: 'utensils', color: '#00D4AA', bg: 'rgba(0,212,170,0.15)' },
  { key: 'transport', name: '交通', icon: 'car', color: '#9B8BF4', bg: 'rgba(155,139,244,0.15)' },
  { key: 'shopping', name: '购物', icon: 'shopping-bag', color: '#FF4F87', bg: 'rgba(255,79,135,0.15)' },
  { key: 'entertainment', name: '娱乐', icon: 'gamepad-2', color: '#9B8BF4', bg: 'rgba(155,139,244,0.15)' },
  { key: 'housing', name: '居住', icon: 'home', color: '#111111', bg: 'rgba(17,17,17,0.12)' },
  { key: 'medical', name: '医疗', icon: 'heart-pulse', color: '#FF4F87', bg: 'rgba(255,79,135,0.15)' },
  { key: 'education', name: '教育', icon: 'graduation-cap', color: '#FFE156', bg: 'rgba(255,225,86,0.25)' },
  { key: 'other', name: '其他', icon: 'more-horizontal', color: '#6B6B6B', bg: 'rgba(107,107,107,0.15)' },
];

export const INCOME_CATEGORIES = [
  { key: 'salary', name: '工资', icon: 'banknote', color: '#00D4AA', bg: 'rgba(0,212,170,0.15)' },
  { key: 'bonus', name: '奖金', icon: 'gift', color: '#FFE156', bg: 'rgba(255,225,86,0.25)' },
  { key: 'investment', name: '理财', icon: 'trending-up', color: '#9B8BF4', bg: 'rgba(155,139,244,0.15)' },
  { key: 'other_income', name: '其他', icon: 'more-horizontal', color: '#6B6B6B', bg: 'rgba(107,107,107,0.15)' },
];

export function getCategory(type, key) {
  const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return list.find(c => c.key === key) || list[list.length - 1];
}

export function getAllCategories() {
  return [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
}

// ===== Icons =====
export function icon(name, attrs = {}) {
  const size = attrs.size || 24;
  const color = attrs.color || 'currentColor';
  const stroke = attrs.stroke || 2;
  return `<i data-lucide="${name}" style="width:${size}px;height:${size}px;color:${color};stroke-width:${stroke};"></i>`;
}

export function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

// ===== Date / Time =====
export function formatDate(d) {
  const date = new Date(d);
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const day = date.getDate();
  return `${y}年${m}月${day}日`;
}

export function formatDateShort(d) {
  const date = new Date(d);
  const m = date.getMonth() + 1;
  const day = date.getDate();
  return `${m}月${day}日`;
}

export function formatMonthLabel(date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

export function formatWeekday(d) {
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return days[new Date(d).getDay()];
}

export function getRelativeDateLabel(d) {
  const date = new Date(d);
  const today = new Date();
  const yest = new Date(today);
  yest.setDate(yest.getDate() - 1);

  const fmt = (x) => `${x.getFullYear()}-${x.getMonth() + 1}-${x.getDate()}`;
  if (fmt(date) === fmt(today)) return '今天';
  if (fmt(date) === fmt(yest)) return '昨天';
  return formatDateShort(date);
}

export function toISODate(d) {
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function firstDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function lastDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
}

export function addMonths(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

export function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

export function startOfYear(date) {
  return new Date(date.getFullYear(), 0, 1);
}

export function groupByDate(transactions) {
  const groups = {};
  transactions.slice().sort((a, b) => new Date(b.date + 'T' + (b.time || '00:00')) - new Date(a.date + 'T' + (a.time || '00:00'))).forEach(tx => {
    if (!groups[tx.date]) groups[tx.date] = [];
    groups[tx.date].push(tx);
  });
  return groups;
}

// ===== Currency =====
export function formatMoney(n) {
  return '¥' + Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function formatMoneyPlain(n) {
  return Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ===== UUID =====
export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ===== Toast =====
export function showToast(message) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

// ===== Modal =====
export function openModal(contentHtml, onClose) {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  overlay.innerHTML = `<div class="modal-sheet">${contentHtml}</div>`;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');

  const close = () => {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    if (typeof onClose === 'function') onClose();
  };

  overlay.addEventListener('click', e => {
    if (e.target === overlay) close();
  }, { once: true });

  const cancelBtn = overlay.querySelector('[data-modal-action="cancel"]');
  if (cancelBtn) cancelBtn.addEventListener('click', close, { once: true });

  return close;
}

export function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  }
}
