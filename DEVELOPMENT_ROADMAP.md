# Spark (星火) - 開發路線圖

> **版本：** 2.0 - 重新定位執行計畫
> **最後更新：** 2026-02-09

---

## 一、執行總覽

```
┌─────────────────────────────────────────────────────────────┐
│                    開發時間線                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Phase 1    Phase 2    Phase 3    Phase 4    Phase 5        │
│  定位重整   核心功能   社交整合   網絡地圖   優化與擴張      │
│                                                              │
│  週 1-2     週 3-8     週 9-12    週 13-18   週 19+          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、Phase 1：定位重整（第 1-2 週）

**目標：** 重新定義產品結構與命名

### 任務清單

#### 1.1 重構 App 結構

**檔案：** [ ] `src/app/(main)/layout.tsx`

**變更：**
```typescript
// 舊導航
[TAB]: [人脈] [洞察] [掃描] [我的名片]

// 新導航
[TAB]: [Today] [Vault] [Network] [Profile]
```

**狀態：** ⏳ 待開始

---

#### 1.2 建立新的頁面路由

**檔案：**
- [ ] `src/app/(main)/today/page.tsx`
- [ ] `src/app/(main)/vault/page.tsx`
- [ ] `src/app/(main)/network/page.tsx`
- [ ] `src/app/(main)/profile/page.tsx`

**狀態：** ⏳ 待開始

---

#### 1.3 更新 TypeScript 型別

**檔案：** [ ] `src/types/`

**新增型別：**
```typescript
// vault.ts
export interface ValueDomain { ... }
export interface Story { ... }
export interface Insight { ... }

// network.ts
export interface BusinessContact { ... }
export interface RelationshipScore { ... }

// ai.ts
export interface AIMatchResult { ... }
export interface ConversationPlan { ... }
```

**狀態：** ⏳ 待開始

---

#### 1.4 更新品牌視覺

**檔案：**
- [ ] `src/app/globals.css` - 更新 CSS 變數
- [ ] `src/components/shared/BottomNav.tsx` - 重新設計導航

**變更：**
- 主色調維持 #ee8c2b
- 更新導航圖示與命名
- 更新頁面標題

**狀態：** ⏳ 待開始

---

### Phase 1 交付物

- [x] 產品願景文件（PRODUCT_VISION.md）
- [x] 技術架構文件（ARCHITECTURE.md）
- [x] 品牌指南（BRAND_GUIDELINES.md）
- [ ] 新的 App 結構
- [ ] 新的頁面路由
- [ ] 更新的型別定義
- [ ] 更新的品牌視覺

---

## 三、Phase 2：核心功能開發（第 3-8 週）

**目標：** 建立 Vault（價值寶庫）和 AI 匹配引擎

### 2.1 Vault（價值寶庫）

#### 2.1.1 價值領域管理

**檔案：** [ ] `src/services/vault/domainManager.ts`

**功能：**
```typescript
// CRUD
async createDomain(data: Partial<ValueDomain>): Promise<ValueDomain>
async getDomains(userId: string): Promise<ValueDomain[]>
async updateDomain(id: string, data: Partial<ValueDomain>): Promise<ValueDomain>
async deleteDomain(id: string): Promise<void>
```

**狀態：** ⏳ 待開始

---

#### 2.1.2 故事管理

**檔案：** [ ] `src/services/vault/storyManager.ts`

**功能：**
```typescript
// CRUD
async createStory(data: Partial<Story>): Promise<Story>
async getStories(domainId: string): Promise<Story[]>
async updateStory(id: string, data: Partial<Story>): Promise<Story>
async deleteStory(id: string): Promise<void>

