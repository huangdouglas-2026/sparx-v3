/**
 * Vault（價值寶庫）相關型別定義
 *
 * 用途：定義價值領域（ValueDomain）和故事（Story）的資料結構
 * 這是 Spark 核心差異化功能的基礎
 */

// ============================================
// ValueDomain（價值領域）
// ============================================

/**
 * 價值領域 - 代表用戶的一個多面性身份
 * 例如：登山、咖啡、親子育兒、投資挫敗...
 */
export interface ValueDomain {
  id: string;
  user_id: string;
  name: string;                  // 例如：登山、咖啡、親子育兒
  icon: string;                  // 例如：🏔️、☕、👨‍👧
  color?: string;                // 主色調（用於 UI）
  description?: string;          // 描述
  is_public: boolean;            // 是否公開給所有聯絡人
  display_order: number;         // 顯示順序
  created_at: string;
  updated_at: string;

  // 關聯資料（從資料庫查詢時可選）
  stories?: Story[];
  usage_count?: number;          // 被使用了幾次？
}

// ============================================
// Story（故事）
// ============================================

/**
 * 故事 - 用戶的真實經驗與見解
 * 這是「物理性人生分享」的核心單位
 */
export interface Story {
  id: string;
  user_id: string;
  domain_id: string;             // 屬於哪個價值領域

  // 故事內容
  title: string;                 // 例如：「迷路3小時學到的事」
  experience: string;            // 我的真實經驗
  lessons: string[];             // 學到的教訓

  // 可分享的內容（針對不同平台）
  shareable_content: {
    platform: 'linkedin' | 'facebook' | 'line' | 'instagram';
    content: string;             // 該平台適用的文案
  }[];

  // 分類與標籤
  tags: string[];                // 例如：#登山 #人生教訓 #耐力
  is_public: boolean;            // 是否公開給所有聯絡人

  // 時間戳
  created_at: string;
  updated_at: string;

  // 統計資料
  used_count?: number;           // 被使用了幾次？
  like_count?: number;           // 被喜歡幾次？
  view_count?: number;           // 被查看幾次？

  // 關聯資料
  domain?: ValueDomain;
  insights?: Insight[];
}

// ============================================
// Insight（見解）
// ============================================

/**
 * 見解 - 從故事中提煉出的核心觀點
 */
export interface Insight {
  id: string;
  story_id: string;              // 屬於哪個故事
  content: string;               // 例如：「準備比體力更重要」
  category: string;              // 分類：哲學、實用、情感...

  // 時間戳
  created_at: string;
}

// ============================================
// 輸入型別（用於建立/更新）
// ============================================

/**
 * 建立價值領域的輸入
 */
export interface CreateValueDomainInput {
  name: string;
  icon: string;
  color?: string;
  description?: string;
  is_public?: boolean;
  display_order?: number;
}

/**
 * 更新價值領域的輸入
 */
export interface UpdateValueDomainInput extends Partial<CreateValueDomainInput> {}

/**
 * 建立故事的輸入
 */
export interface CreateStoryInput {
  domain_id: string;
  title: string;
  experience: string;
  lessons: string[];
  shareable_content: {
    platform: 'linkedin' | 'facebook' | 'line' | 'instagram';
    content: string;
  }[];
  tags?: string[];
  is_public?: boolean;
}

/**
 * 更新故事的輸入
 */
export interface UpdateStoryInput extends Partial<CreateStoryInput> {}

// ============================================
// 分析型別
// ============================================

/**
 * 故事使用統計
 */
export interface StoryUsageStats {
  story_id: string;
  used_count: number;            // 總使用次數
  last_used_at: string;          // 最後使用時間
  platforms_used: string[];      // 在哪些平台被使用
  response_rate: number;         // 使用後的回應率
}

/**
 * 熱門故事
 */
export interface TrendingStory {
  story: Story;
  usage_count: number;           // 本週使用次數
  growth_rate: number;           // 成長率（相較上週）
}
