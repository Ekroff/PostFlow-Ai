import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import AppSidebar from '@/components/AppSidebar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  // Guard: redirect to onboarding if no workspace
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = await createSupabaseServerClient();
    const { data: user } = await supabase
      .from('users')
      .select('workspace_id')
      .eq('clerk_user_id', userId)
      .single();
    if (!user?.workspace_id) redirect('/onboarding');
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
    </div>
  );
}
