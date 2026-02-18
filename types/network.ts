/**
 * Network（人脈網絡）相關型別定義
 *
 * 用途：定義業務聯絡人（BusinessContact）和關係分析的資料結構
 * 這是 AI 情報局的基礎
 */

// ============================================
// BusinessContact（業務聯絡人）
// ============================================

/**
 * 業務聯絡人 - 擴展的聯絡人模型，包含 AI 分析的情報
 */
export interface BusinessContact {
  id: string;
  user_id: string;

  // 基礎資訊（精簡版）
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
    score: number;               // 0-100，關係深度分數
    stage: RelationshipStage;    // 關係階段
    last_interaction: string;    // 最近一次互動時間
    interaction_frequency: number; // 每週幾次？
    response_rate: number;       // 回應率 0-1
    mutual_topics: string[];     // 共同話題
  };

  // 轉介紹潛力
  referral: {
    potential: number;           // 0-100，轉介紹潛力分數
    successful_referrals: number; // 已成功的轉介紹次數
    potential_connections: string[]; // 可能介紹的人（聯絡人 ID）
  };

  // 元資料
  created_at: string;
  updated_at: string;
}

/**
 * 關係階段
 */
export type RelationshipStage = 'stranger' | 'acquaintance' | 'friend' | 'advocate';

/**
 * 社交媒體貼文
 */
export interface SocialPost {
  id: string;
  platform: 'linkedin' | 'facebook' | 'instagram';
  content: string;
  published_at: string;
  url?: string;
  likes?: number;
  comments?: number;
}

// ============================================
// Interaction（互動記錄）
// ============================================

/**
 * 互動記錄 - 追蹤與聯絡人的所有互動
 */
export interface Interaction {
  id: string;
  user_id: string;
  contact_id: string;            // 與誰互動

  // 互動內容
  type: InteractionType;
  platform: InteractionPlatform;
  content: string;               // 互動的內容

  // 使用的資源
  story_id?: string;             // 使用了哪個故事？

  // 影響力分析
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

/**
 * 互動類型
 */
export type InteractionType =
  | 'post'           // 發布貼文
  | 'comment'        // 留言
  | 'message'        // 私訊
  | 'meeting'        // 見面
  | 'call'           // 通話
  | 'email';         // 郵件

/**
 * 互動平台
 */
export type InteractionPlatform =
  | 'linkedin'
  | 'facebook'
  | 'instagram'
  | 'line'
  | 'email'
  | 'in_person';

// ============================================
// 關係計分相關型別
// ============================================

/**
 * 關係分數計算輸入
 */
export interface RelationshipScoreInputs {
  interaction_frequency: number;  // 每週互動次數
  response_rate: number;          // 回應率 0-1
  mutual_topics: string[];        // 共同話題數量
  interaction_recency: number;    // 最近一次互動（天前）
  referral_count: number;         // 轉介紹次數
  relationship_duration: number;  // 認識多久（月）
}

/**
 * 關係分數結果
 */
export interface RelationshipScoreResult {
  score: number;                 // 總分 0-100
  breakdown: {
    frequency_score: number;     // 互動頻率分數
    response_score: number;      // 回應率分數
    topics_score: number;        // 共同話題分數
    recency_score: number;       // 最近互動分數
    referral_score: number;      // 轉介紹分數
  };
  stage: RelationshipStage;
  suggested_actions: string[];   // 建議的下一步行動
}

// ============================================
// 網絡分析相關型別
// ============================================

/**
 * 網絡統計
 */
export interface NetworkStats {
  total_contacts: number;
  deep_relationships: number;    // 關係深度 > 70
  new_connections_this_week: number;
  new_connections_this_month: number;
  active_contacts: number;       // 過去 30 天有互動
  referral_sources: number;      // 有轉介紹過的聯絡人數
}

/**
 * 轉介紹樹節點
 */
export interface ReferralTreeNode {
  contact_id: string;
  name: string;
  avatar_url?: string;
  depth: number;                 // 在樹中的深度（0 = 你）
  referred_by?: string;          // 誰介紹的
  referrals: ReferralTreeNode[]; // 介紹了誰
}

/**
 * 轉介紹潛力分析
 */
export interface ReferralPotential {
  contact_id: string;
  contact_name: string;
  potential_score: number;       // 0-100
  reasons: string[];             // 為什麼有潛力？
  suggested_targets: {
    contact_id: string;
    name: string;
    reason: string;              // 為什麼這個目標適合？
  }[];
}

// ============================================
// 輸入型別（用於查詢）
// ============================================

/**
 * 聯絡人篩選條件
 */
export interface ContactFilter {
  relationship_stage?: RelationshipStage;
  min_score?: number;
  industry?: string;
  last_interaction_days?: number; // 最近 N 天內有互動
  has_referral_potential?: boolean;
}

/**
 * 互動記錄查詢條件
 */
export interface InteractionQuery {
  contact_id?: string;
  type?: InteractionType;
  platform?: InteractionPlatform;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}
