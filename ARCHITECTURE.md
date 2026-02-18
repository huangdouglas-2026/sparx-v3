# Spark (星火) - 技術架構文件

> **版本：** 2.0 - 重新定位架構
> **最後更新：** 2026-02-09

---

## 一、技術堆疊總覽

### 當前技術堆疊

```yaml
前端框架: React 19 + TypeScript
建置工具: Vite
後端框架: Next.js (App Router)
資料庫: Supabase (PostgreSQL)
身份驗證: Supabase Auth (Google OAuth)
AI 服務: Google Gemini 2.0 Flash
樣式系統: Tailwind CSS
部署平台: TBD
```

---

## 二、專案結構

### 重新設計的目錄結構

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 認證路由群組
│   │   └── login/
│   │       └── page.tsx
│   ├── (main)/                   # 主要應用路由群組
│   │   ├── layout.tsx            # 主佈局（含底部導航）
│   │   ├── today/                # 今日戰場
│   │   │   └── page.tsx
│   │   ├── vault/                # 價值寶庫
│   │   │   ├── page.tsx
│   │   │   ├── create/           # 新增故事
│   │   │   └── [id]/             # 故事詳情
│   │   ├── network/              # 人脈網絡
│   │   │   ├── page.tsx
│   │   │   └── [id]/             # 聯絡人詳情
│   │   └── profile/              # 個人品牌
│   │       ├── page.tsx
│   │       └── edit/
│   ├── api/                      # API Routes
│   │   ├── ai/                   # AI 服務
│   │   │   ├── match-stories/    # 故事匹配
│   │   │   ├── plan-conversation/ # 談話規劃
│   │   │   └── analyze-influence/ # 影響力分析
│   │   ├── contacts/             # 聯絡人 CRUD
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   ├── vault/                # 價值庫
│   │   │   ├── stories/          # 故事管理
│   │   │   ├── domains/          # 價值領域
│   │   │   └── insights/         # 見解管理
│   │   ├── social/               # 社交媒體整合
│   │   │   ├── linkedin/         # LinkedIn Webhooks
│   │   │   ├── facebook/         # Facebook Graph API
│   │   │   └── sync/             # 同步狀態
│   │   └── analytics/            # 分析數據
│   │       ├── impact/           # 影響力追蹤
│   │       └── relationships/    # 關係計分
│   ├── layout.tsx                # 根佈局
│   ├── page.tsx                  # 首頁（重導向）
│   └── globals.css               # 全域樣式
│
├── components/                   # React 元件
│   ├── today/                    # Today 頁面元件
│   │   ├── ImpactZone.tsx        # 影響力機會區
│   │   ├── ActionCard.tsx        # 行動卡片
│   │   ├── GrowthMetrics.tsx     # 成長指標
│   │   └── ConversationStarter.tsx # 談話啟動器
│   ├── vault/                    # Vault 頁面元件
│   │   ├── ValueDomain.tsx       # 價值領域卡片
│   │   ├── StoryCard.tsx         # 故事卡片
│   │   ├── StoryEditor.tsx       # 故事編輯器
│   │   ├── InsightBank.tsx       # 見解庫
│   │   └── TrendingStories.tsx   # 熱門故事
│   ├── network/                  # Network 頁面元件
│   │   ├── RelationshipMap.tsx   # 關係地圖（視覺化）
│   │   ├── ContactCard.tsx       # 聯絡人卡片
│   │   ├── RelationshipScore.tsx # 關係分數顯示
│   │   ├── ReferralTree.tsx      # 轉介紹樹
│   │   └── NetworkAnalytics.tsx  # 網絡分析
│   ├── profile/                  # Profile 頁面元件
│   │   ├── BrandStory.tsx        # 品牌故事編輯器
│   │   ├── ValueShowcase.tsx     # 價值展示
│   │   ├── PublicStories.tsx     # 公開故事列表
│   │   └── QRCodeShare.tsx       # QR Code 分享
│   ├── shared/                   # 共用元件
│   │   ├── BottomNav.tsx         # 底部導航
│   │   ├── Header.tsx            # 頁面標題
│   │   ├── Button.tsx            # 按鈕
│   │   ├── Card.tsx              # 卡片
│   │   ├── Modal.tsx             # 彈出視窗
│   │   └── Loading.tsx           # 載入狀態
│   └── ui/                       # 基礎 UI 元件（可來自 shadcn/ui）
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ...
│
├── services/                     # 業務邏輯服務
│   ├── ai/                       # AI 服務
│   │   ├── storyMatcher.ts       # 故事匹配引擎
│   │   ├── conversationPlanner.ts # 談話規劃引擎
│   │   ├── influenceAnalyzer.ts  # 影響力分析引擎
│   │   ├── relationshipScorer.ts # 關係計分引擎
│   │   └── geminiClient.ts       # Gemini API 客戶端
│   ├── social/                   # 社交媒體服務
│   │   ├── linkedin.ts           # LinkedIn API 整合
│   │   ├── facebook.ts           # Facebook Graph API 整合
│   │   ├── instagram.ts          # Instagram Basic Display API
│   │   └── syncScheduler.ts      # 同步排程器
│   ├── vault/                    # 價值庫服務
│   │   ├── storyManager.ts       # 故事 CRUD
│   │   ├── domainManager.ts      # 價值領域管理
│   │   ├── insightTracker.ts     # 見解追蹤
│   │   └── usageAnalytics.ts     # 使用分析
│   ├── contact/                  # 聯絡人服務
│   │   ├── contactService.ts     # 聯絡人 CRUD
│   │   ├── intelligenceService.ts # 聯絡人情報
│   │   └── interactionTracker.ts # 互動追蹤
│   └── auth/                     # 認證服務
│       └── sessionManager.ts     # 會話管理
│
├── lib/                          # 工具函式庫
│   ├── supabase/                 # Supabase 客戶端
│   │   ├── client.ts             # 瀏覽器端
│   │   └── server.ts             # 伺服器端
│   ├── relationship-engine/      # 關係引擎
│   │   ├── scoreCalculator.ts    # 分數計算器
│   │   ├── stageDetector.ts      # 階段偵測
│   │   └── potentialAnalyzer.ts  # 潛力分析
│   ├── hooks/                    # 自定 Hooks
│   │   ├── useAuth.ts
│   │   ├── useVault.ts
│   │   ├── useNetwork.ts
│   │   └── useAI.ts
│   └── utils/                    # 工具函式
│       ├── date.ts
│       ├── text.ts
│       └── validation.ts
│
├── types/                        # TypeScript 型別
│   ├── index.ts                  # 統一匯出
│   ├── vault.ts                  # Vault 相關型別
│   ├── network.ts                # Network 相關型別
│   ├── ai.ts                     # AI 相關型別
│   └── social.ts                 # 社交媒體相關型別
│
└── config/                       # 設定檔
    ├── site.ts                   # 網站設定
    ├── ai.ts                     # AI 設定
    └── social.ts                 # 社交媒體 API 設定
