/**
 * Email Sync Scheduler
 * Periodically scans Gmail for LinkedIn and Facebook notification emails
 */

import { gmailService } from './gmail';
import { googleService } from './google';
import { createClient } from '@/lib/supabase/server';

/**
 * Safely convert Date/timestamp to ISO string
 * Handles Invalid Date objects and invalid values
 */
function safeTimestampToIso(timestamp: any): string {
  if (!timestamp) {
    console.warn('⚠️ Empty timestamp, using current time instead');
    return new Date().toISOString();
  }

  if (timestamp instanceof Date) {
    const time = timestamp.getTime();
    // Check for Invalid Date (getTime() returns NaN for Invalid Date)
    if (isNaN(time) || !isFinite(time)) {
      console.warn('⚠️ Invalid Date object detected (Invalid Date), using current time instead. Timestamp:', timestamp);
      return new Date().toISOString();
    }
    // Additional check: toString() returns 'Invalid Date' for invalid dates
    if (timestamp.toString() === 'Invalid Date') {
      console.warn('⚠️ Invalid Date detected via toString(), using current time instead');
      return new Date().toISOString();
    }
    return timestamp.toISOString();
  }

  // If it's a number or string, try to convert it
  const date = new Date(timestamp);
  const dateTime = date.getTime();
  if (isNaN(dateTime) || !isFinite(dateTime) || date.toString() === 'Invalid Date') {
    console.warn('⚠️ Invalid timestamp value, using current time instead. Input:', timestamp);
    return new Date().toISOString();
  }
  return date.toISOString();
}

interface SyncResult {
  processed: number;
  linkedin: number;
  facebook: number;
  errors: string[];
}

