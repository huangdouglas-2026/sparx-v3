import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { googleService } from '@/services/social/google';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
  const error = requestUrl.searchParams.get('error');

  console.log('🔄 Google callback received:', { code: !!code, state: !!state, error });

  // Handle OAuth errors
  if (error) {
    console.error('❌ Google OAuth error:', error);
    return NextResponse.redirect(
      new URL(`/profile?error=${encodeURIComponent(error || 'google_auth_failed')}`, request.url)
    );
  }

  if (!code) {
    console.error('❌ No authorization code received');
    return NextResponse.redirect(
      new URL('/profile?error=no_code', request.url)
    );
  }

  try {
    // Exchange code for access token
    const tokenData = await googleService.exchangeCodeForToken(code, state || '');
    console.log('✅ Google token received');

    // Get user's Gmail address
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    const userInfo = await userInfoResponse.json();
    const gmail = userInfo.email;

    // Get user from Supabase
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('❌ No authenticated user found');
      return NextResponse.redirect(
        new URL('/login?message=not_authenticated', request.url)
      );
    }

    // Check if Google connection already exists
    const { data: existing } = await supabase
      .from('social_connections')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', 'google')
      .maybeSingle();

    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

    if (existing) {
      // Update existing connection
      await supabase
        .from('social_connections')
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || null,
          profile_url: gmail,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
      console.log('✅ Updated Google connection');
    } else {
      // Insert new connection
      await supabase
        .from('social_connections')
        .insert({
          user_id: user.id,
          platform: 'google',
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || null,
          profile_url: gmail,
          expires_at: expiresAt,
          last_synced_at: new Date().toISOString(),
        });
      console.log('✅ Created new Google connection');
    }

    // Redirect back to profile with success message
    return NextResponse.redirect(
      new URL('/profile?message=google_connected', request.url)
    );
  } catch (error) {
    console.error('❌ Google OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/profile?error=${encodeURIComponent((error as Error).message || 'google_connection_failed')}`, request.url)
    );
  }
}
