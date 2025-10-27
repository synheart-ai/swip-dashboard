/**
 * Debug endpoint for OAuth troubleshooting
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  
  return NextResponse.json({
    message: 'OAuth Debug Info',
    code: code ? 'Present' : 'Missing',
    error: error || 'None',
    url: request.url,
    headers: {
      'user-agent': request.headers.get('user-agent'),
      'referer': request.headers.get('referer'),
    },
    env: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing',
    }
  });
}
