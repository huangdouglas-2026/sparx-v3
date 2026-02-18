# Spark (星火) - 遷移計畫

> **目標：** 在現有專案基礎上，從「聯絡人管理工具」遷移到「人脈資本 AI 戰略顧問」
>
> **原則：** 保留可用的資產，替換不符合新架構的部分，避免開發混淆

---

## 📊 現有程式碼審查結果

### ✅ 可以保留（無需修改）

| 檔案 | 原因 | 備註 |
|------|------|------|
| **src/lib/supabase/client.ts** | Supabase 客戶端設定完善 | 繼續使用 |
| **src/lib/supabase/server.ts** | 伺服器端客戶端設定完善 | 繼續使用 |
| **src/services/geminiService.ts** | Gemini API 已整合，架構良好 | 擴展功能，不改動核心 |
| **src/services/contactService.ts** | 聯絡人 CRUD 完整 | 保留並擴展 |
| **src/services/articleService.ts** | 文章服務完整 | 可轉型為 Story 服務 |
| **.env.local** | 環境變數已設定完成 | 繼續使用 |

**可保留的資產價值：**
- ✅ Supabase 連結與認證
- ✅ Gemini API 整合（可擴展）
- ✅ 聯絡人資料表（可擴展為 business_contacts）
- ✅ 文章資料表（可轉型為 stories）
- ✅ 型別定義基礎

---

### 🔄 需要重構（保留核心，替換 UI）

| 檔案/元件 | 當前問題 | 新用途 | 行動 |
|----------|---------|--------|------|
| **src/components/TabBar.tsx** | 舊導航：人脈/洞察/掃描/名片 | 新導航：Today/Vault/Network/Profile | 重命名與重導向 |
| **src/components/Login.tsx** | 登入流程完整 | 保留，微調文案 | 小修改 |
| **src/components/ContactEditor.tsx** | 26個欄位過多 | 簡化為 6-8 個核心欄位 | 重構 |
| **src/components/ContactDetail.tsx** | 資訊過載 | 重新設計為「AI 洞察 + 快速行動」 | 重構 |

**重構策略：**
- 保留元件邏輯
- 替換 UI 結構
- 調整資料流

---

### ❌ 需要替換（不符合新架構）

| 檔案/元件 | 原因 | 替換為 | 行動 |
|----------|------|--------|------|
| **src/components/NetworkingDashboard.tsx** | 舊的「聯絡人列表」邏輯 | Today 頁面 | 建立新元件 |
| **src/components/AIArticleSharer.tsx** | 「文章分享」不是核心功能 | Vault 頁面 | 建立新元件 |
| **src/components/BusinessCardScanner.tsx** | 名片掃描保留 | 整合到 Network | 保留並整合 |
| **src/components/MyDigitalBusinessCard.tsx** | 數位名片保留 | Profile 頁面 | 保留並整合 |
| **src/components/DigitalBusinessCardEditor.tsx** | 名片編輯保留 | Profile 頁面 | 保留並整合 |
| **src/components/PublicProfile.tsx** | 公開檔案保留 | Profile 頁面 | 保留並整合 |
| **src/components/SocialActivityFeed.tsx** | 模擬資料 | 真實社交整合 | 替換 |

**替換策略：**
- 保留名片相關功能（這是核心功能之一）
- 建立新的 Today 和 Vault 元件
- 整合到新架構

---

### 📁 需要建立的（新功能）

