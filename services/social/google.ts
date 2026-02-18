/**
 * Google OAuth & Gmail API Service
 * Email-first approach for social media integration
 */

interface GoogleConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

const GOOGLE_CONFIG: GoogleConfig = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: '', // Will be set dynamically
  scopes: [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/gmail.readonly', // Read emails
  ],
};

/**
 * Google OAuth Configuration
 * Get your credentials at: https://console.cloud.google.com/
 */
export const googleService = {
  /**
   * Generate Google OAuth Authorization URL
   */
  getAuthUrl(): string {
    const redirectUri = this.getRedirectUri();
    const state = this.generateState();

    // Store state for verification
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('google_oauth_state', state);
    }

    // Manually construct query string to ensure proper encoding
    const scope = GOOGLE_CONFIG.scopes.join(' ');
    const params = [
      `response_type=code`,
      `client_id=${encodeURIComponent(GOOGLE_CONFIG.clientId)}`,
      `redirect_uri=${encodeURIComponent(redirectUri)}`,
      `scope=${encodeURIComponent(scope)}`,
      `state=${encodeURIComponent(state)}`,
      `access_type=offline`,
      `prompt=consent`,
    ].join('&');

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    console.log('✅ Generated Google Auth URL');
    return authUrl;
  },

  /**
   * Get the proper redirect URI
   * Works in both client and server contexts
   */
  getRedirectUri(): string {
    // Client-side: use window.location.origin
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api/auth/callback/google`;
    }

    // Server-side: construct from environment or use localhost for dev
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
                  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001');
    return `${baseUrl}/api/auth/callback/google`;
  },

  /**
   * Generate random state for CSRF protection
   */
  generateState(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  },

  /**
   * Exchange authorization code for access token
   * This is called by the API route, not directly by client
   */
  async exchangeCodeForToken(code: string, state: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    const redirectUri = this.getRedirectUri();

    // Build request body - use x-www-form-urlencoded format
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('client_id', GOOGLE_CONFIG.clientId);
    params.append('client_secret', GOOGLE_CONFIG.clientSecret);
    params.append('redirect_uri', redirectUri);
    params.append('grant_type', 'authorization_code');
    if (state) {
      params.append('state', state);
    }

    console.log('🔄 Exchanging code for token...', { code, hasState: !!state });

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google token exchange failed: ${errorText}`);
    }

    const tokenData = await response.json();
    console.log('✅ Google token exchange successful');
    return tokenData;
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{
    access_token: string;
    expires_in: number;
  }> {
    const params = new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CONFIG.clientId,
      client_secret: GOOGLE_CONFIG.clientSecret,
      grant_type: 'refresh_token',
    });

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google token refresh failed: ${errorText}`);
    }

    return await response.json();
  },
};