```

---

## 三、資料模型

### 核心資料結構

#### 1. ValueDomain（價值領域）

```typescript
interface ValueDomain {
  id: string;                    // UUID
  user_id: string;               // 使用者 ID
  name: string;                  // 例如：登山、咖啡、親子育兒
  icon: string;                  // 🏔️、☕、👨‍👧
  color: string;                 // 主色調
  description?: string;          // 描述
  is_public: boolean;            // 是否公開給所有聯絡人
  display_order: number;         // 顯示順序
  created_at: string;
  updated_at: string;

  // 關聯
  stories?: Story[];
  usage_count?: number;          // 被使用了幾次？
}
```

**Supabase Table:**
```sql
CREATE TABLE value_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_value_domains_user ON value_domains(user_id);
```

---

#### 2. Story（故事）

```typescript
interface Story {
  id: string;
  user_id: string;
  domain_id: string;             // 屬於哪個價值領域
  title: string;                 // 「迷路3小時學到的事」
  experience: string;            // 我的真實經驗
  lessons: string[];             // 學到的教訓（JSON）
  shareable_content: {           // 可分享的內容（JSON）
    platform: 'linkedin' | 'facebook' | 'line' | 'instagram';
    content: string;
  }[];
  tags: string[];                // 標籤（JSON）
  is_public: boolean;            // 是否公開
  created_at: string;
  updated_at: string;

  // 統計
  used_count?: number;           // 被使用了幾次？
  like_count?: number;           // 被喜歡幾次？
  view_count?: number;           // 被查看幾次？

  // 關聯
  domain?: ValueDomain;
  insights?: Insight[];
}
```

**Supabase Table:**
```sql
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  domain_id UUID REFERENCES value_domains(id) NOT NULL,
  title TEXT NOT NULL,
  experience TEXT NOT NULL,
  lessons JSONB DEFAULT '[]',
  shareable_content JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  is_public BOOLEAN DEFAULT true,
  used_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stories_user ON stories(user_id);
CREATE INDEX idx_stories_domain ON stories(domain_id);
CREATE INDEX idx_stories_tags ON stories USING GIN(tags);
```

---

#### 3. BusinessContact（業務聯絡人）

```typescript
interface BusinessContact {
  id: string;
  user_id: string;

  // 基礎資訊（精簡）
  name: string;
  avatar_url?: string;
  title?: string;
  company?: string;