| 檔案 | 用途 | 優先級 |
|------|------|--------|
| **src/app/(main)/today/page.tsx** | 今日戰場頁面 | P0 |
| **src/app/(main)/vault/page.tsx** | 價值寶庫頁面 | P0 |
| **src/app/(main)/network/page.tsx** | 人脈網絡頁面 | P1 |
| **src/app/(main)/profile/page.tsx** | 個人品牌頁面 | P1 |
| **src/components/today/ImpactZone.tsx** | 影響力機會區 | P0 |
| **src/components/today/ActionCard.tsx** | 行動卡片 | P0 |
| **src/components/vault/ValueDomain.tsx** | 價值領域卡片 | P0 |
| **src/components/vault/StoryCard.tsx** | 故事卡片 | P0 |
| **src/components/vault/StoryEditor.tsx** | 故事編輯器 | P0 |
| **src/components/network/RelationshipMap.tsx** | 關係地圖 | P1 |
| **src/services/ai/storyMatcher.ts** | 故事匹配引擎 | P0 |
| **src/services/ai/conversationPlanner.ts** | 談話規劃引擎 | P0 |
| **src/services/vault/storyManager.ts** | 故事管理服務 | P0 |
| **src/services/vault/domainManager.ts** | 價值領域管理 | P1 |
| **src/services/social/linkedin.ts** | LinkedIn 整合 | P1 |
| **src/services/social/facebook.ts** | Facebook 整合 | P1 |
| **src/types/vault.ts** | Vault 型別 | P0 |
| **src/types/network.ts** | Network 型別 | P0 |
| **src/types/ai.ts** | AI 型別 | P0 |

---

## 🎯 遷移策略：三階段執行

### 階段一：建立新基礎（不刪除舊的）

**目標：** 建立新的目錄結構和型別系統

**任務：**

1. **建立新的目錄結構**
```bash
mkdir -p src/app/(main)/today
mkdir -p src/app/(main)/vault
mkdir -p src/app/(main)/network
mkdir -p src/app/(main)/profile

mkdir -p src/components/today
mkdir -p src/components/vault
mkdir -p src/components/network
mkdir -p src/components/profile

mkdir -p src/services/ai
mkdir -p src/services/vault
mkdir -p src/services/social

mkdir -p src/types
```

2. **建立新的型別檔案**
- [ ] `src/types/vault.ts` - Vault 相關型別
- [ ] `src/types/network.ts` - Network 相關型別
- [ ] `src/types/ai.ts` - AI 相關型別

3. **保留舊的型別**
- `src/types.ts` → 保留，逐步遷移到新檔案

**交付物：**
- ✅ 新的目錄結構
- ✅ 新的型別定義
- ✅ 舊程式碼完整保留

---

### 階段二：建立新功能（並行開發）

**目標：** 建立 Vault 和 Today 頁面

**任務：**

#### 2.1 Vault（價值寶庫）

**步驟：**
1. **建立資料表**
   ```sql
   CREATE TABLE value_domains ( ... );
   CREATE TABLE stories ( ... );
   ```

2. **建立服務層**
   - [ ] `src/services/vault/domainManager.ts`
   - [ ] `src/services/vault/storyManager.ts`

3. **建立 UI 元件**
   - [ ] `src/components/vault/ValueDomain.tsx`
   - [ ] `src/components/vault/StoryCard.tsx`
   - [ ] `src/components/vault/StoryEditor.tsx`

4. **建立頁面**
   - [ ] `src/app/(main)/vault/page.tsx`

**可利用的現有資產：**
- ✅ `articleService.ts` 的架構 → 參考建立 `storyManager.ts`
- ✅ Supabase 連結 → 直接使用
- ✅ 型別定義 → 參考建立新的 Vault 型別

---

#### 2.2 AI 引擎

**步驟：**
1. **擴展 `geminiService.ts`**
   - 不修改現有函式
   - 新增 `matchStories()` 函式
   - 新增 `planConversation()` 函式

2. **建立新的服務**
   - [ ] `src/services/ai/storyMatcher.ts`（調用 geminiService）
   - [ ] `src/services/ai/conversationPlanner.ts`（調用 geminiService）

**可利用的現有資產：**
- ✅ `geminiService.ts` → 直接擴展，不重寫
- ✅ Gemini API 連結 → 直接使用

---

#### 2.3 Today 頁面

**步驟：**
1. **建立頁面**
   - [ ] `src/app/(main)/today/page.tsx`

2. **建立元件**
   - [ ] `src/components/today/ImpactZone.tsx`
   - [ ] `src/components/today/ActionCard.tsx`

3. **整合現有服務**
   - 使用 `contactService.ts`（無需修改）
   - 使用新的 AI 引擎