// 分析
async getTopStories(userId: string): Promise<Story[]>
async getStoryUsageStats(storyId: string): Promise<StoryStats>
```

**UI 元件：**
- [ ] `src/components/vault/ValueDomain.tsx`
- [ ] `src/components/vault/StoryCard.tsx`
- [ ] `src/components/vault/StoryEditor.tsx`

**狀態：** ⏳ 待開始

---

#### 2.1.3 Vault 頁面

**檔案：** [ ] `src/app/(main)/vault/page.tsx`

**功能：**
- 顯示所有價值領域
- 顯示每個領域的故事數
- 顯示使用統計
- 快速新增故事

**狀態：** ⏳ 待開始

---

### 2.2 AI 匹配引擎

#### 2.2.1 故事匹配引擎

**檔案：** [ ] `src/services/ai/storyMatcher.ts`

**功能：**
```typescript
async matchStories(
  contactActivity: ContactActivity,
  userStories: Story[]
): Promise<MatchResult[]>
```

**演算法：**
1. 用 Gemini 分析聯絡人動態
2. 提取主題、情緒、潛在需求
3. 計算每個故事的相關性分數
4. 排序並回傳前 3 個

**狀態：** ⏳ 待開始

---

#### 2.2.2 談話規劃引擎

**檔案：** [ ] `src/services/ai/conversationPlanner.ts`

**功能：**
```typescript
async planConversation(
  contact: BusinessContact,
  story: Story,
  platform: Platform
): Promise<ConversationPlan>
```

**輸出：**
- 推薦的回應/留言文案
- 語氣建議
- 預期效果
- 替代方案

**狀態：** ⏳ 待開始

---

#### 2.2.3 關係計分引擎

**檔案：** [ ] `src/lib/relationship-engine/scoreCalculator.ts`

**功能：**
```typescript
function calculateRelationshipScore(
  inputs: RelationshipScoreInputs
): number
```

**計算因子：**
- 互動頻率（25%）
- 回應率（30%）
- 共同話題（20%）
- 最近互動（10%）
- 轉介紹次數（15%）

**狀態：** ⏳ 待開始

---

### 2.3 Today 頁面

**檔案：** [ ] `src/app/(main)/today/page.tsx`

**功能：**
- 顯示今日影響力機會
- AI 建議的互動
- 成長指標

**UI 元件：**
- [ ] `src/components/today/ImpactZone.tsx`
- [ ] `src/components/today/ActionCard.tsx`
- [ ] `src/components/today/GrowthMetrics.tsx`
- [ ] `src/components/today/ConversationStarter.tsx`

**狀態：** ⏳ 待開始

---

### Phase 2 交付物

- [ ] Vault（價值寶庫）完整功能
- [ ] AI 匹配引擎
- [ ] AI 談話規劃引擎
- [ ] 關係計分引擎
- [ ] Today 頁面
- [ ] 完整的單元測試

---

## 四、Phase 3：社交整合（第 9-12 週）

> **🚨 架構決策更新（2026-02-10）**
>
> **從 API-First 轉向 Email-First 方案**
>
> 本階段原本規劃使用 LinkedIn/Facebook API 直接整合。經過分析後，決定改用 **Email-First 整合方案**，大幅降低開發時間和用戶設定門檻。
>
> **主要變更：**
> - **開發時間：** 從 9-12 週縮減為 **2-3 週**
> - **用戶設定：** 從 5+ 步驟簡化為 **3 步驟**
> - **支援平台：** 從單一平台擴展為 **LinkedIn + Facebook 同步整合**
> - **技術方案：** 從 API 調用改為 **Gmail API + Email 解析器**
>
> **詳細說明：** 請參閱 [ARCHITECTURE.md](./ARCHITECTURE.md) 第五章「社交媒體整合架構」
>
> **決策原因：** 請參閱 [docs/2026-02-09-steve-jobs-product-analysis.md](./docs/2026-02-09-steve-jobs-product-analysis.md)

---

### 3.1 Email-First 社交整合 ✅ **採用方案**

#### 3.1.1 Google OAuth + Gmail API

**狀態：** ✅ 已完成

**檔案：**
- ✅ `services/social/google.ts` - Google OAuth 服務
- ✅ `services/social/gmail.ts` - Gmail API + Email 解析器
- ✅ `services/social/emailSyncScheduler.ts` - Email 同步排程器
- ✅ `app/api/auth/google/route.ts` - Google OAuth 起始端點
- ✅ `app/api/auth/callback/google/route.ts` - Google OAuth 回調處理
- ✅ `app/api/sync/emails/route.ts` - 手動同步端點

**功能：**
```typescript
// Google OAuth
googleService.getAuthUrl(): string
googleService.exchangeCodeForToken(code: string, state: string)