  // AI 分析的「聯絡人情報」
  intelligence: {
    linkedin_profile?: {
      url: string;
      last_sync: string;
      recent_posts: SocialPost[];
    };
    facebook_profile?: {
      url: string;
      last_sync: string;
      recent_posts: SocialPost[];
    };
    interests: string[];         // AI 推斷的興趣
    recent_activity_summary: string; // AI 生成的摘要
  };

  // AI 分析的「關係深度」
  relationship: {
    score: number;               // 0-100
    stage: 'stranger' | 'acquaintance' | 'friend' | 'advocate';
    last_interaction: string;
    interaction_frequency: number; // 每週幾次？
    response_rate: number;       // 回應率 0-1
    mutual_topics: string[];     // 共同話題
  };

  // 轉介紹潛力
  referral: {
    potential: number;           // 0-100
    successful_referrals: number;
    potential_connections: string[]; // 可能介紹的人
  };

  // 元資料
  created_at: string;
  updated_at: string;
}
```

**Supabase Table:**
```sql
CREATE TABLE business_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  title TEXT,
  company TEXT,

  -- 情報（JSONB）
  intelligence JSONB DEFAULT '{}',

  -- 關係（JSONB）
  relationship JSONB DEFAULT '{}',

  -- 轉介紹（JSONB）
  referral JSONB DEFAULT '{}',

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_business_contacts_user ON business_contacts(user_id);
CREATE INDEX idx_business_contacts_relationship_score
  ON business_contacts((relationship->>'score')::numeric);
```

---

#### 4. Interaction（互動記錄）

```typescript
interface Interaction {
  id: string;
  user_id: string;
  contact_id: string;            // 與誰互動

  // 互動內容
  type: 'post' | 'comment' | 'message' | 'meeting';
  platform: 'linkedin' | 'facebook' | 'instagram' | 'line' | 'email' | 'in_person';
  content: string;

  // 使用的資源
  story_id?: string;             // 使用了哪個故事？

  // 影響力
  impact: {
    direct_views: number;        // 直接看見的人
    network_views: number;       // 朋友的朋友看見的
    new_connections: string[];   // 新增的連結 ID
    engagement_rate: number;     // 互動率
  };

  // 聯絡人的回應
  response?: {
    did_respond: boolean;
    response_time?: string;      // 多久後回應？
    response_type?: string;      // 回應類型
  };

  created_at: string;
}
```

**Supabase Table:**
```sql
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  contact_id UUID REFERENCES business_contacts(id) NOT NULL,

  type TEXT NOT NULL,
  platform TEXT NOT NULL,
  content TEXT NOT NULL,

  story_id UUID REFERENCES stories(id),

  impact JSONB DEFAULT '{}',
  response JSONB,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_interactions_user ON interactions(user_id);
CREATE INDEX idx_interactions_contact ON interactions(contact_id);
CREATE INDEX idx_interactions_created ON interactions(created_at DESC);
```

---

## 四、AI 引擎架構

### 1. Story Matcher（故事匹配引擎）

**目的：** 根據聯絡人的動態，匹配最相關的用戶故事

**流程：**
```typescript
// services/ai/storyMatcher.ts

interface MatchRequest {
  contactActivity: {
    type: 'linkedin_post' | 'facebook_post' | 'life_event';
    content: string;
    topics: string[];
  };
  userStories: Story[];
}

interface MatchResult {
  story: Story;
  relevanceScore: number;        // 0-100
  why: string;                   // 為什麼匹配？
  suggestedActions: SuggestedAction[];
}

async function matchStories(request: MatchRequest): Promise<MatchResult[]> {
  // 1. 用 Gemini 分析聯絡人動態
  const activityAnalysis = await geminiClient.analyze({
    prompt: `分析這則動態的主要主題、情緒、和潛在需求：${request.contactActivity.content}`,
    outputFormat: 'json'
  });

  // 2. 用 Gemini 計算每個故事的相關性
  const matches = await Promise.all(
    request.userStories.map(async (story) => {
      const relevance = await geminiClient.calculateRelevance({
        activity: activityAnalysis,
        story: story
      });

      return {
        story,
        relevanceScore: relevance.score,
        why: relevance.reason,
        suggestedActions: await generateSuggestedActions(story, request.contactActivity)
      };
    })
  );

  // 3. 排序並回傳前 3 個
  return matches
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 3);
}
```

---

### 2. Conversation Planner（談話規劃引擎）

**目的：** 生成具體的互動建議和文案

**流程：**
```typescript
// services/ai/conversationPlanner.ts

interface PlanningRequest {
  contact: BusinessContact;
  story: Story;
  platform: 'linkedin' | 'facebook' | 'line';
  interactionType: 'comment' | 'message';
}

interface PlanningResult {
  recommendedContent: string;
  tone: 'professional' | 'casual' | 'friendly';
  whyThisWorks: string;
  expectedOutcome: string;
  alternativeOptions: string[];
}