**可利用的現有資產：**
- ✅ `contactService.ts` → 直接使用
- ✅ `geminiService.ts` → 直接使用
- ✅ `getDailySpark()` 函式 → 可擴展為「今日焦點」

---

### 階段三：整合與清理（最後階段）

**目標：** 整合新舊功能，刪除不需要的程式碼

**任務：**

#### 3.1 整合名片功能

**保留：**
- `BusinessCardScanner.tsx` → 整合到 Network 頁面
- `MyDigitalBusinessCard.tsx` → 整合到 Profile 頁面
- `DigitalBusinessCardEditor.tsx` → 整合到 Profile 頁面

#### 3.2 更新導航

**修改：**
- `TabBar.tsx` → 更新為 Today/Vault/Network/Profile

#### 3.3 清理舊程式碼

**刪除（在驗證新功能正常後）：**
- `NetworkingDashboard.tsx`（被 Today 頁面取代）
- `AIArticleSharer.tsx`（被 Vault 頁面取代）

**保留：**
- `ContactEditor.tsx`（簡化後保留）
- `ContactDetail.tsx`（重新設計後保留）

---

## 🗂️ 檔案遷移清單

### 當前檔案狀態

```
src/
├── services/                       # 服務層
│   ├── geminiService.ts           # ✅ 保留並擴展
│   ├── contactService.ts          # ✅ 保留並擴展
│   ├── articleService.ts          # 🔄 轉型為 storyService
│   └── profileService.ts          # 🔄 評估是否需要
│
├── components/                     # 元件
│   ├── Login.tsx                  # ✅ 保留，微調文案
│   ├── TabBar.tsx                 # 🔄 更新導航
│   ├── NetworkingDashboard.tsx    # ❌ 替換為 Today 頁面
│   ├── ContactEditor.tsx          # 🔄 簡化
│   ├── ContactDetail.tsx          # 🔄 重新設計
│   ├── AIArticleSharer.tsx        # ❌ 替換為 Vault 頁面
│   ├── BusinessCardScanner.tsx    # ✅ 保留並整合
│   ├── MyDigitalBusinessCard.tsx  # ✅ 保留並整合
│   ├── DigitalBusinessCardEditor.tsx # ✅ 保留並整合
│   ├── PublicProfile.tsx          # ✅ 保留並整合
│   └── SocialActivityFeed.tsx     # ❌ 替換為真實社交整合
│
├── lib/                            # 工具庫
│   └── supabase/
│       ├── client.ts              # ✅ 保留
│       └── server.ts              # ✅ 保留
│
├── app/                            # Next.js App Router
│   └── (main)/                     # 主要應用
│       ├── layout.tsx              # 🔄 更新導航
│       └── page.tsx                # 🔄 重導向到 Today
│
└── types.ts                        # 🔄 逐步遷移到新檔案
```

---

## 📋 遷移檢核清單

### 週 2：建立新結構

- [ ] 建立新的目錄結構
- [ ] 建立新的型別檔案（vault.ts, network.ts, ai.ts）
- [ ] 設定資料表（value_domains, stories）
- [ ] 測試 Supabase 連結（應該已經可用）

### 週 3-4：開發 Vault

- [ ] 建立 Vault 頁面
- [ ] 建立 ValueDomain 元件
- [ ] 建立 StoryCard 元件
- [ ] 建立 StoryEditor 元件
- [ ] 整合現有 geminiService
- [ ] 測試基本功能

### 週 5-6：開發 AI 引擎

- [ ] 擴展 geminiService（新增 matchStories, planConversation）
- [ ] 建立 storyMatcher.ts
- [ ] 建立 conversationPlanner.ts
- [ ] 測試 AI 匹配準確度

### 週 7-8：開發 Today 頁面

- [ ] 建立 Today 頁面
- [ ] 建立 ImpactZone 元件
- [ ] 建立 ActionCard 元件
- [ ] 整合 contactService
- [ ] 整合 AI 引擎
- [ ] 測試核心流程

### 週 9-10：整合與測試

