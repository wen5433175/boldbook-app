# BoldBook 开发全流程文档

> 项目名称：BoldBook（离线个人记账 App）
> 目标平台：Android（后续可扩展 iOS）
> 技术栈：Vanilla JS + Capacitor + Neobrutalism CSS
> 版本：v1.0.0
> 文档日期：2026-07-12

---

## 目录

1. [需求调研](#一需求调研)
2. [需求分析](#二需求分析)
3. [概要设计](#三概要设计)
4. [详细设计](#四详细设计)
5. [编码开发](#五编码开发)
6. [测试验证](#六测试验证)
7. [打包部署](#七打包部署)
8. [运维迭代](#八运维迭代)
9. [附录](#九附录)

---

## 一、需求调研

### 1.1 背景

个人记账是高频刚需场景。市场上的记账 App 存在以下痛点：
- 大多数 App 需要联网注册账号，数据存储在云端，隐私担忧
- 广告植入多，影响使用体验
- 功能臃肿，学习成本高
- 数据导出不自由，存在厂商锁定

### 1.2 目标用户

- 有记账习惯但注重隐私的个人用户
- 不需要复杂财务管理、只需要简单收支记录的用户
- 网络条件不稳定、希望离线可用的用户

### 1.3 调研结论

| 维度 | 发现 | 决策 |
|------|------|------|
| 数据存储 | 用户对云端数据隐私有顾虑 | 全本地存储，不上传任何数据 |
| 注册门槛 | 用户厌烦注册流程 | 首次使用填写昵称即可，无需手机/邮箱 |
| 记账方式 | 用户习惯随手记 | 底部 FAB 快速记一笔，减少操作路径 |
| 预算管理 | 有预算意识但不愿复杂设置 | 分类预算，设置后自动追踪进度 |
| 数据导出 | 用户希望数据可控 | 导出 JSON，支持导入恢复 |
| 设计风格 | 追求个性化、不沉闷 | Neobrutalism 风格，鲜明色彩 |

### 1.4 用户场景

**场景一：日常记账**
> 小张午餐消费 45 元，打开 BoldBook → 点击底部 "+" → 选择"餐饮"分类 → 输入 45 → 保存。全程不超过 5 秒。

**场景二：查看月度支出**
> 月底小张想了解本月花了多少钱，打开 App → 首页概览卡片直接显示本月收入、支出、结余。

**场景三：预算控制**
> 小张设定本月餐饮预算 3000 元，之后每次记账都会实时更新剩余金额，超过 80% 时出现预警。

**场景四：数据备份**
> 换手机前，小张在"我的"页面导出 JSON 文件到手机存储。新手机上安装 App → 导入数据 → 完整恢复。

---

## 二、需求分析

### 2.1 功能需求矩阵

| 模块 | 功能 | 优先级 | 说明 |
|------|------|--------|------|
| 记账 | 记一笔（支出/收入） | P0 刚需 | 核心功能，支持金额、分类、日期、备注 |
| 记账 | 编辑/删除账单 | P0 刚需 | 用户可能记错需要修改 |
| 首页 | 本月收支概览 | P0 刚需 | 收入、支出、结余一目了然 |
| 首页 | 预算进度展示 | P0 刚需 | 实时展示各分类预算使用情况 |
| 首页 | 最近交易列表 | P0 刚需 | 快速查看最近几笔记录 |
| 明细 | 交易列表 | P0 刚需 | 按日期分组的完整交易流水 |
| 明细 | 搜索/筛选 | P1 可选 | 按关键字搜索、按类型筛选 |
| 报表 | 支出分类统计 | P0 刚需 | 环形图展示各分类支出占比 |
| 报表 | 收支趋势 | P1 可选 | 柱状图展示月度趋势 |
| 预算 | 设置分类预算 | P0 刚需 | 为每个支出分类设定月度限额 |
| 预算 | 预算进度追踪 | P0 刚需 | 实时计算已花费/剩余/百分比 |
| 我的 | 用户信息 | P0 刚需 | 昵称、头像、性别自定义 |
| 我的 | 数据导出/导入 | P0 刚需 | JSON 格式备份与恢复 |
| 我的 | 清空数据 | P1 可选 | 一键重置所有数据 |
| 引导 | 首次使用引导页 | P1 可选 | 新用户填写昵称和性别 |
| 安全 | 离线运行 | P0 刚需 | 无需网络权限 |

### 2.2 非功能需求

| 维度 | 要求 |
|------|------|
| 性能 | 首屏加载 < 1s，页面切换无闪烁 |
| 安全 | 不连接网络，不申请 INTERNET 权限 |
| 离线 | 100% 离线可用 |
| 存储 | 数据存储小于 10MB（纯文本） |
| 兼容 | 支持 Android 7.0+（API 23+） |
| 跨平台 | 架构支持后续扩展 iOS |

### 2.3 剔除的需求

| 需求 | 剔除原因 |
|------|----------|
| 多账户管理 | 个人记账场景，复杂度远超收益 |
| 云端同步 | 违反离线隐私定位 |
| 语音记账 | 技术复杂度高，非刚需 |
| 拍照识别小票 | 需要网络调用 OCR 服务 |
| 预算超支自动提醒 | 需要后台通知权限 |
| 多币种支持 | 目标用户场景单一 |

---

## 三、概要设计

### 3.1 系统架构

```
┌─────────────────────────────────────────────┐
│                Presentation                  │
│  页面渲染层（pages.js）                       │
│  首页 / 明细 / 记一笔 / 报表 / 预算 / 我的     │
├─────────────────────────────────────────────┤
│                 App Shell                    │
│  入口（app.js）  │  路由  │  状态管理  │  导航  │
├─────────────────────────────────────────────┤
│                Utilities                    │
│  工具（utils.js）                            │
│  图标 / 日期 / 格式化 / 分类 / UI 组件         │
├─────────────────────────────────────────────┤
│              Data Layer                     │
│  数据（data.js）                              │
│  CRUD  │  存储适配  │  导出导入                │
├─────────────────────────────────────────────┤
│        Storage Backend (适配器模式)            │
│  Capacitor Preferences  ←→  localStorage    │
│  Capacitor Filesystem (导出用)               │
├─────────────────────────────────────────────┤
│           Capacitor / WebView               │
│         Android 原生壳  │  Web 引擎           │
└─────────────────────────────────────────────┘
```

### 3.2 技术选型

| 层次 | 选型 | 选型理由 |
|------|------|----------|
| UI 框架 | 原生 Vanilla JS（无框架） | 项目规模不大，引入框架增加复杂度和包体积 |
| 样式体系 | CSS 自定义属性 + Neobrutalism | 设计风格鲜明，CSS 变量保证一致性 |
| 图标库 | Lucide | 开源、简洁、按需渲染 |
| 字体 | Space Grotesk + JetBrains Mono | 标题字体和等宽字体搭配 |
| 跨平台壳 | Capacitor 7 | 成熟的 Web → 原生桥接方案 |
| 本地存储 | Capacitor Preferences | 原生键值存储，回退 localStorage |
| 文件系统 | Capacitor Filesystem | 导出数据到用户可见目录 |
| 开发模式 | SPA + Hash 路由 | 无需服务端支持，纯前端页面切换 |

### 3.3 设计风格 — Neobrutalism（新粗野主义）

**核心视觉特征：**
- 粗黑边框（3px）：所有卡片、按钮、输入框均有明显黑色边框
- 硬阴影（无模糊）：`box-shadow: 4px 4px 0 #111`，没有过渡渐变
- 鲜明色彩：黄色 #FFE156、粉色 #FF4F87、青色 #00D4AA、紫色 #9B8BF4
- 奶油色背景 #FFFBF0，营造温暖手工感
- 倾斜排列：部分卡片微微旋转（-1deg / 1.5deg），打破死板网格
- 交错入场动画：卡片逐次弹入（stagger animation）

---

## 四、详细设计

### 4.1 页面路由设计

```
路由表（Hash 路由）：

#home           → 首页仪表盘
#transactions   → 交易明细
#add            → 记一笔（或编辑）
#stats          → 统计报表
#budget         → 预算管理
#profile        → 我的
#onboarding     → 首次引导（无底部导航）
```

### 4.2 页面布局与功能

#### 4.2.1 首页仪表盘

```
┌─────────────────────────────┐
│  BoldBook                    │
│  7月12日 星期日               │
├─────────────────────────────┤
│  ┌──────┐┌──────┐┌──────┐  │
│  │本月收入││本月支出││本月结余│  │
│  │¥8,500││¥3,269││¥5,231│  │
│  └──────┘└──────┘└──────┘  │
│                             │
│  预算进度                     │
│  ┌ 餐饮 剩¥920 ────────┐   │
│  │ ████████████░░░░░░░ │   │
│  └────────────────────┘   │
│  ┌ 交通 剩¥960 ────────┐   │
│  │ ████░░░░░░░░░░░░░░░ │   │
│  └────────────────────┘   │
│                             │
│  最近交易                     │
│  ┌────────────────────┐   │
│  │ 🍚 餐饮 · 午餐  -¥45│   │
│  │ 💰 收入 · 工资 +¥8500│   │
│  │ 🚗 交通 · 地铁  -¥12│   │
│  └────────────────────┘   │
├─────────────────────────────┤
│  首页 │ 明细 │ [+]│ 报表 │ 我的 │
└─────────────────────────────┘
```

#### 4.2.2 记一笔页面

```
┌─────────────────────────────┐
│  ← 记一笔                     │
├─────────────────────────────┤
│    支出  │  收入               │
│                             │
│        ¥ 0.00                │
│    （点击输入金额）             │
│                             │
│  ┌────┐┌────┐┌────┐┌────┐  │
│  │ 🍚 ││ 🚗 ││ 🛍 ││ 🎬 │  │
│  │餐饮││交通││购物││娱乐│  │
│  ├────┤├────┤├────┤├────┤  │
│  │ 🏠 ││ 🏥 ││ 📚 ││ 📦 │  │
│  │居住││医疗││教育││其他│  │
│  └────┘└────┘└────┘└────┘  │
│                             │
│  2026-07-12  ▸              │
│  备注...                     │
│                             │
│  ┌────────────────────┐    │
│  │  保存并查看明细      │    │
│  ├────────────────────┤    │
│  │  仅保存             │    │
│  └────────────────────┘    │
└─────────────────────────────┘
```

#### 4.2.3 统计报表

```
┌─────────────────────────────┐
│  ← 统计报表 │ 本周│本月│本年 │
├─────────────────────────────┤
│  ┌──────┐┌──────┐┌──────┐  │
│  │总收入││总支出││净收入│  │
│  └──────┘└──────┘└──────┘  │
│                             │
│  支出构成                     │
│     ┌─────┐                  │
│    ╱       ╲    餐饮  30%    │
│   │   🎯   │   交通  20%    │
│    ╲       ╱    购物  25%    │
│     └─────┘                  │
│     环形图                    │
│                             │
│  收支趋势                     │
│   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓    │
│   ▓▓▓▓▓░░░░░░▓▓▓▓▓▓▓░░░░  │
│   1月  2月  3月  ...  本月   │
│   柱状图                      │
└─────────────────────────────┘
```

#### 4.2.4 预算管理

```
┌─────────────────────────────┐
│  ← 预算管理              [+]
├─────────────────────────────┤
│  ┌────────────────────┐    │
│  │  本月总预算          │    │
│  │    ¥5,500           │    │
│  │  ████████░░░░░░░░░   │    │
│  │  已花费 ¥169       │    │
│  │  剩余 ¥5,331        │    │
│  └────────────────────┘    │
│                             │
│  分类预算                     │
│  ┌ 餐饮  ¥80/¥3000  97%  ┐ │
│  │ ████████████████████░░  │ │
│  └────────────────────┘    │
│  ┌ 交通  ¥40/¥1000  96%  ┐ │
│  └────────────────────┘    │
│  ┌ 购物  ¥89/¥1500  94%  ┐ │
│  └────────────────────┘    │
└─────────────────────────────┘
```

#### 4.2.5 我的页面

```
┌─────────────────────────────┐
│  我的                         │
├─────────────────────────────┤
│  ┌────────────────────┐    │
│  │  🅱                 │    │
│  │  👤 点击设置昵称 ✏️  │    │
│  │     点击设置性别 ▾   │    │
│  │  ┌──────┐┌──────┐  │    │
│  │  │ 8笔记账││使用1天│  │    │
│  │  └──────┘└──────┘  │    │
│  └────────────────────┘    │
│                             │
│  数据管理                     │
│  ┌────────┐ ┌────────┐     │
│  │ 📥 导出 │ │ 📤 导入 │     │
│  └────────┘ └────────┘     │
│                             │
│  危险操作                     │
│  ┌────────────────────┐    │
│  │  🗑 清空所有数据     │    │
│  └────────────────────┘    │
│                             │
│  关于                        │
│  版本 v1.0.0                 │
│  隐私政策                     │
│  关于 BoldBook               │
└─────────────────────────────┘
```

### 4.3 数据结构设计

#### 4.3.1 交易记录（Transaction）

```javascript
{
  id: "uuid-string",           // 唯一标识
  type: "expense" | "income",  // 类型
  amount: 45,                  // 金额（单位：元）
  category: "dining",          // 分类 key
  note: "午餐",                 // 备注
  date: "2026-07-12",          // 日期
  time: "12:30",               // 时间
  createdAt: 1720000000000     // 创建时间戳
}
```

#### 4.3.2 预算（Budget）

```javascript
{
  category: "dining",          // 支出分类 key
  amount: 3000                 // 月度预算金额
}
```

#### 4.3.3 用户配置（UserProfile）

```javascript
{
  nickname: "用户昵称",        // 用户昵称
  avatar: "data:image/...",    // base64 头像
  gender: "male",              // 性别：male / female / other
  onboardingDone: true         // 是否完成首次引导
}
```

#### 4.3.4 设置（Settings）

```javascript
{
  initialized: true,           // 是否已初始化
  createdAt: 1720000000000,    // 创建时间
  firstOpenDate: "2026-07-12"  // 首次打开日期
}
```

### 4.4 分类体系

#### 支出分类（8 个）

| key | name | icon | color |
|-----|------|------|-------|
| dining | 餐饮 | utensils | #FF4F87 |
| transport | 交通 | car | #00D4AA |
| shopping | 购物 | shopping-bag | #FF4F87 |
| entertainment | 娱乐 | film | #9B8BF4 |
| housing | 居住 | home | #9B8BF4 |
| medical | 医疗 | stethoscope | #FF4F87 |
| education | 教育 | book-open | #00D4AA |
| other | 其他 | package | #6B6B6B |

#### 收入分类（4 个）

| key | name | icon | color |
|-----|------|------|-------|
| salary | 工资 | banknote | #00D4AA |
| bonus | 奖金 | gift | #FFE156 |
| investment | 理财 | trending-up | #9B8BF4 |
| other | 其他 | package | #6B6B6B |

### 4.5 存储方案

```
┌───────────────────────────────────────┐
│            Storage Adapter             │
│  优先使用 Capacitor Preferences        │
│  回退方案：localStorage                │
├───────────────────────────────────────┤
│                                       │
│  boldbook_transactions  →  [tx, ...]  │
│  boldbook_budgets       →  [b, ...]    │
│  boldbook_settings      →  {...}       │
│  boldbook_user_profile  →  {...}       │
│                                       │
├───────────────────────────────────────┤
│  数据导出：Capacitor Filesystem         │
│  路径：Documents/BoldBook/xxx.json     │
└───────────────────────────────────────┘
```

### 4.6 组件树

```
app-shell
├── #main (动态渲染)
│   ├── renderOnboarding()
│   ├── renderHome()
│   │   ├── header (品牌 + 日期)
│   │   ├── overview-cards (收入/支出/结余)
│   │   ├── budget-progress (预算卡片列表)
│   │   └── recent-transactions (交易行列表)
│   ├── renderTransactions()
│   │   ├── search-bar
│   │   ├── filter-tags
│   │   ├── month-selector
│   │   └── tx-list (按日期分组)
│   ├── renderAdd()
│   │   ├── type-toggle (支出/收入)
│   │   ├── amount-display
│   │   ├── category-grid
│   │   ├── date-row
│   │   ├── note-input
│   │   └── save-buttons
│   ├── renderStats()
│   │   ├── range-tabs (本周/本月/本年)
│   │   ├── summary-cards
│   │   ├── donut-chart
│   │   └── bar-chart
│   ├── renderBudget()
│   │   ├── overview-card
│   │   └── category-list
│   └── renderProfile()
│       ├── user-card (头像/昵称/性别/统计)
│       ├── data-management (导出/导入)
│       ├── danger-zone (清空)
│       └── about-section
├── #tabbar (动态渲染)
│   ├── tab-home (首页)
│   ├── tab-transactions (明细)
│   ├── fab-add (记一笔 - 浮动按钮)
│   ├── tab-stats (报表)
│   └── tab-profile (我的)
├── #toast (全局通知)
└── #modal-overlay (全局弹窗)
    └── .modal-sheet (底部弹出面板)
```

---

## 五、编码开发

### 5.1 开发环境搭建

```
前置依赖：
├── Node.js >= 18
├── JDK 17+（兼容 JDK 21）
├── Android Studio（含 SDK Platform 35）
├── Android SDK Build-Tools 34+
├── Android SDK Platform-Tools (adb)
└── Gradle 8.11.1

步骤：
1. git clone 项目
2. cd boldbook-app
3. npm install
4. npm run build         # 拷贝字体/图标到 www/assets
5. npx cap add android   # 添加 Android 平台
6. npx cap sync          # 同步 web 到 Android 工程
7. npm run preview       # 启动本地预览 http://localhost:8000
```

### 5.2 开发命令速查

| 命令 | 用途 |
|------|------|
| `npm run build` | 构建 web 资源（拷贝字体/图标） |
| `npm run preview` | 本地开发服务器（SPA 路由支持） |
| `npm run sync` | 同步 web 代码到 Android 平台 |
| `npm run android` | 在 Android Studio 中打开项目 |
| `npm run build:apk` | 构建 Debug APK |
| `.\gradlew.bat assembleDebug` | Android 原生构建 |

### 5.3 编码规范

**命名约定：**
- 变量/函数：camelCase（`getTransactions`）
- 常量：UPPER_SNAKE（`STORAGE_KEYS`）
- CSS 类：kebab-case（`profile-name-editable`）
- 自定义属性：`--bb-*` 前缀（`--bb-yellow`）

**HTML 模板：**
- 使用模板字符串（`` ` ``）
- 通过 `icon()` 函数生成 lucide 图标
- 事件绑定通过 `data-*` 属性 + `attachEvents` 统一管理

**状态管理：**
- 全局单一 state 对象，在 app.js 中维护
- `render()` 是全量渲染，每次重新生成 HTML（SPA < 10 页面，性能足够）
- `navigate()` 切换页面，记账页重置状态

### 5.4 关键实现

#### 数据持久化适配器

```javascript
// 优先使用 Capacitor Preferences，回退 localStorage
async function setJson(key, value) {
  const json = JSON.stringify(value);
  if (window.Capacitor?.Plugins?.Preferences) {
    await Capacitor.Plugins.Preferences.set({ key, value: json });
  } else {
    localStorage.setItem(key, json);
  }
}
```

#### 金额输入控制

```javascript
// 限制：仅数字和小数点，最多两位小数
val = val.replace(/[^0-9.]/g, '');
const parts = val.split('.');
if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
if (parts[1] && parts[1].length > 2) val = parts[0] + '.' + parts[1].slice(0, 2);
```

#### 预算进度计算

```javascript
// 计算逻辑：每月首次渲染时从全部交易中过滤当月支出
const monthly = transactions.filter(t => {
  const d = new Date(t.date);
  return d >= firstDayOfMonth(now) && d <= lastDayOfMonth(now) && t.type === 'expense';
});
// 各分类已花费
const spent = monthly.filter(t => t.category === budget.category)
  .reduce((s, t) => s + t.amount, 0);
const pct = budget.amount > 0 ? Math.min(100, Math.round((spent / budget.amount) * 100)) : 0;
```

---

## 六、测试验证

### 6.1 测试用例

| 编号 | 场景 | 前置条件 | 操作步骤 | 预期结果 | 状态 |
|------|------|----------|----------|----------|------|
| TC-01 | 首次引导 | 全新安装 | 打开 App | 显示引导页，输入昵称选择性别后进入首页 | ✅ |
| TC-02 | 记一笔 | 已登录 | 点 "+" → 输入金额 45 → 选择餐饮 → 保存 | 首页交易列表显示新记录 | ✅ |
| TC-03 | 首页概览 | 有交易数据 | 打开首页 | 收入/支出/结余卡片数据正确 | ✅ |
| TC-04 | 预算进度 | 先有支出 ¥10，再设预算 ¥100 | 设置预算后查看预算页 | 已花费 ¥10，剩余 ¥90 | ✅ |
| TC-05 | 数据导出 | 有交易数据 | 我的 → 导出数据 | 文件保存到 Documents/BoldBook | ✅ |
| TC-06 | 数据导入 | 有导出文件 | 我的 → 导入数据 → 选择文件 | 数据完整恢复 | ✅ |
| TC-07 | 搜索交易 | 多条记录 | 明细页 → 输入关键字 | 过滤出匹配的交易 | ✅ |
| TC-08 | 筛选切换 | 有收支记录 | 明细页 → 点击"收入"/"支出" | 只显示对应类型 | ✅ |
| TC-09 | 编辑交易 | 已有记录 | 点击交易行 → 编辑 → 修改金额 | 数据更新 | ✅ |
| TC-10 | 删除交易 | 已有记录 | 点击交易行 → 删除 | 记录消失，数据持久清除 | ✅ |
| TC-11 | 昵称修改 | 已进入我的页面 | 点击昵称 → 输入新名字 → 回车 | 昵称即时更新 | ✅ |
| TC-12 | 性别设置 | 已进入我的页面 | 点击性别 → 选择 | 性别标签更新 | ✅ |
| TC-13 | 头像上传 | 已进入我的页面 | 点击头像 → 选择图片 | 头像更新，base64 持久化 | ✅ |
| TC-14 | 环形图报表 | 有支出数据 | 报表页 | 各分类占比正确 | ✅ |
| TC-15 | 清空数据 | 有数据 | 我的 → 清空所有数据 → 确认 | 所有数据归零 | ✅ |

### 6.2 测试环境

| 环境 | 配置 |
|------|------|
| 模拟器 | Android Studio AVD (API 35, Pixel 6) |
| 真机 | Android 14 (Redmi K70) |
| 浏览器 | Chrome 最新版（开发预览） |

### 6.3 验收标准

- [x] 所有 P0 功能完整可用
- [x] 离线场景下全部功能正常
- [x] 应用未申请 INTERNET 权限
- [x] 首次使用引导流程顺畅
- [x] 导出文件可在文件管理器中找到
- [x] 导入恢复完整，无数据丢失
- [x] 预算进度实时计算准确
- [x] 金额输入格式正确（千分位、2 位小数）

---

## 七、打包部署

### 7.1 Debug APK 构建

```powershell
# 1. 构建 web 资源
cd boldbook-app
npm install
npm run build

# 2. 同步到 Android 平台
npx cap sync

# 3. 打包 APK（需要 JDK 21）
$env:JAVA_HOME = 'D:\Android\jbr'
cd android
.\gradlew.bat assembleDebug
```

输出路径：`android/app/build/outputs/apk/debug/app-debug.apk`

### 7.2 Release APK 构建（生产分发）

```powershell
# 1. 生成签名密钥（如已有则跳过）
keytool -genkey -v -keystore boldbook-release.keystore -alias boldbook -keyalg RSA -keysize 2048 -validity 10000

# 2. 修改 android/app/build.gradle，在 android 块中添加：
#    signingConfigs {
#        release {
#            storeFile file('../boldbook-release.keystore')
#            storePassword 'xxx'
#            keyAlias 'boldbook'
#            keyPassword 'xxx'
#        }
#    }
#    buildTypes.release.signingConfig = signingConfigs.release

# 3. 打 Release APK
cd android
.\gradlew.bat assembleRelease
```

输出路径：`android/app/build/outputs/apk/release/app-release.apk`

### 7.3 分发方式

| 方式 | 说明 |
|------|------|
| USB 安装 | adb install app-debug.apk |
| 微信/QQ 发送 | APK 文件发送到手机后点击安装 |
| 第三方应用商店 | 需要 Release 签名 APK + 加固 |

---

## 八、运维迭代

### 8.1 版本规划

| 版本 | 目标 | 主要内容 |
|------|------|----------|
| v1.0.0 | MVP | 核心记账、预算、报表、数据管理 |
| v1.1.0 | 体验优化 | 编辑交易时保留时间、搜索增强、UI 微调 |
| v1.2.0 | 功能扩展 | 分类自定义、主题切换、更多图表类型 |
| v2.0.0 | 跨平台 | iOS 适配、平板布局 |

### 8.2 常见问题

**Q：安装后里面为什么有示例数据？**
> v1.0.0 初始版本使用种子数据演示。后续版本已改为首次启动数据为空。

**Q：导出的 JSON 数据在哪？**
> Android 手机上位于 `内部存储/Documents/BoldBook/` 文件夹，通过文件管理 App 可见。

**Q：换手机怎么迁移数据？**
> 旧手机导出 JSON → 新手机安装 App → 我的页面 → 导入数据。

**Q：预算进度不更新？**
> 预算进度的计算依懒于以下步骤：先确认当前月是否有相符分类的交易记录，确保设置了对应的预算。

---

## 九、附录

### 9.1 项目文件结构

```
boldbook-app/
├── android/                          # Android 原生工程
│   ├── app/
│   │   └── src/main/
│   │       ├── AndroidManifest.xml   # 权限声明
│   │       ├── assets/public/        # Web 资源（由 cap sync 同步）
│   │       └── java/                 # Android 原生代码
│   ├── build.gradle                  # 项目级 Gradle 配置
│   └── settings.gradle
│
├── node_modules/                     # 依赖包
│
├── scripts/
│   ├── copy-assets.js                # 拷贝字体/图标到 www
│   └── server.js                     # 本地预览服务器
│
├── www/                              # Web 源码根目录
│   ├── assets/
│   │   ├── fonts/                    # Space Grotesk + JetBrains Mono woff2
│   │   └── icons/lucide.min.js      # Lucide 图标运行时
│   ├── css/
│   │   └── style.css                # 全局样式（~1800 行）
│   ├── js/
│   │   ├── app.js                   # 入口/路由/导航/状态
│   │   ├── pages.js                 # 页面渲染和事件绑定
│   │   ├── data.js                  # 数据持久化层
│   │   └── utils.js                 # 工具函数/分类/UI组件
│   └── index.html                   # SPA 壳
│
├── docs/
│   └── BoldBook开发全流程文档.md     # 本文档
│
├── capacitor.config.json            # Capacitor 配置
├── package.json                     # 依赖和脚本
└── README.md
```

### 9.2 涉及的工具链

| 工具 | 用途 | 官网 |
|------|------|------|
| VS Code | 代码编辑器 | https://code.visualstudio.com |
| TRAE IDE | AI 辅助开发 | https://www.trae.cn |
| Android Studio | Android 原生构建 | https://developer.android.com/studio |
| Capacitor | 跨平台壳 | https://capacitorjs.com |
| Gradle | 构建系统 | https://gradle.org |
| Lucide | 图标库 | https://lucide.dev |
| Google Fonts | Space Grotesk / JetBrains Mono | https://fonts.google.com |

### 9.3 设计资源

- 设计风格：Neobrutalism（新粗野主义）
- 原型文件位置：`C:\Users\Administrator\.trae-cn\attachments\6a526510966c553c6b63e94e\design_extracted\pages\`
- 6 个页面原型：首页仪表盘、记一笔、交易明细、统计报表、预算管理、我的

---