async function planConversation(request: PlanningRequest): Promise<PlanningResult> {
  const prompt = `
    你是一個專業的人脈經營顧問。
    給定以下資訊：
    - 聯絡人：${request.contact.name}，${request.contact.title} at ${request.contact.company}
    - 聯絡人最近動態：${request.contact.intelligence.recent_activity_summary}
    - 用戶的故事：${request.story.title} - ${request.story.experience}
    - 平台：${request.platform}
    - 互動類型：${request.interactionType}

    請生成：
    1. 具體的回應/留言文案
    2. 語氣建議
    3. 為什麼這個互動有效？
    4. 預期效果
    5. 2-3 個替代方案

    注意：
    - 要自然、真實，不要像行銷文案
    - 要展現用戶的多面性，不要只談工作
    - 要提供價值，不要索取
  `;

  return await geminiClient.generate({
    prompt,
    outputFormat: 'json'
  });
}
```

---

### 3. Relationship Scorer（關係計分引擎）

**目的：** 計算與每個聯絡人的關係深度

**計算公式：**
```typescript
// lib/relationship-engine/scoreCalculator.ts

interface RelationshipScoreInputs {
  interactionFrequency: number;  // 每週互動次數
  responseRate: number;          // 回應率 0-1
  mutualTopics: string[];        // 共同話題數量
  interactionRecency: number;    // 最近一次互動（天前）
  referralCount: number;         // 轉介紹次數
  relationshipDuration: number;  // 認識多久（月）
}

function calculateRelationshipScore(inputs: RelationshipScoreInputs): number {
  // 權重設計
  const weights = {
    frequency: 0.25,      // 互動頻率 25%
    response: 0.30,       // 回應率 30%
    topics: 0.20,         // 共同話題 20%
    recency: 0.10,        // 最近互動 10%
    referral: 0.15        // 轉介紹 15%
  };

  // 各項分數（0-100）
  const frequencyScore = Math.min(inputs.interactionFrequency * 20, 100);
  const responseScore = inputs.responseRate * 100;
  const topicsScore = Math.min(inputs.mutualTopics.length * 10, 100);
  const recencyScore = Math.max(0, 100 - inputs.interactionRecency * 2);
  const referralScore = Math.min(inputs.referralCount * 25, 100);

  // 加權總分
  const totalScore =
    frequencyScore * weights.frequency +
    responseScore * weights.response +
    topicsScore * weights.topics +
    recencyScore * weights.recency +
    referralScore * weights.referral;

  return Math.round(totalScore);
}

// 階段判定
function determineRelationshipStage(score: number): 'stranger' | 'acquaintance' | 'friend' | 'advocate' {
  if (score < 30) return 'stranger';
  if (score < 50) return 'acquaintance';
  if (score < 70) return 'friend';
  return 'advocate';
}
```

---

## 五、社交媒體整合架構

> **⚠️ 架構決策轉折（2026-02-09）**
>
> **從 API-First 轉向 Email-First 方案**
>
> 本專案原本規劃使用 LinkedIn/Facebook API 直接獲取用戶好友動態。經過深入分析目標客群（非技術的業務開發者）和產品哲學（Steve Jobs "It just works"），決定改用 **Email-First 整合方案**。
>
> **轉折原因：**
> 1. **目標客群技術能力限制** - 保險、房產、汽車銷售員不熟悉開發者申請流程
> 2. **API 申請門檻高** - LinkedIn 需要特殊權限申請，審核時間數週到數月
> 3. **Facebook 政策嚴格** - 自 2020 年後極度限制第三方存取
> 4. **設定摩擦力** - API 方案需要 5+ 步驟，Email 方案只需 3 步驟
> 5. **「It just works」哲學** - 降低用戶認知負擔，提升採用率
>
> **詳細決策過程記錄：** 請參閱 [`docs/2026-02-09-steve-jobs-product-analysis.md`](./docs/2026-02-09-steve-jobs-product-analysis.md)

---

### 架構對比

| 特性 | API-First 方案（已棄用） | Email-First 方案（採用） |
|------|-------------------------|------------------------|
| 設定步驟 | 5+ 步驟（申請 API → 審核 → 憑證 → 連結 → 授權） | 3 步驟（連結 Google → 授權 Gmail → 完成） |
| 審核時間 | 數週到數月 | 無需審核 |
| 技術門檻 | 需要了解 OAuth、API 權限 | 一般使用者即可操作 |
| 支援平台 | 單一平台（需分別申請） | 多平台（LinkedIn + Facebook 一次整合） |
| 維護成本 | API 變更需更新程式碼 | Email 格式變化需更新解析器 |
| 即時性 | 即時（API 推送或輪詢） | 準即時（Email 通知觸發） |
| 可靠性 | 依賴第三方 API 穩定性 | 依賴 Email 服務穩定性 |

---

### Email-First 方案架構

#### 1. 資料流圖

```
┌─────────────────────────────────────────────────────────────┐
│                     LinkedIn / Facebook                      │
│                 (發送通知郵件給用戶)                          │
└────────────────────┬────────────────────────────────────────┘
                     │ Email 通知
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      Gmail                                   │
│            (notifications-noreply@linkedin.com)              │
│            (notification@facebook.com)                       │
└────────────────────┬────────────────────────────────────────┘
                     │ Gmail API (只讀)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Email Sync Scheduler                            │