- [ ] 整合名片功能到 Network/Profile
- [ ] 更新 TabBar 導航
- [ ] 刪除舊元件（驗證後）
- [ ] 完整測試
- [ ] 部署到測試環境

---

## ⚠️ 避免混淆的關鍵原則

### 1. 新舊並存，不立即刪除

**❌ 不要做：**
```bash
# 錯誤：立即刪除舊檔案
rm src/components/NetworkingDashboard.tsx
```

**✅ 應該做：**
```bash
# 正確：保留舊檔案，建立新檔案
# 舊的：src/components/NetworkingDashboard.tsx（保留）
# 新的：src/app/(main)/today/page.tsx（建立）
```

### 2. 清晰的檔案命名

**原則：**
- 舊檔案保持原名（避免 Git 衝突）
- 新檔案使用新命名（反映新架構）

**範例：**
```
舊：NetworkingDashboard.tsx  （保留）
新：today/page.tsx           （新建）

舊：AIArticleSharer.tsx      （保留）
新：vault/page.tsx           （新建）
```

### 3. 分支策略

```bash
# 在現有專案中建立功能分支
git checkout -b feature/v2-refactor

# 階段一：建立新結構
git commit -m "feat: 建立新的目錄結構和型別系統"

# 階段二：開發新功能
git commit -m "feat: 實作 Vault 頁面"
git commit -m "feat: 實作 AI 匹配引擎"

# 階段三：整合與清理
git commit -m "refactor: 整合新舊功能"
git commit -m "chore: 移除舊元件"
```

### 4. 漸進式替換

**原則：** 新功能完成並測試通過後，再刪除舊功能

**流程：**
```
1. 建立新元件 → src/app/(main)/today/page.tsx
2. 測試新元件 → 確保功能正常
3. 更新路由 → 指向新元件
4. 觀察一段時間 → 確保無問題
5. 刪除舊元件 → src/components/NetworkingDashboard.tsx
```

---

## 🎯 立即可執行的下一步

### 1. 建立新的目錄結構（10 分鐘）

```bash
cd c:\SparX_V2

# 建立新目錄
mkdir -p src/app/(main)/today
mkdir -p src/app/(main)/vault
mkdir -p src/app/(main)/network
mkdir -p src/app/(main)/profile

mkdir -p src/components/today
mkdir -p src/components/vault
mkdir -p src/components/network
mkdir -p src/components/profile

mkdir -p src/services/ai
mkdir -p src/services/vault
mkdir -p src/services/social

mkdir -p src/types
```

### 2. 建立新的型別檔案（30 分鐘）

建立三個新的型別檔案，基於 `ARCHITECTURE.md` 的定義：
- [ ] `src/types/vault.ts`
- [ ] `src/types/network.ts`
- [ ] `src/types/ai.ts`

### 3. 設定資料表（15 分鐘）

執行 `ARCHITECTURE.md` 中的 SQL 腳本：
```sql
CREATE TABLE value_domains ( ... );
CREATE TABLE stories ( ... );
```

### 4. 驗證現有資產（5 分鐘）

確認以下服務正常運作：
```bash
npm run dev

# 測試：
- ✅ Supabase 連結
- ✅ Gemini API 連結
- ✅ 聯絡人 CRUD
```

---

## 📊 遷移風險評估

| 風險 | 影響 | 緩解策略 |
|------|------|----------|
| 舊程式碼干擾開發 | 中 | 使用清晰的新檔案命名，不混合 |
| 資料遷移問題 | 高 | 保留舊資料表，建立新資料表，逐步遷移 |
| 型別衝突 | 低 | 新的型別檔案，不修改舊的 types.ts |
| Git 歷史混亂 | 低 | 使用功能分支，清晰的 commit 訊息 |

---

## 📞 需要協助？

如果您在遷移過程中遇到任何問題：

1. **檢查這份文件** - 答案可能在這裡
2. **參考 ARCHITECTURE.md** - 技術細節
3. **參考 DEVELOPMENT_ROADMAP.md** - 執行順序

---

**最後更新：** 2026-02-09
**版本：** 1.0
**狀態：** 準備開始執行