// Gmail API
gmailService.getMessages(accessToken: string, query: string)
gmailService.parseLinkedInEmail(message): EmailNotification
gmailService.parseFacebookEmail(message): EmailNotification

// Email 同步
emailSyncScheduler.syncUser(userId: string, accessToken: string)
emailSyncScheduler.getRecentNotifications(userId: string)
```

**環境變數：**
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**狀態：** ✅ 已完成

---

#### 3.1.2 資料庫遷移

**狀態：** ✅ 已完成

**檔案：** ✅ `supabase/migrations/006_create_social_notifications_table.sql`

**新增表格：**
```sql
-- social_notifications 表格
CREATE TABLE social_notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'facebook', 'instagram')),
  type TEXT NOT NULL CHECK (type IN (
    'post', 'comment', 'mention', 'like', 'connection',
    'profile_view', 'birthday', 'other'
  )),
  from TEXT,
  subject TEXT,
  content TEXT,
  url TEXT,
  email_message_id TEXT UNIQUE,
  timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 更新 social_connections 表格支援 Google
ALTER TABLE social_connections
  ADD CONSTRAINT social_connections_platform_check
  CHECK (platform IN ('linkedin', 'facebook', 'instagram', 'line', 'wechat', 'google'));
```

**狀態：** ✅ 已完成

---

#### 3.1.3 UI 元件

**狀態：** ✅ 已完成

**檔案：** ✅ `components/profile/SocialConnect.tsx`

**功能：**
- Google (Gmail) 連結 - **推薦**方式
- LinkedIn (API) 連結 - 遺留方式（已棄用）
- 顯示同步狀態和最近 7 天通知數量
- 手動同步按鈕

**UI 設計：**
```
┌─────────────────────────────────────────┐
│  📬 社交媒體整合                         │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │ 📘 Google (Gmail) [推薦]          │  │
│  │ 透過 Email 通知整合 LinkedIn/FB  │  │
│  │ [連結]                             │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ 🔗 LinkedIn (API)                 │  │
│  │ 需要申請 Developer 權限           │  │
│  │ [建議使用 Gmail 方式]             │  │
│  └───────────────────────────────────┘  │
│  💡 為什麼使用 Email 整合？            │
│  ✓ 無需申請 API                       │
│  ✓ 設定簡單                           │
│  ✓ 支援多平台                         │
└─────────────────────────────────────────┘
```

**狀態：** ✅ 已完成

---

#### 3.1.4 Email 解析器

**狀態：** ✅ 已完成

**檔案：** ✅ `services/social/gmail.ts`

**LinkedIn Email 解析：**
```typescript
parseLinkedInEmail(message: GmailMessage): EmailNotification | null

支援的通知類型：
- post: 有人發文
- comment: 有人留言
- mention: 被提及
- like: 被按讚
- connection: 連結請求
- profile_view: 個人資料被查看
```

**Facebook Email 解析：**
```typescript
parseFacebookEmail(message: GmailMessage): EmailNotification | null