│         (services/social/emailSyncScheduler.ts)              │
│                                                             │
│  • 每 6 小時掃描 Gmail                                       │
│  • 查詢：from:linkedin.com newer_than:7d                     │
│  • 查詢：from:facebook.com newer_than:7d                     │
└────────────────────┬────────────────────────────────────────┘
                     │ 解析 Email 內容
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Email Parser Service                            │
│          (services/social/gmail.ts)                          │
│                                                             │
│  parseLinkedInEmail()  → 偵測類型、發送者、內容、連結        │
│  parseFacebookEmail() → 偵測類型、發送者、內容、連結        │
└────────────────────┬────────────────────────────────────────┘
                     │ 儲存解析結果
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           social_notifications 表格                          │
│                                                             │
│  • platform: 'linkedin' | 'facebook'                        │
│  • type: 'post' | 'comment' | 'mention' | 'like' | ...      │
│  • from: 發送者名稱                                          │
│  • content: Email 內容摘要                                   │
│  • url: 連結到原始動態                                       │
│  • timestamp: 通知時間                                       │
└────────────────────┬────────────────────────────────────────┘
                     │ 觸發 AI 分析
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 AI 分析引擎                                  │
│       (services/social/syncScheduler.ts)                     │
│                                                             │
│  • 偵測重要活動（升遷、新工作、結婚等）                       │
│  • 生成互動建議                                             │
│  • 發送推播通知                                             │
└────────────────────┬────────────────────────────────────────┘
                     │ 顯示給用戶
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Today 頁面                                  │
│          (app/(main)/today/page.tsx)                         │
│                                                             │
│  • 顯示最近 7 天的社交通知                                    │
│  • 依重要性排序                                             │
│  • 提供互動建議                                             │
└─────────────────────────────────────────────────────────────┘
```

---

#### 2. Email 解析器實作

```typescript
// services/social/gmail.ts

interface EmailNotification {
  platform: 'linkedin' | 'facebook';
  type: 'post' | 'comment' | 'mention' | 'like' | 'connection' | 'other';
  from: string;                   // 發送者名稱
  subject: string;                // Email 標題
  content: string;                // 解析的內容
  url?: string;                   // 連結到原始動態
  timestamp: Date;                // 通知時間
}

export const gmailService = {
  // 1. 獲取 Gmail 郵件
  async getMessages(accessToken: string, query: string, maxResults: number = 10) {
    const response = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    return response.json();
  },

  // 2. 解析 LinkedIn 通知郵件
  parseLinkedInEmail(message: GmailMessage): EmailNotification | null {
    const subject = message.payload.headers.find(h => h.name === 'Subject')?.value || '';
    const from = message.payload.headers.find(h => h.name === 'From')?.value || '';

    // 偵測通知類型
    if (subject.includes('commented on')) {
      return {
        platform: 'linkedin',
        type: 'comment',
        from: this.extractName(from),
        subject,
        content: this.extractEmailBody(message),
        url: this.extractUrl(message),
        timestamp: new Date(Number(message.internalDate))
      };
    }

    if (subject.includes('mentioned you')) {
      return { platform: 'linkedin', type: 'mention', ... };
    }

    if (subject.includes('liked')) {
      return { platform: 'linkedin', type: 'like', ... };
    }

    // ... 更多類型
  },

  // 3. 解析 Facebook 通知郵件
  parseFacebookEmail(message: GmailMessage): EmailNotification | null {
    // 類似 LinkedIn 解析邏輯
  }
};
```

---

#### 3. Email 同步排程器

```typescript
// services/social/emailSyncScheduler.ts

