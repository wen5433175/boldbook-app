import { uuid, toISODate } from './utils.js';

const STORAGE_KEYS = {
  transactions: 'boldbook_transactions',
  budgets: 'boldbook_budgets',
  settings: 'boldbook_settings',
  userProfile: 'boldbook_user_profile',
};

function getPreferences() {
  if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Preferences) {
    return window.Capacitor.Plugins.Preferences;
  }
  return null;
}

async function nativeGet(key) {
  const prefs = getPreferences();
  if (!prefs) return null;
  try {
    const result = await prefs.get({ key });
    return result.value;
  } catch (e) {
    console.warn('nativeGet error', e);
    return null;
  }
}

async function nativeSet(key, value) {
  const prefs = getPreferences();
  if (!prefs) return false;
  try {
    await prefs.set({ key, value });
    return true;
  } catch (e) {
    console.warn('nativeSet error', e);
    return false;
  }
}

function webGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function webSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    return false;
  }
}

async function getItem(key) {
  const native = await nativeGet(key);
  if (native !== null) return native;
  return webGet(key);
}

async function setItem(key, value) {
  const ok = await nativeSet(key, value);
  if (ok) return true;
  return webSet(key, value);
}

async function getJson(key, fallback = null) {
  const raw = await getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

async function setJson(key, value) {
  await setItem(key, JSON.stringify(value));
}

// ===== Public API =====
export async function initData() {
  const settings = await getJson(STORAGE_KEYS.settings, {});
  if (!settings.initialized) {
    await setJson(STORAGE_KEYS.transactions, []);
    await setJson(STORAGE_KEYS.budgets, []);
    await setJson(STORAGE_KEYS.settings, {
      initialized: true,
      createdAt: Date.now(),
      firstOpenDate: toISODate(new Date()),
    });
  }
}

export async function getTransactions() {
  return await getJson(STORAGE_KEYS.transactions, []);
}

export async function saveTransaction(tx) {
  const list = await getTransactions();
  const idx = list.findIndex(t => t.id === tx.id);
  if (idx >= 0) {
    list[idx] = tx;
  } else {
    list.push(tx);
  }
  await setJson(STORAGE_KEYS.transactions, list);
  return tx;
}

export async function deleteTransaction(id) {
  const list = await getTransactions();
  const filtered = list.filter(t => t.id !== id);
  await setJson(STORAGE_KEYS.transactions, filtered);
}

export async function getTotalBudget() {
  const settings = await getSettings();
  return settings.monthlyBudget || 0;
}

export async function saveTotalBudget(amount) {
  const settings = await getSettings();
  settings.monthlyBudget = amount;
  await setJson(STORAGE_KEYS.settings, settings);
}

export async function getBudgets() {
  return await getJson(STORAGE_KEYS.budgets, []);
}

export async function saveBudget(budget) {
  const list = await getBudgets();
  const idx = list.findIndex(b => b.category === budget.category);
  if (idx >= 0) {
    list[idx] = budget;
  } else {
    list.push(budget);
  }
  await setJson(STORAGE_KEYS.budgets, list);
  return budget;
}

export async function deleteBudget(category) {
  const list = await getBudgets();
  const filtered = list.filter(b => b.category !== category);
  await setJson(STORAGE_KEYS.budgets, filtered);
}

export async function getSettings() {
  return await getJson(STORAGE_KEYS.settings, {});
}

export async function getUserProfile() {
  return await getJson(STORAGE_KEYS.userProfile, { nickname: '', avatar: '', gender: '', onboardingDone: false });
}

export async function saveUserProfile(profile) {
  await setJson(STORAGE_KEYS.userProfile, profile);
}

export async function clearAllData() {
  await setJson(STORAGE_KEYS.transactions, []);
  await setJson(STORAGE_KEYS.budgets, []);
  await setJson(STORAGE_KEYS.settings, { initialized: true, createdAt: Date.now() });
  await setJson(STORAGE_KEYS.userProfile, { nickname: '', avatar: '', gender: '', onboardingDone: false });
}

export async function exportData() {
  return {
    transactions: await getTransactions(),
    budgets: await getBudgets(),
    settings: await getSettings(),
    userProfile: await getUserProfile(),
    exportedAt: new Date().toISOString(),
  };
}

export async function importData(data) {
  if (data.transactions) await setJson(STORAGE_KEYS.transactions, data.transactions);
  if (data.budgets) await setJson(STORAGE_KEYS.budgets, data.budgets);
  if (data.settings) await setJson(STORAGE_KEYS.settings, data.settings);
  if (data.userProfile) await setJson(STORAGE_KEYS.userProfile, data.userProfile);
}
