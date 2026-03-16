import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { AppSidebar } from '@/components/AppSidebar';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  // Guard: redirect users who haven't completed onboarding (no workspace yet).
  // Only runs when Supabase is configured to avoid blocking local dev without env vars.
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
