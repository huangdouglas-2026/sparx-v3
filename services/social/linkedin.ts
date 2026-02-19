import { createClient } from '@/lib/supabase/client';

/**
 * LinkedIn API Integration Service
 *
 * This service handles all LinkedIn-related operations including:
 * - OAuth 2.0 authentication
 * - Fetching contact activities
 * - Posting content
 * - Commenting on posts
 *
 * LinkedIn API Documentation:
 * https://learn.microsoft.com/en-us/linkedin/shared/references/v2/api
 */

// LinkedIn API Configuration
const LINKEDIN_CONFIG = {
  // LinkedIn OAuth 2.0 Endpoints
  authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
  tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
  // LinkedIn API Endpoints
  apiUrl: 'https://api.linkedin.com/v2',
  // OAuth Scopes (Updated for LinkedIn API v2)
  // Note: LinkedIn has updated their scopes. Old ones like r_liteprofile are deprecated.
  // OAuth Scopes (Updated for LinkedIn API v2)
  // Note: w_member_social requires special permission from LinkedIn
  defaultScopes: ['openid', 'profile', 'email'],
};

/**
 * LinkedIn OAuth Response Types
 */
interface LinkedInAuthToken {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope: string;
}

interface LinkedInProfile {
  sub: string;
  email_address: string;
  given_name: string;
  family_name: string;
  locale: {
    country: string;
    language: string;
  };
}

/**
 * LinkedIn API Activity Types
 */
interface LinkedInPost {
  id: string;
  author: string; // URN (e.g., "urn:li:person:abc123")
  created: {
    actor: string;
    time: number;
  };
  lifecycleState: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  specificContent: {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: string;
      shareMediaCategory: 'NONE' | 'ARTICLE' | 'VIDEO' | 'IMAGE';
      media?: Array<{
        status: 'READY';
        description: {
          text: string;
        };
        title: string;
        originalUrl: string;
      }>;
    };
  };
  visibility: {
    'com.linkedin.ugc.MemberNetworkVisibility': string;
  };
}

interface LinkedInComment {
  id: string;
  author: string;
  created: {
    actor: string;
    time: number;
  };
  text: string;
  parentComment?: string;
}

/**
 * LinkedIn Connection Types
 */
interface LinkedInConnection {
  firstName: string;
  lastName: string;
  publicProfileUrl: string;
  position?: {
    title: string;
    company: string;
  };
  email?: string;
}

/**
 * LinkedIn Service
 */
