/**
 * AI（人工智慧）相關型別定義
 *
 * 用途：定義 AI 匹配引擎、談話規劃引擎的資料結構
 * 這是 Spark 核心差異化的技術實作
 */

import { Story } from './vault';
import { BusinessContact, InteractionType } from './network';

// ============================================
// Story Matcher（故事匹配引擎）
// ============================================

/**
 * 聯絡人活動資訊
 */
export interface ContactActivity {
  type: 'linkedin_post' | 'facebook_post' | 'life_event' | 'milestone';
  content: string;
  topics: string[];
  published_at: string;
  platform: 'linkedin' | 'facebook';
  url?: string;
}

/**
 * 故事匹配結果
 */
export interface StoryMatchResult {
  story: Story;
  relevance_score: number;       // 0-100，相關性分數
  why: string;                   // 為什麼匹配？
  suggested_actions: SuggestedAction[];
}

/**
 * 建議的行動
 */
export interface SuggestedAction {
  type: InteractionType;
  platform: 'linkedin' | 'facebook' | 'line' | 'email';
  content: string;               // 建議的回應/留言文案
  tone: 'professional' | 'casual' | 'friendly';
  why_this_works: string;        // 為什麼這個互動有效？
  expected_outcome: string;       // 預期效果
}

/**
 * 故事匹配請求
 */
export interface StoryMatchRequest {
  contact_activity: ContactActivity;
  user_stories: Story[];
  contact_context?: {
    name: string;
    title?: string;
    company?: string;
    relationship_stage?: string;
  };
}

// ============================================
// Conversation Planner（談話規劃引擎）
// ============================================

/**
 * 談話規劃請求
 */
export interface ConversationPlanRequest {
  contact: BusinessContact;
  story: Story;
  platform: 'linkedin' | 'facebook' | 'line' | 'email';
  interaction_type: InteractionType;
  user_context?: {
    name: string;
    title?: string;
    company?: string;
  };
}

/**
 * 談話規劃結果
 */
export interface ConversationPlanResult {
  recommended_content: string;   // 推薦的回應/留言文案
  tone: 'professional' | 'casual' | 'friendly';
  why_this_works: string;        // 為什麼這個互動有效？
  expected_outcome: string;       // 預期效果
  alternative_options: {         // 替代方案
    content: string;
    tone: string;
    reason: string;
  }[];
  tips: string[];                // 額外提示
}

// ============================================
// Influence Analyzer（影響力分析引擎）
// ============================================

/**
 * 社交影響力追蹤
 */
export interface SocialImpact {
  interaction_id: string;
  type: InteractionType;
  platform: 'linkedin' | 'facebook' | 'instagram';
  content: string;
  story_used?: {
    story_id: string;
    title: string;
  };

  // 影響力指標
  metrics: {
    direct_views: number;        // 直接看見的人
    network_views: number;       // 朋友的朋友看見的
    new_connections: string[];   // 新增的連結 ID
    engagement_rate: number;     // 互動率
  };

  created_at: string;
}

/**
 * 影響力分析結果
 */
export interface InfluenceAnalysis {
  total_impact: number;          // 總影響力分數 0-100
  breakdown: {
    reach_score: number;         // 觸達分數
    engagement_score: number;    // 互動分數
    conversion_score: number;    // 轉化分數（新連結）
  };
  top_performing_stories: {
    story_id: string;
    title: string;
    impact_score: number;
  }[];
  suggested_improvements: string[];
}

// ============================================
// AI Engine 統一介面
// ============================================

/**
 * AI 引擎請求（統一介面）
 */
export interface AIEngineRequest {
  type: 'match_stories' | 'plan_conversation' | 'analyze_influence';
  payload: any;
}

/**
 * AI 引擎回應（統一介面）
 */
export interface AIEngineResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    model_used: string;
    tokens_used: number;
    processing_time_ms: number;
  };
}

// ============================================
// 關係計分引擎型別
// ============================================

/**
 * 關係計分請求
 */
export interface RelationshipScoreRequest {
  contact_id: string;
  include_breakdown?: boolean;   // 是否包含分數細節
  include_suggestions?: boolean; // 是否包含建議
}

/**
 * 關係計分結果
 */
export interface RelationshipScoreResponse {
  contact_id: string;
  score: number;                 // 0-100
  stage: 'stranger' | 'acquaintance' | 'friend' | 'advocate';
  breakdown?: {
    frequency_score: number;
    response_score: number;
    topics_score: number;
    recency_score: number;
    referral_score: number;
  };
  suggested_actions?: string[];
  next_review_date?: string;     // 下次建議評估日期
}

// ============================================
// AI 提示詞範本型別
// ============================================

/**
 * AI 提示詞範本
 */
export interface AIPromptTemplate {
  id: string;
  name: string;
  type: 'story_match' | 'conversation_plan' | 'influence_analyze';
  template: string;
  variables: string[];           // 範本中的變數名稱
  system_instruction?: string;   // 系統提示詞
}

/**
 * AI 提示詞參數
 */
export interface AIPromptParams {
  template_id: string;
  variables: Record<string, any>;
}

// ============================================
// AI 錯誤處理型別
// ============================================

/**
 * AI 錯誤類型
 */
export type AIErrorType =
  | 'api_key_invalid'
  | 'quota_exceeded'
  | 'rate_limit'
  | 'invalid_request'
  | 'server_error'
  | 'timeout'
  | 'unknown';

/**
 * AI 錯誤
 */
export interface AIError {
  type: AIErrorType;
  message: string;
  details?: any;
  timestamp: string;
}

/**
 * AI 錯誤回應
 */
export interface AIErrorResponse {
  success: false;
  error: AIError;
}
