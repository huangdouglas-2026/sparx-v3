import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { emailSyncScheduler } from '@/services/social/emailSyncScheduler';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's Google connection
    const { data: connection, error: connectionError } = await supabase
      .from('social_connections')
      .select('access_token')
      .eq('user_id', user.id)
      .eq('platform', 'google')
      .single();

    if (connectionError || !connection || !connection.access_token) {
      return NextResponse.json(
        { error: 'No Google connection found' },
        { status: 400 }
      );
    }

    // Perform sync (syncUser will fetch full connection data)
    const result = await emailSyncScheduler.syncUser(user.id);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('Error syncing emails:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to sync emails',
      },
      { status: 500 }
    );
  }
}