export const linkedinService = {
  /**
   * Generate LinkedIn OAuth Authorization URL
   */
  getAuthUrl(): string {
    const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
    const redirectUri = this.getRedirectUri();

    console.log('🔗 LinkedIn OAuth Debug:', {
      clientId: clientId ? 'Set' : 'Missing',
      redirectUri,
      scopes: LINKEDIN_CONFIG.defaultScopes,
    });

    if (!clientId) {
      console.error('❌ NEXT_PUBLIC_LINKEDIN_CLIENT_ID is not set');
      throw new Error('LinkedIn Client ID is not configured');
    }

    const state = this.generateState();

    // Store state in sessionStorage for verification
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('linkedin_oauth_state', state);
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: LINKEDIN_CONFIG.defaultScopes.join(' '),
      state: state,
    });

    const authUrl = `${LINKEDIN_CONFIG.authUrl}?${params.toString()}`;
    console.log('✅ Generated LinkedIn Auth URL:', authUrl);
    return authUrl;
  },

  /**
   * Get the proper redirect URI
   */
  getRedirectUri(): string {
    // For local development, use localhost
    // For production, use the actual domain
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/api/auth/callback/linkedin`;
  },

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, state: string): Promise<LinkedInAuthToken> {
    console.log('🔄 Exchanging code for token...');

    // Verify state to prevent CSRF attacks
    if (typeof window !== 'undefined') {
      const storedState = sessionStorage.getItem('linkedin_oauth_state');
      if (state !== storedState) {
        console.error('❌ State mismatch:', { received: state, stored: storedState });
        throw new Error('Invalid state parameter');
      }
      sessionStorage.removeItem('linkedin_oauth_state');
    }

    const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = this.getRedirectUri();

    console.log('📝 Token exchange params:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasCode: !!code,
      redirectUri,
    });

    if (!clientId || !clientSecret) {
      console.error('❌ Missing credentials');
      throw new Error('LinkedIn credentials are not configured');
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });

    console.log('🔑 Requesting token from:', LINKEDIN_CONFIG.tokenUrl);

    const response = await fetch(LINKEDIN_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ LinkedIn token exchange failed:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Failed to exchange code for token: ${errorText}`);
    }

    const tokenData = await response.json();
    console.log('✅ Token received:', {
      hasAccessToken: !!tokenData.access_token,
      expiresIn: tokenData.expires_in,
      scope: tokenData.scope,
    });

    // Store token in database
    await this.storeToken(tokenData);

    return tokenData;
  },

  /**
   * Get user's LinkedIn profile
   */
  async getProfile(accessToken: string): Promise<LinkedInProfile> {
    const response = await fetch(`${LINKEDIN_CONFIG.apiUrl}/userinfo`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch LinkedIn profile');
    }

    return await response.json();
  },

  /**
   * Get user's connections (1st degree contacts)
   */
  async getConnections(accessToken: string): Promise<LinkedInConnection[]> {
    const response = await fetch(
      `${LINKEDIN_CONFIG.apiUrl}/connections?q=person&projection=(firstName,lastName,publicProfileUrl,position,email)`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch LinkedIn connections');
    }

    const data = await response.json();
    return data.values || [];
  },

  /**
   * Get contact's recent posts/activities
   *
   * Note: LinkedIn API has limitations on fetching other users' activities.
   * This function attempts to fetch publicly available UGC posts.
   */
  async getUserPosts(accessToken: string, userId: string): Promise<LinkedInPost[]> {
    // Note: LinkedIn's API doesn't directly support fetching other users' posts
    // This is a placeholder for future implementation
    // In practice, you might need to use web scraping or alternative methods

    console.warn('LinkedIn API does not support fetching other users\' posts directly');
    return [];
  },

  /**
   * Get current user's own posts
   */
  async getOwnPosts(accessToken: string): Promise<LinkedInPost[]> {
    const response = await fetch(
      `${LINKEDIN_CONFIG.apiUrl}/ugcPosts?q=authors&authors=List(${encodeURIComponent('urn:li:person:' + await this.getCurrentPersonUrn(accessToken))})&projection=(id,created,lifecycleState,specificContent,visibility)`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch own LinkedIn posts');
    }

    const data = await response.json();
    return data.values || [];
  },

  /**
   * Post content to LinkedIn
   */
  async postContent(accessToken: string, content: string): Promise<string> {
    const personUrn = await this.getCurrentPersonUrn(accessToken);

    const postBody = {
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: content,
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    const response = await fetch(`${LINKEDIN_CONFIG.apiUrl}/ugcPosts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postBody),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('LinkedIn post failed:', error);
      throw new Error('Failed to post to LinkedIn');
    }

    const data = await response.json();
    return data.id; // Returns the post ID (URN)
  },

  /**
   * Comment on a LinkedIn post
   */
  async comment(accessToken: string, postId: string, comment: string): Promise<string> {
    const personUrn = await this.getCurrentPersonUrn(accessToken);

    const commentBody = {
      actor: personUrn,
      message: {
        text: comment,
      },
      object: postId,
    };

    const response = await fetch(
      `${LINKEDIN_CONFIG.apiUrl}/socialActions/${encodeURIComponent(postId)}/comments`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentBody),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('LinkedIn comment failed:', error);
      throw new Error('Failed to comment on LinkedIn post');
    }

    const data = await response.json();
    return data.id; // Returns the comment ID (URN)
  },

  /**
   * Like a LinkedIn post
   */
  async like(accessToken: string, postId: string): Promise<void> {
    const personUrn = await this.getCurrentPersonUrn(accessToken);

    const likeBody = {
      actor: personUrn,
      object: postId,
    };

    const response = await fetch(
      `${LINKEDIN_CONFIG.apiUrl}/socialActions/${encodeURIComponent(postId)}/likes`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(likeBody),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('LinkedIn like failed:', error);
      throw new Error('Failed to like LinkedIn post');
    }
  },

  /**
   * Get current user's person URN
   */
  async getCurrentPersonUrn(accessToken: string): Promise<string> {
    const profile = await this.getProfile(accessToken);
    return `urn:li:person:${profile.sub}`;
  },

  /**
   * Store access token in database
   */
  async storeToken(tokenData: LinkedInAuthToken): Promise<void> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if token already exists
    const { data: existing } = await supabase
      .from('social_connections')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', 'linkedin')
      .single();

    if (existing) {
      // Update existing token
      await supabase
        .from('social_connections')
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      // Insert new token
      await supabase
        .from('social_connections')
        .insert({
          user_id: user.id,
          platform: 'linkedin',
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          profile_url: '', // Will be filled after profile fetch
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          last_synced_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
    }
  },

  /**
   * Get stored access token
   */
  async getStoredToken(): Promise<string | null> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data } = await supabase
      .from('social_connections')
      .select('access_token, expires_at, refresh_token')
      .eq('user_id', user.id)
      .eq('platform', 'linkedin')
      .single();

    if (!data) {
      return null;
    }

    // Check if token is expired
    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      // Token expired, attempt refresh
      return this.refreshAccessToken(data.refresh_token);
    }

    return data.access_token;
  },

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<string> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || '',
      client_secret: process.env.LINKEDIN_CLIENT_SECRET || '',
    });

    const response = await fetch(LINKEDIN_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('LinkedIn token refresh failed:', error);
      throw new Error('Failed to refresh access token');
    }

    const tokenData: LinkedInAuthToken = await response.json();

    // Store new token
    await this.storeToken(tokenData);

    return tokenData.access_token;
  },

  /**
   * Generate random state for OAuth flow
   */
  generateState(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  },

  /**
   * Disconnect LinkedIn account
   */
  async disconnect(): Promise<void> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    await supabase
      .from('social_connections')
      .delete()
      .eq('user_id', user.id)
      .eq('platform', 'linkedin');
  },
};
