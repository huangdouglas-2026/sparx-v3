/**
 * Debug Endpoint - Scan Facebook Email Senders
 *
 * This endpoint scans Gmail for emails from any Facebook-related domain
 * and returns the sender addresses to help diagnose sync issues.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Google connection
    const { data: connection, error: connectionError } = await supabase
      .from('social_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'google')
      .single();

    if (connectionError || !connection) {
      return NextResponse.json({ error: 'Google account not connected' }, { status: 400 });
    }

    // Scan for any email with 'facebook' in the sender address
    // This is a broad search to find ALL Facebook-related senders
    const gmailQuery = 'from:facebook OR from:@fb OR from:fb.com';

    // Fetch Gmail messages using the Gmail API
    const accessToken = connection.access_token;
    const gmailUrl = `https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(gmailQuery)}&maxResults=20`;

    const response = await fetch(gmailUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        error: 'Failed to fetch Gmail messages',
        details: errorText,
      }, { status: response.status });
    }

    const data = await response.json();
    const messages = data.messages || [];

    // Fetch full message details to get sender addresses
    const senders = new Map<string, { count: number; examples: string[] }>();

    for (const message of messages.slice(0, 10)) { // Limit to 10 for speed
      try {
        const detailUrl = `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`;
        const detailResponse = await fetch(detailUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!detailResponse.ok) continue;

        const messageData = await detailResponse.json();

        // Extract sender from headers
        const headers = messageData.payload?.headers || [];
        const fromHeader = headers.find((h: any) => h.name === 'From');
        const from = fromHeader?.value || 'Unknown';

        // Count by sender
        if (!senders.has(from)) {
          senders.set(from, { count: 0, examples: [] });
        }
        const senderInfo = senders.get(from)!;
        senderInfo.count++;
        if (senderInfo.examples.length < 3) {
          const subjectHeader = headers.find((h: any) => h.name === 'Subject');
          senderInfo.examples.push(subjectHeader?.value || '(No subject)');
        }
      } catch (error) {
        console.error('Error fetching message detail:', error);
      }
    }

    // Convert Map to array and sort by count
    const results = Array.from(senders.entries()).map(([sender, info]) => ({
      sender,
      count: info.count,
      examples: info.examples,
      domain: sender.includes('@') ? sender.split('@')[1] : 'unknown',
    })).sort((a, b) => b.count - a.count);

    return NextResponse.json({
      success: true,
      totalMessages: messages.length,
      scannedMessages: Math.min(messages.length, 10),
      senders: results,
      recommendations: {
        querySuggestion: results.length > 0
          ? `from:${results[0].domain}`
          : 'from:facebookmail.com',
        hasFacebookMail: results.some(r => r.domain.includes('facebookmail')),
        hasFacebookCom: results.some(r => r.domain.includes('facebook.com')),
      },
    });

  } catch (error: any) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message,
    }, { status: 500 });
  }
}
