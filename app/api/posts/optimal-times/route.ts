import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Evidence-based optimal LinkedIn posting times (UTC)
const OPTIMAL_TIMES = [
  { day: 'Tuesday', hour: 9, minute: 0 },
  { day: 'Wednesday', hour: 9, minute: 0 },
  { day: 'Thursday', hour: 8, minute: 30 },
  { day: 'Tuesday', hour: 12, minute: 0 },
  { day: 'Wednesday', hour: 12, minute: 0 },
];

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json({ optimal_times: OPTIMAL_TIMES });
}
