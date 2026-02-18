/**
 * Batch Email Sync API Endpoint
 *
 * This endpoint is called by Vercel Cron Jobs to automatically sync
 * all users' social media notifications from Gmail.
 *
 * Protected by CRON_SECRET to prevent unauthorized access.
 */

import { NextResponse } from 'next/server';
import { emailSyncScheduler } from '@/services/social/emailSyncScheduler';
import { createClient } from '@/lib/supabase/server';

/**
 * Log sync job results to database
 */
async function logSyncJob(data: {
  startedAt: Date;
  completedAt: Date;
  usersProcessed: number;
  linkedinCount: number;
  facebookCount: number;
  errors: string[];
  durationMs: number;
  success: boolean;
}) {
  try {
    const supabase = await createClient();

    await supabase.from('sync_logs').insert({
      started_at: data.startedAt.toISOString(),
      completed_at: data.completedAt.toISOString(),
      users_processed: data.usersProcessed,
      notifications_found: data.linkedinCount + data.facebookCount,
      linkedin_count: data.linkedinCount,
      facebook_count: data.facebookCount,
      errors: data.errors.length,
      error_details: data.errors.length > 0 ? { errors: data.errors.slice(0, 50) } : null,
      duration_ms: data.durationMs,
      success: data.success,
    });

    console.log('📝 Sync log saved to database');
  } catch (error: any) {
    console.error('⚠️ Failed to save sync log:', error.message);
    // Don't throw - logging failure shouldn't fail the sync job
  }
}

export async function POST(request: Request) {
  const startTime = Date.now();
  const startedAt = new Date();

  // Validate CRON_SECRET for security
  const cronSecret = process.env.CRON_SECRET;
  const requestSecret = request.headers.get('x-cron-secret');

  if (!cronSecret) {
    console.error('❌ CRON_SECRET environment variable is not set');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  if (requestSecret !== cronSecret) {
    console.warn('⚠️ Unauthorized batch sync attempt');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  console.log('🔄 Starting batch email sync...');
  console.log('📅 Time:', startedAt.toISOString());

  try {
    // Run batch sync with parallel processing
    const result = await emailSyncScheduler.syncAllUsers();

    const duration = Date.now() - startTime;
    const completedAt = new Date();
    const durationSeconds = (duration / 1000).toFixed(2);

    console.log('✅ Batch sync completed:', {
      totalUsers: result.processed > 0 ? 'N/A' : 0,
      linkedin: result.linkedin,
      facebook: result.facebook,
      errors: result.errors.length,
      duration: `${durationSeconds}s`,
    });

    // Log sync job to database
    await logSyncJob({
      startedAt,
      completedAt,
      usersProcessed: 0, // syncAllUsers doesn't return user count, keeping as 0 for now
      linkedinCount: result.linkedin,
      facebookCount: result.facebook,
      errors: result.errors,
      durationMs: duration,
      success: result.errors.length === 0,
    });

    // Always return 200 on completion (even with partial failures)
    // This allows Vercel Cron to track successful executions
    return NextResponse.json({
      success: true,
      timestamp: completedAt.toISOString(),
      data: {
        totalUsers: 'multiple',
        notifications: {
          linkedin: result.linkedin,
          facebook: result.facebook,
          total: result.linkedin + result.facebook,
        },
        errors: {
          count: result.errors.length,
          details: result.errors.slice(0, 10), // First 10 errors
        },
        duration: `${durationSeconds}s`,
      },
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    const completedAt = new Date();

    console.error('❌ Batch sync failed:', error);
    console.error('Duration:', `${(duration / 1000).toFixed(2)}s`);

    // Log failed sync job to database
    await logSyncJob({
      startedAt,
      completedAt,
      usersProcessed: 0,
      linkedinCount: 0,
      facebookCount: 0,
      errors: [error.message || 'Unknown error'],
      durationMs: duration,
      success: false,
    });

    // Still return 200 to avoid Vercel Cron retries on genuine errors
    // but include error information
    return NextResponse.json({
      success: false,
      timestamp: completedAt.toISOString(),
      error: error.message || 'Unknown error',
      duration: `${(duration / 1000).toFixed(2)}s`,
    }, { status: 200 });
  }
}

// Support GET for health checks (optional)
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const requestSecret = request.headers.get('x-cron-secret');

  if (requestSecret !== cronSecret) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    status: 'healthy',
    endpoint: '/api/sync/batch',
    timestamp: new Date().toISOString(),
  });
}
