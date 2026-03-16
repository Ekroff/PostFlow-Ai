import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { analyzeVoiceProfile } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { samplePosts } = await request.json();
    if (!samplePosts) {
      return NextResponse.json({ error: 'Sample posts required' }, { status: 400 });
    }

    const profile = await analyzeVoiceProfile(samplePosts);
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Voice analyse error:', error);
    return NextResponse.json({ error: 'Failed to analyze voice' }, { status: 500 });
  }
}