支援的通知類型：
- post, comment, mention, like, birthday
```

**狀態：** ✅ 已完成

---

#### 3.1.5 同步排程器

**狀態：** ✅ 已完成

**檔案：** ✅ `services/social/emailSyncScheduler.ts`

**功能：**
```typescript
async syncAllUsers(): Promise<SyncResult>  // 同步所有用戶
async syncUser(userId: string, accessToken: string)  // 同步單一用戶
async getRecentNotifications(userId: string, limit?: number)  // 獲取最近通知
```

**同步頻率：** 每 6 小時自動執行

**查詢範圍：** 最近 7 天的 Email

**狀態：** ✅ 已完成

---

### 3.2 API-First 方案（已棄用，保留作為備選）

> **⚠️ 不建議使用**
>
> 以下內容已保留，但**不建議繼續開發**。除非 Email-First 方案無法滿足需求，否則請使用 Email 整合。

#### 3.2.1 LinkedIn 整合 (API)

#### 3.1.1 OAuth 認證

**檔案：** [ ] `src/services/social/linkedin.ts`

**功能：**
```typescript
class LinkedInService {
  async authenticate(): Promise<string>
  async getAccessToken(): Promise<string>
  async refreshToken(): Promise<string>
}
```

**狀態：** ⏳ 待開始

---

#### 3.1.2 獲取聯絡人動態

**功能：**
```typescript
async getContactActivity(contactId: string): Promise<SocialPost[]>
async getUserProfile(): Promise<LinkedInProfile>
```

**狀態：** ⏳ 待開始

---

#### 3.1.3 發布與互動

**功能：**
```typescript
async postContent(content: string): Promise<void>
async comment(postId: string, content: string): Promise<void>
async like(postId: string): Promise<void>
```

**狀態：** ⏳ 待開始

---

### 3.2 Facebook 整合

**檔案：** [ ] `src/services/social/facebook.ts`

**功能：** 與 LinkedIn 類似

**狀態：** ⏳ 待開始

---

### 3.3 同步排程器

**檔案：** [ ] `src/services/social/syncScheduler.ts`

**功能：**
```typescript
class SyncScheduler {
  async start(): Promise<void>
  async syncAllContacts(): Promise<void>
  async detectImportantActivity(activity: SocialPost[]): Promise<SocialPost | null>
  async sendNotification(contact: BusinessContact, activity: SocialPost): Promise<void>
}
```

**狀態：** ⏳ 待開始

---

### Phase 3 交付物

- [ ] LinkedIn API 整合
- [ ] Facebook API 整合
- [ ] 自動同步排程器
- [ ] 重要動態偵測
- [ ] 推播通知系統

---

## 五、Phase 4：網絡地圖（第 13-18 週）

**目標：** 建立關係視覺化與轉介紹分析

### 4.1 Network 頁面

**檔案：** [ ] `src/app/(main)/network/page.tsx`

**功能：**
- 顯示所有聯絡人
- 關係深度排序
- 篩選與搜尋

**狀態：** ⏳ 待開始

---

### 4.2 關係地圖視覺化

**檔案：** [ ] `src/components/network/RelationshipMap.tsx`

**技術：** D3.js 或 React Flow

**功能：**
- 視覺化人脈網絡
- 顯示關係深度
- 顯示轉介紹路徑

**狀態：** ⏳ 待開始

---

### 4.3 轉介紹分析

**檔案：** [ ] `src/services/contact/referralAnalyzer.ts`

**功能：**
```typescript
async analyzeReferralPotential(contactId: string): Promise<ReferralPotential>
async suggestReferralTargets(contactId: string): Promise<BusinessContact[]>
```

**狀態：** ⏳ 待開始

---

### 4.4 聯絡人詳情頁

**檔案：** [ ] `src/app/(main)/network/[id]/page.tsx`

**功能：**
- 顯示聯絡人完整資訊
- 關係深度與階段
- 互動歷史
- 轉介紹潛力
- AI 談話建議

**狀態：** ⏳ 待開始

---

### Phase 4 交付物

- [ ] Network 頁面
- [ ] 關係地圖視覺化
- [ ] 轉介紹分析引擎
- [ ] 聯絡人詳情頁
- [ ] 視覺化互動元件

---

## 六、Phase 5：優化與擴張（第 19 週+）

**目標：** 效能優化、測試、準備上市

### 5.1 效能優化

#### 5.1.1 資料庫優化

**任務：**
- [ ] 建立複合索引
- [ ] 優化查詢（避免 N+1）
- [ ] 實施資料庫分頁

**狀態：** ⏳ 待開始

---

#### 5.1.2 快取層

**任務：**
- [ ] 整合 Redis
- [ ] 實施快取策略
- [ ] 快存失效機制

**狀態：** ⏳ 待開始

---

#### 5.1.3 前端效能

**任務：**
- [ ] 程式碼分割
- [ ] 圖片優化
- [ ] 懶載入

**狀態：** ⏳ 待開始

---

### 5.2 測試

#### 5.2.1 單元測試

**目標：** 80% 覆蓋率

**工具：** Vitest

**狀態：** ⏳ 待開始

---

#### 5.2.2 整合測試

**目標：** 核心流程測試

**工具：** Playwright

**狀態：** ⏳ 待開始

---

#### 5.2.3 使用者測試

**目標：** 10 位真實用戶測試

**方法：**
- 前可用性測試
- A/B 測試
- 留言回饋

**狀態：** ⏳ 待開始

---

### 5.3 上市準備

#### 5.3.1 行銷素材

**任務：**
- [ ] 製作宣傳影片
- [ ] 製作截圖
- [ ] 撰寫 App Store / Play Store 描述

**狀態：** ⏳ 待開始

---

#### 5.3.2 文件

**任務：**
- [ ] 用戶手冊
- [ ] FAQ
- [ ] API 文件（如果公開）

**狀態：** ⏳ 待開始

---

#### 5.3.3 部署

**任務：**
- [ ] 設定 CI/CD
- [ ] 設定監控（Sentry）
- [ ] 設定分析

**狀態：** ⏳ 待開始

---

### Phase 5 交付物

- [ ] 效能優化完成
- [ ] 測試覆蓋率 > 80%
- [ ] 使用者測試報告
- [ ] 行銷素材
- [ ] 完整文件
- [ ] 部署至生產環境

---

## 七、優先事項矩陣

```
高價值 │ 🔥 Vault        │ 🚀 Today 頁面
      │ (核心差異化)     │ (核心價值)
      │                  │
