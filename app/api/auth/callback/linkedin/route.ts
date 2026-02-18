import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  console.log('🔄 LinkedIn callback received:', { code: !!code, state: !!state, error });

  // Handle OAuth errors
  if (error) {
    console.error('❌ LinkedIn OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/profile?error=${encodeURIComponent(error || 'linkedin_auth_failed')}`, request.url)
    );
  }

  // Check for authorization code
  if (!code) {
    console.error('❌ No authorization code received');
    return NextResponse.redirect(
      new URL('/profile?error=no_code', request.url)
    );
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('LinkedIn credentials are not configured');
    }

    // Build redirect URI from request URL
    const redirectUri = `${requestUrl.origin}/api/auth/callback/linkedin`;

    console.log('🔑 Exchanging authorization code for access token...', { redirectUri });

    // Exchange code for access token
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ LinkedIn token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        body: errorText,
      });
      throw new Error(`Failed to exchange code for token: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Token received:', {
      hasAccessToken: !!tokenData.access_token,
      expiresIn: tokenData.expires_in,
    });

    // Get LinkedIn profile
    console.log('👤 Fetching LinkedIn profile...');
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch LinkedIn profile');
    }

    const profile = await profileResponse.json();
    console.log('✅ LinkedIn profile fetched:', { sub: profile.sub, email: profile.email_address });

    // Store token in database
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('❌ Auth error:', authError);
    }

    if (!user) {
      console.error('❌ No authenticated user found');
      return NextResponse.redirect(
        new URL('/login?message=not_authenticated', request.url)
      );
    }

    console.log('✅ User authenticated:', user.id);

    // Check if connection already exists
    const { data: existing } = await supabase
      .from('social_connections')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', 'linkedin')
      .maybeSingle();

    if (existing) {
      // Update existing token
      await supabase
        .from('social_connections')
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || null,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
      console.log('✅ Updated existing LinkedIn connection');
    } else {
      // Insert new connection
      await supabase
        .from('social_connections')
        .insert({
          user_id: user.id,
          platform: 'linkedin',
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || null,
          profile_url: `https://www.linkedin.com/in/${profile.sub}`,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          last_synced_at: new Date().toISOString(),
        });
      console.log('✅ Created new LinkedIn connection');
    }

    // Try to update profiles table (may not exist or may not have linkedin columns)
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          linkedin_url: `https://www.linkedin.com/in/${profile.sub}`,
          linkedin_connected_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.warn('⚠️ Could not update profiles table:', updateError.message);
      } else {
        console.log('✅ Profile updated with LinkedIn data');
      }
    } catch (err) {
      console.warn('⚠️ Profile update skipped:', (err as Error).message);
    }

    // Redirect back to profile page with success message
    console.log('✅ LinkedIn connection successful, redirecting to profile...');
    return NextResponse.redirect(
      new URL('/profile?message=linkedin_connected', request.url)
    );
  } catch (error) {
    console.error('❌ LinkedIn OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/profile?error=${encodeURIComponent((error as Error).message || 'linkedin_connection_failed')}`, request.url)
    );
  }
}
