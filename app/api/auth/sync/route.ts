import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const supabase = await createSupabaseServerClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, workspace_id')
      .eq('clerk_user_id', userId)
      .single();

    if (existingUser) {
      return NextResponse.json({ user: existingUser, isNew: false });
    }

    // Create workspace for new user
    const workspaceName =
      clerkUser.fullName ||
      clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] ||
      'My Workspace';
    const workspaceSlug =
      workspaceName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();

    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .insert({ name: workspaceName, slug: workspaceSlug, settings: {} })
      .select()
      .single();

    if (wsError || !workspace) {
      return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 });
    }

    // Create user
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        clerk_user_id: userId,
        workspace_id: workspace.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        full_name: clerkUser.fullName,
        avatar_url: clerkUser.imageUrl,
        role: 'admin',
      })
      .select()
      .single();

    if (userError || !newUser) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    return NextResponse.json({ user: newUser, workspace, isNew: true });
  } catch (error) {
    console.error('Auth sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
