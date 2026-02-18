
export interface ArticleSummary {
  title: string;
  source: string;
  sourceIconUrl: string;
  imageUrl: string;
  keyPoints: string[];
  url?: string;        // 原始文章網址
  tags?: string[];     // 使用者自訂標籤（如 #日本 #政治）
}

export interface ShareHistoryItem {
  id: string;
  summary: ArticleSummary;
  personalNote: string;
  sharedAt: string; // ISO 8601 date string
}

export interface RecipientGroup {
  id: string;
  name: string;
  icon: string;
}

export interface Recipient {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
}

// Types for Dashboard
export type ActivityCategory = 'weekly' | 'monthly' | 'restart';

export interface DashboardContact {
  id: string;
  user_id?: string;
  name: string;
  englishName?: string;
  title: string;
  department?: string;          // 新增：部門名稱
  company?: string;
  avatarUrl: string;
  lastContact: string;
  category: ActivityCategory;
  industry: string;
  // 電子郵件（兩種）
  email?: string;               // 保留：個人電子郵件（向後相容）
  personalEmail?: string;       // 新增：個人電子郵件
  workEmail?: string;           // 新增：公司電子郵件
  // 電話（四種）
  phone?: string;               // 保留：手機電話（向後相容）
  mobilePhone?: string;         // 新增：手機電話
  homePhone?: string;           // 新增：住家電話
  workPhone?: string;           // 新增：公司電話
  workFax?: string;             // 新增：公司傳真
  landline?: string;            // 保留：向後相容
  fax?: string;                 // 保留：向後相容
  website?: string;
  // 住址（四種）
  address?: string;             // 保留：公司地址（向後相容）
  companyAddress?: string;      // 新增：公司地址
  officeAddress?: string;       // 新增：辦公室地址
  homeAddress?: string;         // 新增：住家地址
  mailingAddress?: string;      // 新增：郵寄地址
  address2?: string;            // 保留：向後相容
  address3?: string;            // 保留：向後相容
  metAt: string;
  metAtNote?: string;           // 新增：初次見面的地點/場合等備註
  birthday?: string; // e.g., '1990-05-15'
  linkedin?: string;
  line?: string;
  wechat?: string;
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
  threads?: string;
}

// --- Activity Feed Types ---

// A specific type for social media posts
export interface SocialPost {
  type: 'post';
  id: string;
  contact: Pick<DashboardContact, 'id' | 'name' | 'avatarUrl'>;
  postSnippet: string;
}

// A specific type for birthday reminders
export interface BirthdayReminder {
  type: 'birthday';
  id: string;
  contact: Pick<DashboardContact, 'id' | 'name' | 'avatarUrl'>;
  daysUntil: number;
}

// A specific type for anniversary reminders
export interface AnniversaryReminder {
  type: 'anniversary';
  id: string;
  contact: Pick<DashboardContact, 'id' | 'name' | 'avatarUrl'>;
  years: number;
  metAt: string;
}

// A union type for any item that can appear in the activity feed
export type ActivityFeedItem = SocialPost | BirthdayReminder | AnniversaryReminder;

// --- Network Types ---

export interface BusinessContact extends DashboardContact {
  relationship_score?: number;
  relationship_stage?: 'stranger' | 'acquaintance' | 'friend' | 'partner' | 'advocate';
  last_interaction_at?: string;
  referral_count?: number;
  common_domains?: string[];
}


// Types for Digital Business Card
export type ProfileField = {
  id: keyof UserProfileData;
  label: string;
  value: string;
  icon: string;
  visible: boolean;
};

export interface UserProfileData {
  name: ProfileField;
  alias: ProfileField;
  title: ProfileField;
  company: ProfileField;
  bio: ProfileField;
  phone: ProfileField;
  email: ProfileField;
  address: ProfileField;
  linkedin: ProfileField;
  line: ProfileField;
  facebook: ProfileField;
  instagram: ProfileField;
  threads: ProfileField;
}

export interface UserProfile {
  avatarUrl: string;
  qrCodeUrl: string;
  companyCardUrl: string;
  data: UserProfileData;
}

// --- Vault Types ---

