# Spark（星火）Logo 使用指南

> **「星星之火，可以燎原」**
> 最後更新：2026-02-10

---

## 📦 Logo 套件

### 可用文件

| 檔案名稱 | 尺寸 | 用途 |
|---------|------|------|
| `logo-spark.svg` | 512×512 | 主要 Logo（深色背景） |
| `logo-spark-light.svg` | 512×512 | 主要 Logo（淺色背景） |
| `icon-spark.svg` | 256×256 | 圖示版（僅圖形，無文字） |
| `app-icon.svg` | 512×512 | App 圖示（圓形橘色背景） |
| `logo-wordmark.svg` | 600×200 | 文字標誌（SPARK + 星火） |
| `favicon.svg` | 32×32 | 網站圖示 |

---

## 🎨 設計理念

### 核心元素

**1. 火花圖案（Spark）**
- 象徵「點燃」和「開始」
- 中央大火花代表核心價值
- 小火花代表「增殖效果」- 一個火花點燃更多火花

**2. 連結線條**
- 象徵人脈網絡的連結
- 從核心火花延伸到小火花
- 代表「關係的擴散」

**3. 色彩系統**
- 主色：橘色漸層 (#f5a559 → #ee8c2b → #d67a1f)
- 象徵溫暖、能量、活力
- 深色背景 (#221910) 專業沉穩

### 設計原則

```
✅ 簡潔 - 幾何圖形，易於識別
✅ 現代 - 流暢的曲線，漸層色彩
✅ 多層次 - 核心火花 + 小火花 + 連結線
✅ 故事性 - 視覺化「星星之火，可以燎原」
```

---

## 📐 使用規範

### 最小尺寸

| 用途 | 最小尺寸 |
|------|----------|
| 數位顯示 | 24px 高 |
| 列印品 | 10mm 高 |
| App 圖示 | 48×48px |
| Favicon | 16×16px |

### 保護空間

Logo 周圍應保留至少 **1倍 Logo 高度** 的空白區域：

```
┌─────────────────────────┐
│         (空白)          │
│   ┌───────────────┐     │
│   │               │     │
│   │   Logo 區域   │     │
│   │               │     │
│   └───────────────┘     │
│         (空白)          │
└─────────────────────────┘
```

### 推薦使用情境

| 版本 | 適用情境 |
|------|----------|
| `logo-spark.svg` | 深色背景網頁、深色主題 App |
| `logo-spark-light.svg` | 淺色背景網頁、白紙列印 |
| `icon-spark.svg` | 小尺寸顯示、導航列圖示 |
| `app-icon.svg` | App 圖示、社交媒體頭像 |
| `logo-wordmark.svg` | 首頁、標題、行銷素材 |

---

## ⚠️ 使用禁則

### ❌ 錯誤示範

```
❌ 不要拉伸或壓縮 Logo
❌ 不要更改 Logo 顏色
❌ 不要在背景雜亂的地方使用
❌ 不要使用過小的尺寸（低於最小尺寸）
❌ 不要與其他 Logo 太靠近（低於保護空間）
❌ 不要修改 Logo 元素的相對位置
❌ 不要添加額外的裝飾元素
❌ 不要使用過時的 Logo 版本
```

---

## 🎯 品牌應用範例

### 網站頁首

```html
<!-- 深色主題 -->
<a href="/">
  <img src="/logo-spark.svg" alt="Spark 星火" width="120" height="120" />
</a>

<!-- 淺色主題 -->
<a href="/">
  <img src="/logo-spark-light.svg" alt="Spark 星火" width="120" height="120" />
</a>
```

### Favicon 設定

```html
<!-- index.html -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" href="/app-icon.svg" />
```

### CSS 背景

```css
.hero-section {
  background: url('/logo-spark.svg') no-repeat center center;
  background-size: contain;
  opacity: 0.1;
}
```

---

## 🌈 色彩代碼

### 主色調（橘色系）

```css
--primary: #ee8c2b;          /* Spark 主色 */
--primary-light: #f5a559;    /* 淺色橘 */
--primary-dark: #d67a1f;     /* 深色橘 */
```

### 漸層定義

```css
.spark-gradient {
  background: linear-gradient(135deg, #f5a559 0%, #ee8c2b 50%, #d67a1f 100%);
}
```

### 背景色

```css
--background-dark: #221910;  /* 深色背景 */
--surface-dark: #332619;     /* 表面色 */
```

---

## 📱 各平台尺寸

### App 圖示

| 平台 | 尺寸 | 檔案 |
|------|------|------|
| iOS | 1024×1024 | `app-icon.svg` |
| Android | 512×512 | `app-icon.svg` |
| Favicon | 32×32, 16×16 | `favicon.svg` |
| Social Media | 1200×630 | `logo-wordmark.svg` |

### 列印建議

| 用途 | 解析度 | 檔案 |
|------|--------|------|
| 名片 | 300 DPI | `icon-spark.svg` |
| 海報 | 300 DPI | `logo-spark.svg` |
| 大型看板 | 150 DPI | `logo-wordmark.svg` |

---

## 🔧 技術規格

### SVG 格式優勢

- ✅ 可縮放而不失真
- ✅ 檔案小，載入快
- ✅ 支援動畫和互動
- ✅ 可透過 CSS 控制顏色

### 使用 SVG 建議

```html
<!-- 直接嵌入 SVG -->
<svg width="100" height="100">
  <use href="/icon-spark.svg#sparkIcon" />
</svg>

<!-- 或作為圖片 -->
<img src="/icon-spark.svg" alt="Spark Icon" class="w-8 h-8" />
```

---

## 📝 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0 | 2026-02-10 | 初始版本 |

---

## 📧 聯絡資訊

**品牌使用諮詢：**
- 如需特殊尺寸或格式，請聯繫設計團隊
- 商標使用請遵守法律規範

**檔案位置：**
```
sparx-v3/public/
├── logo-spark.svg           # 主要 Logo（深色背景）
├── logo-spark-light.svg     # 主要 Logo（淺色背景）
├── icon-spark.svg           # 圖示版
├── app-icon.svg             # App 圖示
├── logo-wordmark.svg        # 文字標誌
└── favicon.svg              # 網站圖示
```

---

**Spark（星火）™ - Ignite relationships that multiply.**