export const emailSyncScheduler = {
  // 同步所有用戶的社交通知
  async syncAllUsers(): Promise<SyncResult> {
    const supabase = createClient();

    // 獲取所有已連結 Google 的用戶
    const { data: connections } = await supabase
      .from('social_connections')
      .select('*')
      .eq('platform', 'google')
      .not('access_token', null);

    const result = { processed: 0, linkedin: 0, facebook: 0, errors: [] };

    for (const connection of connections || []) {
      const userResult = await this.syncUser(
        connection.user_id,
        connection.access_token
      );
      result.processed += userResult.processed;
      result.linkedin += userResult.linkedin;
      result.facebook += userResult.facebook;
    }

    return result;
  },

  // 同步單一用戶
  async syncUser(userId: string, accessToken: string) {
    const result = { processed: 0, linkedin: 0, facebook: 0, errors: [] };

    // 1. 掃描 LinkedIn 郵件（最近 7 天）
    const linkedinQuery = 'from:notifications-noreply@linkedin.com newer_than:7d';
    const linkedinMessages = await gmailService.getMessages(accessToken, linkedinQuery, 10);

    for (const message of linkedinMessages) {
      const notification = gmailService.parseLinkedInEmail(message);
      if (!notification) continue;

      // 儲存到 social_notifications 表格
      await supabase.from('social_notifications').insert({
        user_id: userId,
        platform: 'linkedin',
        type: notification.type,
        from: notification.from,
        subject: notification.subject,
        content: notification.content,
        url: notification.url || null,
        timestamp: notification.timestamp,
        email_message_id: message.id,  // 用於去重
      });

      result.linkedin++;
      result.processed++;
    }

    // 2. 掃描 Facebook 郵件（最近 7 天）
    const facebookQuery = 'from:notification@facebook.com OR from:notifications@facebook.com newer_than:7d';
    const facebookMessages = await gmailService.getMessages(accessToken, facebookQuery, 10);

    // ... 類似處理

    // 3. 更新最後同步時間
    await supabase
      .from('social_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('platform', 'google');

    return result;
  }
};
```

---

#### 4. Google OAuth 整合

```typescript
// services/social/google.ts

const GOOGLE_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  scopes: [
    'openid',
    'email',
    'https://www.googleapis.com/auth/gmail.readonly',  // 只讀權限
  ],
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`
};

export const googleService = {
  // 產生 OAuth URL
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: GOOGLE_CONFIG.clientId,
      redirect_uri: GOOGLE_CONFIG.redirectUri,
      response_type: 'code',
      scope: GOOGLE_CONFIG.scopes.join(' '),
      access_type: 'offline',  // 獲取 refresh token
      prompt: 'consent',
      state: this.generateState(),  // CSRF 保護
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  },

  // 交換 code 為 access token
  async exchangeCodeForToken(code: string, state: string) {
    // 驗證 state
    if (!this.validateState(state)) {
      throw new Error('Invalid state parameter');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CONFIG.clientId,
        client_secret: GOOGLE_CONFIG.clientSecret,
        redirect_uri: GOOGLE_CONFIG.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    return await response.json();
  }
};
```

---

#### 5. 資料庫結構

```sql
-- social_connections 表格（已更新，支援 Google）
CREATE TABLE social_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN (
    'linkedin', 'facebook', 'instagram', 'line', 'wechat', 'google'  -- 新增 google
  )),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  profile_url TEXT,
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, platform)
);

-- social_notifications 表格（新增）
CREATE TABLE social_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'facebook', 'instagram')),
  type TEXT NOT NULL CHECK (type IN (
    'post', 'comment', 'mention', 'like', 'connection',
    'profile_view', 'birthday', 'other'
  )),
  from TEXT,                    -- 發送者名稱
  subject TEXT,                 -- Email 主旨
  content TEXT,                 -- 解析的內容
  url TEXT,                     -- 連結到原始動態
  email_message_id TEXT,        -- Gmail message ID（去重用）
  timestamp TIMESTAMPTZ,        -- 原始通知時間
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, email_message_id)
);

CREATE INDEX idx_social_notifications_user_timestamp
  ON social_notifications(user_id, timestamp DESC);
```

---

### 原本的 API-First 方案（保留作為備選）

以下代碼已保留，但**不建議使用**。除非 Email-First 方案無法滿足需求，否則請優先使用 Email 整合。

#### LinkedIn 整合 (API)

```typescript
// services/social/linkedin.ts

class LinkedInService {
  private accessToken: string;

  // 1. OAuth 認證
  async authenticate(): Promise<string> {
    // LinkedIn OAuth 2.0 流程
    // 回傳 access token
  }

  // 2. 獲取聯絡人的動態
  async getContactActivity(contactId: string): Promise<SocialPost[]> {
    const response = await fetch(
      `https://api.linkedin.com/v2/connections/${contactId}/activity`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      }
    );
    return response.json();
  }

  // 3. 發布貼文
  async postContent(content: string): Promise<void> {
    await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        author: `urn:li:person:${this.userId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: content },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
      })
    });
  }

  // 4. 留言互動
  async comment(postId: string, content: string): Promise<void> {
    await fetch(`https://api.linkedin.com/v2/socialActions/${postId}/comments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        actor: `urn:li:person:${this.userId}`,
        message: { text: content },
        object: postId
      })
    });
  }
}
```

### Facebook 整合

```typescript
// services/social/facebook.ts