export const emailSyncScheduler = {
  /**
   * Sync all connected users' social media notifications
   * This should be called by a cron job or serverless function
   * Now supports parallel processing with concurrency control
   */
  async syncAllUsers(): Promise<SyncResult> {
    const supabase = await createClient();

    // Get all users with Google connections
    const { data: connections, error } = await supabase
      .from('social_connections')
      .select('*')
      .eq('platform', 'google')
      .filter('access_token', 'is', null)
      .filter('access_token', 'is', undefined);

    if (error) {
      console.error('❌ Failed to fetch connections:', error);
      return { processed: 0, linkedin: 0, facebook: 0, errors: [error.message] };
    }

    if (!connections || connections.length === 0) {
      console.log('ℹ️ No active Google connections found');
      return { processed: 0, linkedin: 0, facebook: 0, errors: [] };
    }

    console.log(`📊 Found ${connections.length} users to sync`);

    const result: SyncResult = {
      processed: 0,
      linkedin: 0,
      facebook: 0,
      errors: [],
    };

    // Get batch size from environment or default to 5
    const batchSize = parseInt(process.env.SYNC_BATCH_SIZE || '5', 10);
    console.log(`⚙️ Parallel batch size: ${batchSize}`);

    // Process users in parallel batches
    for (let i = 0; i < connections.length; i += batchSize) {
      const batch = connections.slice(i, Math.min(i + batchSize, connections.length));
      console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} users)...`);

      // Process all users in this batch in parallel
      const batchPromises = batch.map(async (connection) => {
        try {
          const userResult = await this.syncUser(connection.user_id);
          return {
            success: true,
            userId: connection.user_id,
            result: userResult,
          };
        } catch (error: any) {
          console.error(`❌ Failed to sync user ${connection.user_id}:`, error.message);
          return {
            success: false,
            userId: connection.user_id,
            error: error.message,
          };
        }
      });

      // Wait for all users in this batch to complete
      const batchResults = await Promise.all(batchPromises);

      // Aggregate results
      for (const batchResult of batchResults) {
        if (batchResult.success && batchResult.result) {
          result.processed += batchResult.result.processed;
          result.linkedin += batchResult.result.linkedin;
          result.facebook += batchResult.result.facebook;
          result.errors.push(...batchResult.result.errors);
        } else {
          result.errors.push(`User ${batchResult.userId}: ${batchResult.error}`);
        }
      }

      console.log(`✅ Batch completed. Total so far: ${result.linkedin + result.facebook} notifications`);
    }

    console.log(`✅ All users synced. Total: ${result.linkedin + result.facebook} notifications, ${result.errors.length} errors`);
    return result;
  },

  /**
   * Sync a single user's social media notifications
   */
  async syncUser(userId: string): Promise<{
    processed: number;
    linkedin: number;
    facebook: number;
    errors: string[];
  }> {
    const result = {
      processed: 0,
      linkedin: 0,
      facebook: 0,
      errors: [] as string[],
      messageDates: [] as Date[],
    };

    const supabase = await createClient();

    // Get the full connection data
    const { data: connection, error: connectionError } = await supabase
      .from('social_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', 'google')
      .single();

    if (connectionError || !connection || !connection.access_token) {
      throw new Error('No Google connection found');
    }

    // Check if token needs refresh (expired or will expire in 5 minutes)
    const expiresAt = new Date(connection.expires_at);
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    let actualAccessToken = connection.access_token;

    if (expiresAt < fiveMinutesFromNow) {
      console.log('🔄 Token expired, refreshing...');
      try {
        if (connection.refresh_token) {
          const newTokens = await googleService.refreshToken(connection.refresh_token);
          actualAccessToken = newTokens.access_token;

          // Update the tokens in database
          await supabase
            .from('social_connections')
            .update({
              access_token: newTokens.access_token,
              expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
            })
            .eq('user_id', userId)
            .eq('platform', 'google');

          console.log('✅ Token refreshed successfully');
        } else {
          throw new Error('No refresh token available, please re-connect');
        }
      } catch (error: any) {
        console.error('❌ Failed to refresh token:', error);
        throw new Error('Token refresh failed');
      }
    }

    try {
      // Calculate date range (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const dateStr = sevenDaysAgo.toISOString().split('T')[0].replace(/-/g, '/');

      // Scan for LinkedIn emails (last 7 days) - using explicit date format
      const linkedinQuery = `from:notifications-noreply@linkedin.com after:${dateStr}`;
      console.log('🔍 Fetching LinkedIn emails with query:', linkedinQuery);
      console.log('📅 Date range: from', dateStr, 'to present');
      const linkedinMessages = await gmailService.getMessages(actualAccessToken, linkedinQuery, 50);
      console.log('✅ Found LinkedIn emails:', linkedinMessages.length);

      for (const message of linkedinMessages) {
        try {
          // Safely parse message date with validation
          const internalTime = parseInt(message.internalDate || '0');
          let messageDate: Date;
          if (isNaN(internalTime)) {
            console.warn('⚠️ Invalid internalDate for message:', message.id);
            messageDate = new Date();
          } else {
            messageDate = new Date(internalTime);
          }

          // Validate the date before using it
          if (!messageDate || isNaN(messageDate.getTime()) || messageDate.toString() === 'Invalid Date') {
            console.warn('⚠️ Invalid messageDate detected, using current time');
            messageDate = new Date();
          }

          console.log(`📧 LinkedIn message ${message.id} date:`, messageDate.toISOString(), `(${Math.floor((Date.now() - messageDate.getTime()) / (1000 * 60 * 60 * 24))} days ago)`);

          // Get full message content first
          const fullMessage = await gmailService.getMessage(actualAccessToken, message.id);

          const notification = gmailService.parseLinkedInEmail(fullMessage);
          if (!notification) {
            console.log('⚠️ Skipping message (no notification parsed):', message.id);
            continue;
          }

          // Debug: log the raw timestamp
          console.log('🔍 NOTIFICATION TIMESTAMP:', notification.timestamp);

          // Store notification with upsert to handle duplicates
          const { error: insertError } = await supabase
            .from('social_notifications')
            .insert({
              user_id: userId,
              platform: 'linkedin',
              type: notification.type,
              from: notification.from,
              subject: notification.subject,
              content: notification.content,
              url: notification.url || null,
              email_message_id: message.id,
              timestamp: safeTimestampToIso(notification.timestamp),
              created_at: new Date().toISOString(),
            });

          if (insertError) {
            // Check if it's a duplicate (unique constraint violation)
            if (insertError.code === '23505' || insertError.message.includes('duplicate') || insertError.message.includes('unique')) {
              console.log('⚠️ Duplicate notification, skipping:', message.id);
              continue; // Skip duplicates silently
            }
            console.error('❌ INSERT ERROR:', insertError.message, 'Code:', insertError.code, 'Details:', insertError);
            throw insertError;
          }

          result.linkedin++;
          result.processed++;
          // Safely add to messageDates
          const notifDate = new Date(notification.timestamp);
          if (!isNaN(notifDate.getTime()) && notifDate.toString() !== 'Invalid Date') {
            result.messageDates.push(notifDate);
          }
          console.log('✅ LinkedIn notification saved:', notification.subject);
        } catch (error: any) {
          console.error('❌ Error processing LinkedIn message:', message.id, 'Error:', error.message, 'Stack:', error.stack);
          result.errors.push(`LinkedIn ${message.id}: ${error.message}`);
        }
      }

      // Scan for Facebook emails (last 7 days)
      // Facebook notifications come from @facebookmail.com domain
      const facebookQuery = `from:facebookmail.com after:${dateStr}`;
      console.log('🔍 Fetching Facebook emails with query:', facebookQuery);
      const facebookMessages = await gmailService.getMessages(actualAccessToken, facebookQuery, 50);
      console.log('✅ Found Facebook emails:', facebookMessages.length);

      for (const message of facebookMessages) {
        try {
          // Safely parse message date with validation
          const internalTime = parseInt(message.internalDate || '0');
          let messageDate: Date;
          if (isNaN(internalTime)) {
            console.warn('⚠️ Invalid internalDate for message:', message.id);
            messageDate = new Date();
          } else {
            messageDate = new Date(internalTime);
          }

          // Validate date before using it
          if (!messageDate || isNaN(messageDate.getTime()) || messageDate.toString() === 'Invalid Date') {
            console.warn('⚠️ Invalid messageDate detected, using current time');
            messageDate = new Date();
          }

          console.log(`📧 Facebook message ${message.id} date:`, messageDate.toISOString(), `(${Math.floor((Date.now() - messageDate.getTime()) / (1000 * 60 * 60 * 24))} days ago)`);

          // Get full message content first
          const fullMessage = await gmailService.getMessage(actualAccessToken, message.id);

          const notification = gmailService.parseFacebookEmail(fullMessage);
          if (!notification) {
            console.log('⚠️ Skipping message (no notification parsed):', message.id);
            continue;
          }

          // Debug: log the raw timestamp
          console.log('🔍 NOTIFICATION TIMESTAMP:', notification.timestamp);

          // Store notification with upsert to handle duplicates
          const { error: insertError } = await supabase
            .from('social_notifications')
            .insert({
              user_id: userId,
              platform: 'facebook',
              type: notification.type,
              from: notification.from,
              subject: notification.subject,
              content: notification.content,
              url: notification.url || null,
              email_message_id: message.id,
              timestamp: safeTimestampToIso(notification.timestamp),
              created_at: new Date().toISOString(),
            });

          if (insertError) {
            // Check if it's a duplicate (unique constraint violation)
            if (insertError.code === '23505' || insertError.message.includes('duplicate') || insertError.message.includes('unique')) {
              console.log('⚠️ Duplicate notification, skipping:', message.id);
              continue; // Skip duplicates silently
            }
            console.error('❌ INSERT ERROR:', insertError.message, 'Code:', insertError.code, 'Details:', insertError);
            throw insertError;
          }

          result.facebook++;
          result.processed++;
          // Safely add to messageDates
          const notifDate = new Date(notification.timestamp);
          if (!isNaN(notifDate.getTime()) && notifDate.toString() !== 'Invalid Date') {
            result.messageDates.push(notifDate);
          }
          console.log('✅ Facebook notification saved:', notification.subject);
        } catch (error: any) {
          console.error('❌ Error processing Facebook message:', message.id, 'Error:', error.message, 'Stack:', error.stack);
          result.errors.push(`Facebook ${message.id}: ${error.message}`);
        }
      }

      // Update last_synced_at
      await supabase
        .from('social_connections')
        .update({
          last_synced_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('platform', 'google');

      console.log('✅ Sync completed:', {
        linkedin: result.linkedin,
        facebook: result.facebook,
        total: result.processed,
        errors: result.errors.length,
      });

      // Show date range of messages processed
      if (result.messageDates.length > 0) {
        result.messageDates.sort((a, b) => a.getTime() - b.getTime());
        const oldest = result.messageDates[0];
        const newest = result.messageDates[result.messageDates.length - 1];
        const daysCovered = Math.floor((newest.getTime() - oldest.getTime()) / (1000 * 60 * 60 * 24));
        console.log('📅 Date range of processed messages:', {
          oldest: oldest.toISOString(),
          newest: newest.toISOString(),
          daysCovered: daysCovered + 1,
        });
      }

    } catch (error: any) {
      console.error('❌ Error syncing user:', error);
      result.errors.push(error.message);
    }

    return result;
  },

  /**
   * Get recent notifications for a user
   */
  async getRecentNotifications(userId: string, limit: number = 20): Promise<any[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('social_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Failed to fetch notifications:', error);
      return [];
    }

    return data || [];
  },
};