──────┼──────────────────┼──────────────────
      │ 📊 Network      │ 🔗 社交整合
低價值 │ (視覺化)         │ (增強功能)
      │                  │
      └──────────────────┴──────────────────
        低可行性          高可行性
```

**優先開發順序：**
1. 🔥 Vault（高價值、可執行）
2. 🚀 Today 頁面（高價值、高可行性）
3. 🔗 社交整合（中等價值、高可行性）
4. 📊 Network（中等價值、可執行）

---

## 八、風險管理

### 技術風險

| 風險 | 影響 | 緩解策略 |
|------|------|----------|
| LinkedIn API 變更 | 高 | 建立 Wrapper 層，定期監控 API 變更 |
| AI 成本過高 | 中 | 實施快取，優化 prompt |
| 效能瓶頸 | 中 | 資料庫優化、快取層 |

---

### 產品風險

| 風險 | 影響 | 緩解策略 |
|------|------|----------|
| 用戶不想分享故事 | 高 | 提供範本、引導式建立 |
| 隱私擔憂 | 高 | 透明化隱私政策、RLS |
| 學習曲線過陡 | 中 | Onboarding、教學影片 |

---

## 九、成功指標（KPIs）

### Phase 1-2（核心功能）

- [ ] 用戶建立 > 5 個故事
- [ ] AI 匹配準確率 > 70%
- [ ] 用戶使用 AI 建議 > 60%

### Phase 3（社交整合）

- [ ] LinkedIn 連結成功率 > 90%
- [ ] 自動同步頻率：每 6 小時
- [ ] 重要動態偵測準確率 > 80%

### Phase 4（網絡地圖）

- [ ] 關係地圖載入時間 < 2 秒
- [ ] 轉介紹潛力預測準確率 > 60%

### Phase 5（上市）

- [ ] 應用程式評分 > 4.5
- [ ] 用戶留存率（30 天）> 40%
- [ ] 付費轉換率 > 5%

---

## 十、下週優先任務

**本週（週 1）：**
1. ✅ 建立產品願景文件
2. ✅ 建立技術架構文件
3. ✅ 建立品牌指南
4. ✅ 建立開發路線圖

**下週（週 2）：**
1. [ ] 重構 App 結構（新導航）
2. [ ] 建立新的頁面路由
3. [ ] 更新 TypeScript 型別
4. [ ] 開始 Vault 開發

---

**文檔版本：** 1.0
**最後更新：** 2026-02-09
**下次更新：** 每週五
