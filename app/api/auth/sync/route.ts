import { auth, currentUser } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const supabase = createSupabaseServerClient();
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? '';

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('*, workspaces(*)')
    .eq('clerk_user_id', userId)
    .single();

  if (existingUser) {
    return NextResponse.json({ user: existingUser, isNew: false });
  }

  // Create the user record first (workspace_id set after workspace is created)
  const { data: newUser, error: userError } = await supabase
    .from('users')
    .insert({
      clerk_user_id: userId,
      email,
      role: 'admin',
      subscription_tier: 'free',
    })
    .select()
    .single();

  if (userError) return NextResponse.json({ error: userError.message }, { status: 500 });

  // Create a default workspace with the new user as owner
  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .insert({ name: `${clerkUser.firstName ?? 'My'}'s Workspace`, owner_id: newUser.id })
    .select()
    .single();

  if (wsError) return NextResponse.json({ error: wsError.message }, { status: 500 });

  // Link workspace back to user
  await supabase
    .from('users')
    .update({ workspace_id: workspace.id })
    .eq('id', newUser.id);

  return NextResponse.json({ user: { ...newUser, workspace_id: workspace.id }, workspace, isNew: true });
}