class FacebookService {
  private accessToken: string;
  private pageId?: string;

  // 1. OAuth 認證
  async authenticate(): Promise<string> {
    // Facebook OAuth 流程
  }

  // 2. 獲取動態
  async getContactActivity(contactId: string): Promise<SocialPost[]> {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${contactId}/posts` +
      `?access_token=${this.accessToken}` +
      `&fields=message,created_time,story,likes.summary(true),comments.summary(true)`
    );
    return response.json();
  }

  // 3. 發布貼文（個人動態牆）
  async postContent(content: string): Promise<void> {
    await fetch(`https://graph.facebook.com/v18.0/me/feed`, {
      method: 'POST',
      body: new URLSearchParams({
        message: content,
        access_token: this.accessToken
      })
    });
  }

  // 4. 留言互動
  async comment(postId: string, content: string): Promise<void> {
    await fetch(`https://graph.facebook.com/v18.0/${postId}/comments`, {
      method: 'POST',
      body: new URLSearchParams({
        message: content,
        access_token: this.accessToken
      })
    });
  }
}
```

### 同步排程器

```typescript
// services/social/syncScheduler.ts

class SyncScheduler {
  // 每 6 小時同步一次
  private SYNC_INTERVAL = 6 * 60 * 60 * 1000;

  async start() {
    setInterval(async () => {
      await this.syncAllContacts();
    }, this.SYNC_INTERVAL);
  }

  private async syncAllContacts() {
    const contacts = await contactService.getAll();

    for (const contact of contacts) {
      // 1. 獲取最新動態
      const activity = await this.getContactActivity(contact);

      // 2. 更新聯絡人情報
      await contactService.updateIntelligence(contact.id, {
        recent_posts: activity,
        last_sync: new Date().toISOString()
      });

      // 3. 觸發 AI 分析
      await aiService.analyzeContactActivity(contact.id, activity);

      // 4. 如果有重要動態，發送通知
      const importantActivity = await this.detectImportantActivity(activity);
      if (importantActivity) {
        await this.sendNotification(contact, importantActivity);
      }
    }
  }

  private async detectImportantActivity(activity: SocialPost[]): Promise<SocialPost | null> {
    // AI 判斷哪些動態是「重要的」
    // 例如：換工作、升遷、結婚、生子...
    return await geminiClient.detectImportantActivity(activity);
  }
}
```

---

## 六、效能優化策略

### 1. 資料庫優化

**索引設計：**
```sql
-- 複合索引
CREATE INDEX idx_interactions_user_created
  ON interactions(user_id, created_at DESC);

CREATE INDEX idx_business_contacts_user_score
  ON business_contacts(user_id, (relationship->>'score')::numeric DESC);

-- GIN 索引（JSONB 查詢）
CREATE INDEX idx_stories_tags_gin
  ON stories USING GIN(tags);

CREATE INDEX idx_business_contacts_interests_gin
  ON business_contacts USING GIN(intelligence->'interests');
```

**查詢優化：**
```typescript
// ❌ 錯誤：N+1 查詢
const contacts = await supabase.from('business_contacts').select('*');
for (const contact of contacts) {
  const interactions = await supabase
    .from('interactions')
    .select('*')
    .eq('contact_id', contact.id);
}

// ✅ 正確：一次查詢
const { data } = await supabase
  .from('business_contacts')
  .select(`
    *,
    interactions (
      id,
      type,
      created_at
    )
  `);
```

---

### 2. 快取策略

**Redis 快取層：**
```typescript
// lib/cache/redis.ts

class CacheService {
  private redis: Redis;

  // 快取聯絡人情報（6 小時）
  async cacheContactIntelligence(contactId: string, intelligence: any) {
    await this.redis.setex(
      `contact:intelligence:${contactId}`,
      6 * 3600,
      JSON.stringify(intelligence)
    );
  }

  // 快取故事匹配結果（1 小時）
  async cacheStoryMatches(contactId: string, matches: MatchResult[]) {
    await this.redis.setex(
      `matches:${contactId}`,
      3600,
      JSON.stringify(matches)
    );
  }

  // 快取 AI 生成結果（24 小時）
  async cacheAIResponse(prompt: string, response: any) {
    const key = `ai:${hash(prompt)}`;
    await this.redis.setex(key, 24 * 3600, JSON.stringify(response));
  }
}
```

---

### 3. API 速率限制

```typescript
// middleware/rateLimit.ts

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 每 10 秒最多 10 次請求
});

export async function rateLimitMiddleware(req: Request) {
  const user = await getCurrentUser(req);
  const { success } = await ratelimit.limit(user.id);

  if (!success) {
    return new Response("Too Many Requests", { status: 429 });
  }
}
```

---

## 七、安全與隱私

### 1. 資料隱私

```typescript
// 1. 用戶資料加密
// lib/encryption.ts

