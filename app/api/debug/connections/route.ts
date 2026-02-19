import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
          connections: [],
        },
        { status: 401 }
      );
    }

    // 獲取所有社交連結
    const { data: connections, error } = await supabase
      .from('social_connections')
      .select('*')
      .eq('user_id', user.id);

    // 獲取最近的通知數量
    const { count: notificationCount } = await supabase
      .from('social_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
      },
      connections: connections || [],
      summary: {
        totalConnections: connections?.length || 0,
        platforms: connections?.map(c => c.platform) || [],
        notificationCountLast7Days: notificationCount || 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      {
        error: error.message,
        hint: 'Check server logs for details',
      },
      { status: 500 }
    );
  }
}
