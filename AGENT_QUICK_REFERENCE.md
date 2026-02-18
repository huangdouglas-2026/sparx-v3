# 🚀 AGENT_QUICK_REFERENCE.md

> **快速決策指南 - 當你不確定時，來這裡找答案**

---

## 🎯 關鍵決策樹

### 決策 #1：這個功能應該做嗎？

```
START
  ↓
它在 PRODUCT_VISION.md 中嗎？
  ├─ NO → ❌ 不要做
  └─ YES → 繼續 ↓
      ↓
它在 DEVELOPMENT_ROADMAP.md 的當前階段嗎？
  ├─ NO → ⚠️ 詢問用戶
  └─ YES → 繼續 ↓
      ↓
它符合三大支柱嗎？
  ├─ DISCOVER (Vault)
  ├─ CULTIVATE (AI 匹配)
  └─ MULTIPLY (影響力追蹤)
      ↓
✅ 可以做
```

---

### 決策 #2：這個代碼應該寫在哪裡？

```
它是業務邏輯嗎？
  ├─ YES → /services/ 對應的子目錄
  └─ NO → 繼續 ↓
      ↓
它是可重用的 UI 元件嗎？
  ├─ YES → /components/shared/ 或 /components/ui/
  └─ NO → 繼續 ↓
      ↓
它是頁面特定的元件嗎？
  ├─ YES → /components/{頁面名}/
  └─ NO → 繼續 ↓
      ↓
它是 API 端點嗎？
  ├─ YES → /app/api/{功能}/route.ts
  └─ NO → 詢問用戶
```

---

### 決策 #3：這個 UI 符合品牌指南嗎？

```
顏色檢查：
  ├─ 主色調：#ee8c2b ✅ 或 ❌
  ├─ 背景：#221910 ✅ 或 ❌
  ├─ 表面：#332619 ✅ 或 ❌
  └─ 文字：#ffffff 或 rgba(255,255,255,0.6) ✅ 或 ❌

圓角檢查：
  ├─ 按鈕：rounded-xl (12px) ✅ 或 ❌
  ├─ 卡片：rounded-xl 或 rounded-2xl ✅ 或 ❌
  └─ 標籤：rounded-full ✅ 或 ❌

間距檢查：
  ├─ 使用 4px 基礎單位 ✅ 或 ❌
  └─ 避免奇數 ✅ 或 ❌

字級檢查：
  ├─ 頁面標題：text-2xl (24px) ✅ 或 ❌
  ├─ 卡片標題：text-xl (20px) ✅ 或 ❌
  ├─ 內文：text-sm (14px) ✅ 或 ❌
  └─ 輔助：text-xs (12px) ✅ 或 ❌
```

---

### 決策 #4：這個資料應該存在哪裡？

```
它是用戶的個人資料嗎？
  ├─ YES → Supabase RLS + profiles 表
  └─ NO → 繼續 ↓
      ↓
它是聯絡人資料嗎？
  ├─ YES → business_contacts 表
  └─ NO → 繼續 ↓
      ↓
它是價值庫內容嗎？
  ├─ YES → value_domains + stories 表
  └─ NO → 繼續 ↓
      ↓
它是互動記錄嗎？
  ├─ YES → interactions 表
  └─ NO → 詢問用戶
```

---

### 決策 #5：這個功能需要 AI 嗎？

```
它涉及分析或預測嗎？
  ├─ YES → 使用 Gemini 2.0 Flash
  └─ NO → 繼續 ↓
      ↓
它需要理解語意嗎？
  ├─ YES → 使用 Gemini 2.0 Flash
  └─ NO → 繼續 ↓
      ↓
它可以被規則取代嗎？
  ├─ YES → 使用規則（更便宜、更快）
  └─ NO → 使用 Gemini
```

---

## 📋 常見模式

### 模式 #1：創建新的服務

```typescript
// 檔案位置：services/{功能}/{功能名}Service.ts

import { createClient } from '@/lib/supabase/client';

export const {功能名}Service = {
  async getAll(): Promise<{功能名}[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('{表名}')
      .select('*');

    if (error) throw error;
    return data;
  },

  async getById(id: string): Promise<{功能名}> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('{表名}')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // ... 其他 CRUD 操作
};
```

---

### 模式 #2：創建新的元件

