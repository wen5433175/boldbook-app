# BoldBook

> 离线个人记账 App · Neobrutalism 设计风格

一个轻量、离线的个人记账 Android 应用。数据全部存储在本地，无需注册、无需联网，保护你的隐私。

---

## 功能

| 模块 | 功能 |
|------|------|
| **首页** | 本月收支概览（收入/支出/结余）、月预算进度、最近交易（显示备注） |
| **记一笔** | 支出/收入切换、分类选择、日期/备注、金额输入支持小数 |
| **明细** | 按日期分组的完整交易流水、关键字搜索、收支筛选、月份切换 |
| **报表** | 分类支出环形图、月度收支趋势柱状图 |
| **预算** | 月度总预算设置，所有支出自动扣除，实时进度追踪 |
| **我的** | 昵称/头像/性别自定义、设置月度预算、数据导出/导入/清空 |

## 截图

| | | |
|:-:|:-:|:-:|
| 首页仪表盘 | 记一笔 | 统计报表 |
| 预算管理 | 交易明细 | 我的 |

## 技术栈

| 层 | 选型 |
|---|------|
| 界面 | Vanilla JS（无框架）+ Neobrutalism CSS |
| 图标 | Lucide |
| 字体 | Space Grotesk + JetBrains Mono |
| 跨平台 | Capacitor 7 |
| 存储 | Capacitor Preferences（回退 localStorage） |
| 文件 | Capacitor Filesystem（导出/导入） |
| 构建 | Gradle 8.11 + Android SDK 35 |

## 下载

| 版本 | APK |
|------|-----|
| v1.0.0 | [BoldBook-v1.0.0.apk](BoldBook-v1.0.0.apk) |

> 下载后通过 USB、微信、QQ 等方式发送到手机安装即可。

## 开发

```bash
# 前置依赖
# - Node.js >= 18
# - JDK 21（推荐 Android Studio 自带的 jbr）
# - Android Studio + SDK Platform 35

# 克隆
git clone https://github.com/wen5433175/boldbook-app.git
cd boldbook-app

# 安装依赖
npm install

# 构建 web 资源（拷贝字体/图标）
npm run build

# 添加 Android 平台（首次）
npx cap add android

# 同步代码
npx cap sync

# 构建 APK
cd android
./gradlew assembleDebug
```

APK 输出路径：`android/app/build/outputs/apk/debug/app-debug.apk`

## 设计

- 风格：Neobrutalism（新粗野主义）
  - 粗黑边框、硬阴影、鲜明色彩
  - 奶油色背景（#FFFBF0）
  - 卡片交错弹入动画
- App 图标：黄色 + 黑框 + B 字母
- 启动画面：奶酪色全屏

## 隐私

- 零联网权限，应用不会请求 INTERNET
- 所有数据存储在设备本地
- 数据导出为 JSON 格式，用户完全可控