import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-gcm';

export function encryptSensitiveData(data: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptSensitiveData(encryptedData: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// 2. 敏感欄位加密儲存
// 電話、地址等資料應加密後存入資料庫
```

### 2. Row Level Security (RLS)

```sql
-- Supabase RLS 規則

-- 1. 只有本人能查看自己的價值庫
CREATE POLICY "Users can view own vault"
  ON value_domains
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2. 只有本人能修改自己的故事
CREATE POLICY "Users can update own stories"
  ON stories
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 3. 只有本人能查看自己的聯絡人
CREATE POLICY "Users can view own contacts"
  ON business_contacts
  FOR SELECT
  USING (auth.uid() = user_id);
```

### 3. API 安全

```typescript
// middleware/auth.ts

export async function requireAuth(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return new Response("Invalid token", { status: 401 });
  }

  // 將用戶資訊附加到 request
  req.user = data.user;
}

// middleware/validate.ts

import { z } from 'zod';

const createStorySchema = z.object({
  title: z.string().min(1).max(100),
  experience: z.string().min(10),
  domain_id: z.string().uuid(),
  is_public: z.boolean().default(true)
});

export function validateRequestBody(schema: z.ZodSchema) {
  return async (req: Request) => {
    try {
      const body = await req.json();
      const validated = schema.parse(body);
      req.validatedBody = validated;
    } catch (error) {
      return new Response(JSON.stringify({ error: error.errors }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
}
```

---

## 八、部署架構

### 生產環境架構

```
┌─────────────────────────────────────────────────────────────┐
│                        用戶                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    CDN (Cloudflare)                         │
│                    靜態資源快取                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Vercel / Netlify (前端託管)                     │
│              Next.js App Router                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase (後端服務)                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ PostgreSQL  │ │  Auth       │ │  Storage    │          │
│  │ (資料庫)    │ │  (身份驗證) │ │  (檔案)     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Edge Functions                         │   │
│  │  (API Routes、AI 服務、社交媒體整合)                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              外部服務                                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Google AI   │ │  LinkedIn   │ │  Facebook   │          │
│  │ (Gemini)    │ │  API        │ │  Graph API  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## 九、監控與分析

### 1. 錯誤追蹤

```typescript
// lib/monitoring/sentry.ts

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// 自動追蹤
export function captureError(error: Error, context?: any) {
  Sentry.captureException(error, {
    extra: context
  });
}
```

### 2. 效能監控

```typescript
// lib/monitoring/analytics.ts

export function trackEvent(eventName: string, properties?: any) {
  // 發送到分析平台（如 Mixpanel、Amplitude）
  fetch('/api/analytics/event', {
    method: 'POST',
    body: JSON.stringify({
      event: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        userId: getCurrentUserId()
      }
    })
  });
}

// 追蹤關鍵事件
export const Events = {
  STORY_CREATED: 'story_created',
  STORY_USED: 'story_used',
  INTERACTION_INITIATED: 'interaction_initiated',
  MATCH_GENERATED: 'match_generated',
  CONNECTION_ESTABLISHED: 'connection_established',
  REFERRAL_CONVERTED: 'referral_converted'
};
```

---

## 十、測試策略

### 單元測試

```typescript
// services/ai/storyMatcher.test.ts

import { describe, it, expect } from 'vitest';
import { matchStories } from './storyMatcher';

describe('StoryMatcher', () => {
  it('should match ESG-related stories to ESG posts', async () => {
    const request = {
      contactActivity: {
        type: 'linkedin_post',
        content: 'Excited to share our latest ESG initiative...',
        topics: ['ESG', 'sustainability']
      },
      userStories: [
        {
          title: '從 skeptic 到 ESG 信徒',
          experience: '3年前我覺得 ESG 是行銷詞彙...',
          tags: ['ESG', '投資']
        }
      ]
    };

    const results = await matchStories(request);

    expect(results[0].relevanceScore).toBeGreaterThan(70);
    expect(results[0].why).toContain('ESG');
  });
});
```

### 整合測試

```typescript
// tests/integration/vault-flow.test.ts

import { test, expect } from '@playwright/test';

test.describe('Vault Creation Flow', () => {
  test('should create a new story', async ({ page }) => {
    await page.goto('/vault/create');
    await page.fill('[name="title"]', '迷路3小時學到的事');
    await page.fill('[name="experience"]', '上週六在陽明山...');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/vault');
    await expect(page.locator('text=迷路3小時學到的事')).toBeVisible();
  });
});
```

---

## 參考文件

- [PRODUCT_VISION.md](./PRODUCT_VISION.md) - 產品願景
- [BRAND_GUIDELINES.md](./BRAND_GUIDELINES.md) - 品牌指南
- [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) - 開發路線圖
