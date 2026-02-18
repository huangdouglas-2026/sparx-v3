import { linkedinService } from './linkedin';
import { genAIService } from '../geminiService';
import { createClient } from '@/lib/supabase/client';
import type { DashboardContact, SocialActivity } from '@/types';

/**
 * Social Sync Scheduler
 *
 * This service handles:
 * - Periodic syncing of social media data
 * - AI-powered important activity detection
 * - Sending notifications
 * - Storing activities in database
 *
 * Note: This is a client-side implementation. For production,
 * you should use a server-side cron job or Supabase Edge Functions.
 */

interface SyncStatus {
  lastSync: string;
  nextSync: string;
  isSyncing: boolean;
  totalContacts: number;
  syncedContacts: number;
}

interface ImportantActivity {
  activity: any;
  importance: number;
  reason: string;
  suggestedAction: string;
}

export const syncScheduler = {
  /**
   * Start the sync scheduler
   * Note: This would typically run on a server, not in the browser
   */
  start() {
    // Check if sync is already running
    if (typeof window !== 'undefined' && (window as any).syncInterval) {
      console.log('Sync scheduler is already running');
      return;
    }

    // Sync every 6 hours
    const SYNC_INTERVAL = 6 * 60 * 60 * 1000;

    if (typeof window !== 'undefined') {
      (window as any).syncInterval = setInterval(async () => {
        await this.syncAllContacts();
      }, SYNC_INTERVAL);

      console.log('Sync scheduler started (syncing every 6 hours)');
    }
  },

  /**
   * Stop the sync scheduler
   */
  stop() {
    if (typeof window !== 'undefined' && (window as any).syncInterval) {
      clearInterval((window as any).syncInterval);
      delete (window as any).syncInterval;
      console.log('Sync scheduler stopped');
    }
  },

  /**
   * Sync all contacts' activities
   */
  async syncAllContacts(): Promise<void> {
    try {
      const accessToken = await linkedinService.getStoredToken();

      if (!accessToken) {
        console.log('No LinkedIn access token found, skipping sync');
        return;
      }

      console.log('🔄 Starting LinkedIn sync...');

      // Get current user's profile to verify token
      const profile = await linkedinService.getProfile(accessToken);
      console.log('✅ LinkedIn profile verified:', profile.localizedFirstName);

      // Sync user's own posts
      const posts = await linkedinService.getOwnPosts(accessToken);
      console.log(`📝 Fetched ${posts.length} LinkedIn posts`);

      // Store posts in database and detect important activities
      const importantActivities = await this.processAndStoreActivities(posts, 'linkedin');

      // Send notifications for important activities
      for (const important of importantActivities) {
        await this.sendNotification(important);
      }

      // Update last sync time
      await this.updateLastSyncTime();

      console.log(`✅ LinkedIn sync completed. Found ${importantActivities.length} important activities`);
    } catch (error) {
      console.error('❌ Error during LinkedIn sync:', error);
    }
  },

  /**
   * Process activities and store them in database
   * Uses AI to detect important ones
   */
  async processAndStoreActivities(activities: any[], platform: string): Promise<ImportantActivity[]> {
    const importantActivities: ImportantActivity[] = [];
    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return [];
    }

    for (const activity of activities) {
      try {
        // Extract content from activity
        const content = this.extractContent(activity);

        // Use AI to detect importance
        const analysis = await this.detectImportantActivities([activity]);

        if (analysis.length > 0) {
          const important = analysis[0];
          importantActivities.push(important);

          // Store important activity in database
          await this.storeActivity(user.id, platform, activity, content, important);
        }

        // Store all activities (regardless of importance) for tracking
        await this.storeActivity(user.id, platform, activity, content, null);
      } catch (error) {
        console.error('Error processing activity:', error);
      }
    }

    return importantActivities;
  },

  /**
   * Extract content from LinkedIn activity
   */
  extractContent(activity: any): string {
    try {
      if (activity.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text) {
        return activity.specificContent['com.linkedin.ugc.ShareContent'].shareCommentary.text;
      }
      if (activity.text) {
        return activity.text;
      }
      if (activity.commentary) {
        return activity.commentary;
      }
      return JSON.stringify(activity);
    } catch {
      return '';
    }
  },

  /**
   * Detect important activities using AI
   * Uses Gemini AI to intelligently analyze activities
   */
  async detectImportantActivities(activities: any[]): Promise<ImportantActivity[]> {
    const importantActivities: ImportantActivity[] = [];

    for (const activity of activities) {
      const content = this.extractContent(activity);

      // Skip empty content
      if (!content || content.length < 10) {
        continue;
      }

      try {
        // Use AI to analyze importance
        const prompt = `
你是一個專業的人脈關係顧問。請分析以下 LinkedIn 動態，判斷是否具有重要性。

動態內容：
"""
${content}
"""

請以 JSON 格式回傳：
{
  "isImportant": true/false,
  "importance": 0-100 分數,
  "reason": "為什麼重要（或為什麼不重要）",
  "category": "類別（career/personal/achievement/milestone/other）",
  "suggestedAction": "建議的互動方式（例如：留言祝賀、私訊關心、分享心得等）"
}

重要性的判斷標準：
1. 職涯里程碑（升遷、新工作、創業、退休）
2. 個人里程碑（結婚、生子、畢業、訂婚）
3. 專業成就（獲獎、認證、發表文章、專案成功）
4. 人生大事（搬家、重大疾病康復、紀念日）

不重要：
1. 一般日常分享
2. 轉貼文章
3. 普通的工作心得
4. 旅遊照片

請確保回應是有效的 JSON 格式。`;

        const response = await genAIService.generateContent(prompt);

        // Parse JSON response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);

          if (parsed.isImportant && parsed.importance >= 60) {
            importantActivities.push({
              activity,
              importance: parsed.importance,
              reason: parsed.reason,
              suggestedAction: parsed.suggestedAction,
            });
          }
        }
      } catch (error) {
        console.error('Error analyzing activity with AI:', error);

        // Fallback to keyword matching if AI fails
        const fallback = this.fallbackKeywordDetection(content, activity);
        if (fallback) {
          importantActivities.push(fallback);
        }
      }
    }

    return importantActivities;
  },

  /**
   * Fallback keyword detection when AI fails
   */
  fallbackKeywordDetection(content: string, activity: any): ImportantActivity | null {
    const patterns = [
      {
        keywords: ['升遷', 'promotion', '晉升', '新職位', '新頭銜'],
        reason: '職涯升遷',
        action: '留言祝賀',
        importance: 90,
      },
      {
        keywords: ['新工作', 'new job', '加入', 'joined', 'excited to announce'],
        reason: '新工作',
        action: '留言歡迎',
        importance: 85,
      },
      {
        keywords: ['結婚', 'married', '訂婚', 'engaged', ' fiancé', 'fiancée'],
        reason: '婚禮相關',
        action: '留言祝福',
        importance: 95,
      },
      {
        keywords: ['生子', 'baby', '小孩', 'child', 'born', '新增成員'],
        reason: '新生兒',
        action: '留言祝福',
        importance: 95,
      },
      {
        keywords: ['創業', 'startup', '創公司', 'founded', '創辦', 'CEO', '創始人'],
        reason: '創業里程碑',
        action: '留言鼓勵',
        importance: 90,
      },
      {
        keywords: ['退休', 'retirement', '退休生活'],
        reason: '退休',
        action: '留言祝福',
        importance: 85,
      },
      {
        keywords: ['畢業', 'graduation', '學位', 'degree', 'MBA'],
        reason: '學位成就',
        action: '留言祝賀',
        importance: 80,
      },
      {
        keywords: ['獲獎', 'award', '認證', 'certified', '通過'],
        reason: '專業認證',
        action: '留言祝賀',
        importance: 75,
      },
    ];

    const lowerContent = content.toLowerCase();

    for (const pattern of patterns) {
      if (pattern.keywords.some(keyword => lowerContent.includes(keyword.toLowerCase()))) {
        return {
          activity,
          importance: pattern.importance,
          reason: pattern.reason,
          suggestedAction: pattern.action,
        };
      }
    }

    return null;
  },

  /**
   * Store activity in database
   */
  async storeActivity(
    userId: string,
    platform: string,
    activity: any,
    content: string,
    importantInfo: ImportantActivity | null
  ): Promise<void> {
    try {
      const supabase = createClient();

      const activityData: Partial<SocialActivity> = {
        user_id: userId,
        platform,
        activity_id: activity.id || activity.urn || '',
        activity_type: activity.lifecycleState || 'unknown',
        content,
        url: activity.url || '',
        metadata: activity,
        impact: importantInfo ? {
          importance: importantInfo.importance,
          reason: importantInfo.reason,
          suggestedAction: importantInfo.suggestedAction,
        } : null,
        platform_created_at: activity.created?.time || new Date().toISOString(),
        synced_at: new Date().toISOString(),
      };

      await supabase.from('social_activities').upsert(activityData, {
        onConflict: 'user_id,platform,activity_id',
      });

      console.log(`✅ Stored activity: ${activityData.activity_id}`);
    } catch (error) {
      console.error('Error storing activity:', error);
    }
  },

  /**
   * Send notification for important activity
   */
  async sendNotification(important: ImportantActivity): Promise<void> {
    // TODO: Implement notification sending
    // Options:
    // 1. Push notification (OneSignal, Firebase Cloud Messaging)
    // 2. Email notification
    // 3. In-app notification

    console.log(`🔔 Important activity detected (${important.importance}/100):`);
    console.log(`   Reason: ${important.reason}`);
    console.log(`   Suggested: ${important.suggestedAction}`);

    // For now, we'll use browser notification if available
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('🔥 重要活動偵測', {
        body: `${important.reason}\n\n建議：${important.suggestedAction}`,
        icon: '/icon-192.png',
      });
    }
  },

  /**
   * Update last sync time in database
   */
  async updateLastSyncTime(): Promise<void> {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from('social_connections')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('platform', 'linkedin');

        console.log('✅ Updated last sync time');
      }
    } catch (error) {
      console.error('Error updating sync time:', error);
    }
  },

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from('social_connections')
          .select('last_synced_at')
          .eq('user_id', user.id)
          .eq('platform', 'linkedin')
          .single();

        if (data) {
          return {
            lastSync: data.last_synced_at || new Date().toISOString(),
            nextSync: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
            isSyncing: false,
            totalContacts: 0,
            syncedContacts: 0,
          };
        }
      }
    } catch (error) {
      console.error('Error getting sync status:', error);
    }

    return {
      lastSync: new Date().toISOString(),
      nextSync: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      isSyncing: false,
      totalContacts: 0,
      syncedContacts: 0,
    };
  },

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  },

  /**
   * Manual sync trigger
   */
  async manualSync(): Promise<void> {
    console.log('🔄 Manual sync triggered');
    await this.syncAllContacts();
  },
};
