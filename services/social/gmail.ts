/**
 * Gmail API Service
 * Fetches and parses notification emails from LinkedIn and Facebook
 */

import { createClient } from '@/lib/supabase/server';

interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  internalDate: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body?: {
      data: string;
    };
    parts?: Array<{
      partId?: string;
      mimeType?: string;
      filename?: string;
      headers?: Array<{ name: string; value: string }>;
      body?: {
        data: string;
      };
      parts?: Array<any>;
    }>;
  };
}

interface EmailNotification {
  platform: 'linkedin' | 'facebook';
  from: string;
  subject: string;
  content: string;
  timestamp: Date;
  url?: string;
  type: 'post' | 'comment' | 'mention' | 'like' | 'connection';
}

export const gmailService = {
  /**
   * Get user's Gmail messages (server-side only)
   */
  async getMessages(accessToken: string, query: string, maxResults: number = 10): Promise<GmailMessage[]> {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gmail API error: ${errorText}`);
    }

    const data = await response.json();
    const messages = data.messages || [];
    console.log(`📧 Gmail API returned ${messages.length} messages for query: ${query}`);
    return messages;
  },

  /**
   * Get full message content
   */
  async getMessage(accessToken: string, messageId: string): Promise<any> {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch message');
    }

    return await response.json();
  },

  /**
   * Extract email body from message payload
   */
  extractEmailBody(message: GmailMessage): string {
    const extractBody = (parts: any[]): string => {
      for (const part of parts) {
        if (part.parts) {
          const body = extractBody(part.parts);
          if (body) return body;
        }
        if (part.body && part.body.data) {
          return Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
      }
      return '';
    };

    if (message.payload.parts) {
      return extractBody(message.payload.parts);
    } else if (message.payload.body && message.payload.body.data) {
      return Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    }

    return message.snippet || '';
  },

  /**
   * Parse LinkedIn notification email
   */
  parseLinkedInEmail(message: GmailMessage): EmailNotification | null {
    const from = this.getHeader(message, 'From');
    const subject = this.getHeader(message, 'Subject');
    const body = this.extractEmailBody(message);

    // Check if this is a LinkedIn notification
    if (!from.includes('linkedin')) {
      return null;
    }

    // Parse timestamp safely
    let timestamp: Date;
    try {
      const internalTime = parseInt(message.internalDate || '0');
      if (isNaN(internalTime)) {
        console.warn('⚠️ Invalid internalDate for LinkedIn message:', message.id);
        timestamp = new Date(); // Fallback to current time
      } else {
        timestamp = new Date(internalTime);
      }
    } catch (error) {
      console.error('❌ Error parsing timestamp for LinkedIn message:', message.id, error);
      timestamp = new Date(); // Fallback to current time
    }

    // Detect notification type
    let type: EmailNotification['type'] = 'post';
    if (subject.includes('commented on') || body.includes('commented on')) {
      type = 'comment';
    } else if (subject.includes('mentioned you in')) {
      type = 'mention';
    } else if (subject.includes('liked')) {
      type = 'like';
    } else if (subject.includes('You have a new connection')) {
      type = 'connection';
    }

    // Extract URL
    const urlMatch = body.match(/(https:\/\/www\.linkedin\.com\/[^\s"']+)/);
    const url = urlMatch ? urlMatch[1] : undefined;

    // Extract author name
    const authorMatch = subject.match(/^(.*?)\s+(?:posted|shared|commented)/);
    const author = authorMatch ? authorMatch[1] : 'LinkedIn member';

    // Validate timestamp before returning (comprehensive check)
    const timeValue = timestamp.getTime();
    if (!timestamp || !(timestamp instanceof Date) || isNaN(timeValue) || !isFinite(timeValue) || timestamp.toString() === 'Invalid Date') {
      console.error('❌ Invalid timestamp detected for LinkedIn:', message.id, 'Timestamp:', timestamp, 'toString():', timestamp.toString());
      timestamp = new Date(); // Use current time as fallback
    }

    return {
      platform: 'linkedin',
      from: 'LinkedIn',
      subject,
      content: body.substring(0, 500) + (body.length > 500 ? '...' : ''),
      timestamp,
      url,
      type,
    };
  },

  /**
   * Parse Facebook notification email
   */
  parseFacebookEmail(message: GmailMessage): EmailNotification | null {
    const from = this.getHeader(message, 'From');
    const subject = this.getHeader(message, 'Subject');
    const body = this.extractEmailBody(message);

    // Check if this is a Facebook notification
    // Facebook notifications come from @facebookmail.com or @facebook.com domain
    if (!from.includes('facebook') && !from.includes('@fb')) {
      return null;
    }

    // Parse timestamp safely
    let timestamp: Date;
    try {
      const internalTime = parseInt(message.internalDate || '0');
      if (isNaN(internalTime)) {
        console.warn('⚠️ Invalid internalDate for Facebook message:', message.id);
        timestamp = new Date(); // Fallback to current time
      } else {
        timestamp = new Date(internalTime);
      }
    } catch (error) {
      console.error('❌ Error parsing timestamp for Facebook message:', message.id, error);
      timestamp = new Date(); // Fallback to current time
    }

    // Detect notification type
    let type: EmailNotification['type'] = 'post';
    if (subject.includes('commented on') || body.includes('commented on')) {
      type = 'comment';
    } else if (subject.includes('mentioned you')) {
      type = 'mention';
    } else if (subject.includes('reacted to')) {
      type = 'like';
    }

    // Extract URL
    const urlMatch = body.match(/(https:\/\/www\.facebook\.com\/[^\s"']+)/);
    const url = urlMatch ? urlMatch[1] : undefined;

    // Validate timestamp before returning (comprehensive check)
    const timeValue = timestamp.getTime();
    if (!timestamp || !(timestamp instanceof Date) || isNaN(timeValue) || !isFinite(timeValue) || timestamp.toString() === 'Invalid Date') {
      console.error('❌ Invalid timestamp detected for Facebook:', message.id, 'Timestamp:', timestamp, 'toString():', timestamp.toString());
      timestamp = new Date(); // Use current time as fallback
    }

    return {
      platform: 'facebook',
      from: 'Facebook',
      subject,
      content: body.substring(0, 500) + (body.length > 500 ? '...' : ''),
      timestamp,
      url,
      type,
    };
  },

  /**
   * Get header value from message
   */
  getHeader(message: GmailMessage, headerName: string): string {
    const headers = message.payload.headers;
    const header = headers.find(h => h.name.toLowerCase() === headerName.toLowerCase());
    return header?.value || '';
  },
};