```typescript
// 檔案位置：components/{頁面}/{元件名}.tsx

'use client';

import { useState } from 'react';
import type { {相關型別} } from '@/types';

export function {元件名}({ prop1, prop2 }: {元件名}Props) {
  const [state, setState] = useState(initialValue);

  return (
    <div className="bg-surface-dark rounded-2xl p-4">
      {/* 內容 */}
    </div>
  );
}
```

---

### 模式 #3：創建 API 端點

```typescript
// 檔案位置：app/api/{功能}/route.ts

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { {相關型別} } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    // 驗證
    if (!body.{必需欄位}) {
      return NextResponse.json(
        { error: 'Missing required field' },
        { status: 400 }
      );
    }

    // 業務邏輯
    const { data, error } = await supabase
      .from('{表名}')
      .insert({ ...body })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## 🔍 快速查表

| 我要... | 去哪裡... | 使用什麼... |
|---------|----------|------------|
| 創建新頁面 | `/app/(main)/{頁面}/page.tsx` | React Server Component |
| 創建 API 端點 | `/app/api/{功能}/route.ts` | Next.js Route Handlers |
| 創建 UI 元件 | `/components/{類別}/{元件}.tsx` | React Client Component |
| 創建服務 | `/services/{類別}/{服務}.ts` | TypeScript + Supabase |
| 創建型別 | `/types/{類別}.ts` | TypeScript Interfaces |
| 創建 Hook | `/lib/hooks/use{功能}.ts` | React Hooks |
| 創建工具函式 | `/lib/utils/{功能}.ts` | TypeScript |

---

## ⚠️ 禁止模式

### ❌ 不要這樣做

```typescript
// ❌ 錯誤 1：在元件中直接呼叫 Supabase
export function MyComponent() {
  const [data, setData] = useState();
  useEffect(() => {
    supabase.from('table').select('*') // ❌
  }, []);
}

// ✅ 正確 1：使用服務層
export function MyComponent() {
  const [data, setData] = useState();
  useEffect(() => {
    myService.getAll().then(setData); // ✅
  }, []);
}
```

```typescript
// ❌ 錯誤 2：硬編碼顏色
<div style={{ color: '#ee8c2b' }}> // ❌

// ✅ 正確 2：使用 Tailwind CSS 變數
<div className="text-primary"> // ✅
```

```typescript
// ❌ 錯誤 3：使用 any
function process(data: any) { // ❌

// ✅ 正確 3：使用明確型別
function process(data: Story) { // ✅
```

```typescript
// ❌ 錯誤 4：忽略錯誤處理
const data = await supabase.from('table').select('*'); // ❌

// ✅ 正確 4：處理錯誤
const { data, error } = await supabase.from('table').select('*');
if (error) {
  console.error('Error:', error);
  throw error;
}
// ✅
```

---

## 🎨 品牌色調速查

```css
/* Tailwind 類別 */

/* 顏色 */
bg-primary          /* #ee8c2b */
bg-background-dark  /* #221910 */
bg-surface-dark     /* #332619 */
text-text-primary   /* #ffffff */
text-text-secondary /* rgba(255,255,255,0.6) */

/* 圓角 */
rounded-sm   /* 8px */
rounded-md   /* 12px */
rounded-lg   /* 16px */
rounded-xl   /* 24px */
rounded-full /* 圓形 */

/* 間距 */
p-4   /* 16px */
gap-3 /* 12px */
m-6   /* 24px */

/* 字級 */
text-xs    /* 12px */
text-sm    /* 14px */
text-base  /* 16px */
text-xl    /* 20px */
text-2xl   /* 24px */
```

---

## 📞 當你不確定時

```
情況 1：文檔沒有提到
→ 不要做，詢問用戶

情況 2：文檔互相衝突
→ PRODUCT_VISION.md > 其他
→ ARCHITECTURE.md > BRAND_GUIDELINES.md

情況 3：你不知道用哪個模式
→ 參考現有代碼
→ 遵循最相似的實作

情況 4：用戶要求違反文檔
→ 停止
→ 說明衝突
→ 等待決定
```

---

**版本：** 1.0
**最後更新：** 2026-02-10
**相關文檔：**
- [AGENT_COMPASS.md](./AGENT_COMPASS.md)
- [AGENT_CHECKLIST.md](./AGENT_CHECKLIST.md)
- [PRODUCT_VISION.md](./PRODUCT_VISION.md)
- [BRAND_GUIDELINES.md](./BRAND_GUIDELINES.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md)