export interface ValueDomain {
  id: string;
  user_id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  story_count: number;
  created_at: string;
  updated_at: string;
}

export interface Story {
  id: string;
  user_id: string;
  domain_id: string;
  title: string;
  content: string;
  tags: string[];
  usage_count: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
  last_used_at?: string;
}

export interface Insight {
  id: string;
  user_id: string;
  story_id: string;
  contact_id: string;
  platform: 'linkedin' | 'facebook' | 'line' | 'wechat' | 'email';
  result: 'positive' | 'neutral' | 'negative';
  feedback?: string;
  created_at: string;
}

export interface StoryStats {
  total_usage: number;
  success_rate: number;
  avg_response_time: number;
  last_used: string;
  best_contacts: string[];
}

// --- AI Types ---

export interface AIMatchResult {
  story: Story;
  relevance_score: number;
  reason: string;
  suggested_approach: string;
}

export interface ConversationPlan {
  contact: BusinessContact;
  story: Story;
  platform: 'linkedin' | 'facebook' | 'line' | 'wechat' | 'email';
  suggested_message: string;
  tone: 'formal' | 'casual' | 'friendly' | 'professional';
  expected_outcome: string;
  alternatives: string[];
}

export interface ContactActivity {
  contact_id: string;
  platform: 'linkedin' | 'facebook' | 'line' | 'wechat' | 'email';
  activity_type: 'post' | 'comment' | 'like' | 'share' | 'birthday' | 'work_anniversary';
  content: string;
  url?: string;
  created_at: string;
}

export interface MatchResult {
  story: Story;
  score: number;
  reason: string;
  suggested_message: string;
}

export interface RelationshipScoreInputs {
  interaction_frequency: number;
  response_rate: number;
  common_topics: number;
  last_interaction_days: number;
  referral_count: number;
}

// --- Social Media Integration Types ---

export type SocialPlatform = 'linkedin' | 'facebook' | 'instagram' | 'line' | 'wechat';

export interface SocialConnection {
  id: string;
  user_id: string;
  platform: SocialPlatform;
  access_token: string;
  refresh_token?: string;
  profile_url: string;
  expires_at: string;
  last_synced_at: string;
  created_at: string;
  updated_at: string;
}

export interface LinkedInPost {
  id: string;
  author: string;
  created: {
    actor: string;
    time: number;
  };
  lifecycleState: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  specificContent: {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: string;
      shareMediaCategory: 'NONE' | 'ARTICLE' | 'VIDEO' | 'IMAGE';
    };
  };
  visibility: {
    'com.linkedin.ugc.MemberNetworkVisibility': string;
  };
}

export interface SocialActivity {
  id?: string;
  user_id: string;
  platform: SocialPlatform;
  activity_id: string;
  activity_type: string;
  content: string;
  contact_id?: string;
  url?: string;
  metadata?: any;
  story_id?: string;
  impact?: {
    importance: number;
    reason: string;
    suggestedAction: string;
  };
  platform_created_at?: string;
  synced_at?: string;
  created_at?: string;
}

export interface SyncStatus {
  platform: SocialPlatform;
  lastSync: string;
  nextSync: string;
  isSyncing: boolean;
  totalContacts: number;
  syncedContacts: number;
  status: 'success' | 'error' | 'pending';
  error?: string;
}

// --- Social Media Notification Types (Email-First Integration) ---

export type SocialNotificationPlatform = 'linkedin' | 'facebook' | 'instagram';

export type SocialNotificationType =
  | 'post'
  | 'comment'
  | 'mention'
  | 'like'
  | 'connection'
  | 'profile_view'
  | 'birthday'
  | 'other';

export interface SocialNotification {
  id: string;
  user_id: string;
  platform: SocialNotificationPlatform;
  type: SocialNotificationType;
  from: string;                   // 發送者名稱
  subject: string;                // Email 主旨
  content: string;                // 解析的內容
  url?: string;                   // 連結到原始動態
  email_message_id: string;       // Gmail message ID（用於去重）
  timestamp: string;              // 原始通知時間
  created_at: string;             // 資料庫建立時間
}
