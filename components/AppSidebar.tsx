'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Sparkles,
  Clock,
  CalendarDays,
  Settings,
  Linkedin,
} from 'lucide-react';

const navItems = [
  { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/generate', label: 'Generate', icon: Sparkles },
  { href: '/app/queue', label: 'Queue', icon: Clock },
  { href: '/app/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/app/settings', label: 'Settings', icon: Settings },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-5">
        <div className="rounded-lg bg-[#0077b5] p-1.5">
          <Linkedin className="h-4.5 w-4.5 text-white" />
        </div>
        <span className="text-base font-bold text-gray-900">PostFlow AI</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-[#0077b5]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`h-4.5 w-4.5 ${active ? 'text-[#0077b5]' : 'text-gray-400'}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-gray-100 px-5 py-4">
        <UserButton
          appearance={{
            elements: {
              userButtonBox: 'flex items-center gap-3',
              userButtonTrigger: 'focus:shadow-none',
            },
          }}
          showName
        />
      </div>
    </aside>
  );
}
