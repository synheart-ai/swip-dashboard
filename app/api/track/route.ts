import { NextRequest, NextResponse } from 'next/server';
import { trackApiCallFromMiddleware } from '../../../src/lib/api-tracker';

// This endpoint runs in Node.js runtime (not Edge Runtime)
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const trackingData = await request.json();
    
    // Create a mock response object for the tracking function
    const mockResponse = new NextResponse();
    
    // Track the API call using the existing function
    await trackApiCallFromMiddleware(
      trackingData.endpoint,
      trackingData.method,
      trackingData.startTime,
      trackingData.ipAddress,
      trackingData.userAgent,
      trackingData.userId,
      trackingData.appId,
      mockResponse.status
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in tracking endpoint:', error);
    return NextResponse.json({ error: 'Tracking failed' }, { status: 500 });
  }
}
