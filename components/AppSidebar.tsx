'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Zap,
  ListChecks,
  Calendar,
  Settings,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/generate', label: 'Generate', icon: Zap },
  { href: '/app/queue', label: 'Review Queue', icon: ListChecks },
  { href: '/app/calendar', label: 'Calendar', icon: Calendar },
  { href: '/app/settings', label: 'Settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <span className="text-lg font-bold text-blue-700">PostFlow AI</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={18} className={active ? 'text-blue-700' : 'text-gray-400'} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-3">
        <UserButton />
        <span className="text-xs text-gray-500">Account</span>
      </div>
    </aside>
  );
}
