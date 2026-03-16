import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId, feedback } = await request.json(); // feedback: 'approved' | 'rejected'
    const supabase = await createSupabaseServerClient();

    const { data: post } = await supabase
      .from('posts')
      .select('voice_match_score')
      .eq('id', postId)
      .single();

    if (post) {
      // Adjust voice match score based on feedback
      const adjustment = feedback === 'approved' ? 0.05 : -0.05;
      const newScore = Math.max(0, Math.min(1, (post.voice_match_score || 0.5) + adjustment));
      await supabase.from('posts').update({ voice_match_score: newScore }).eq('id', postId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Voice feedback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
