'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  MessageSquare,
  Settings,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    title: 'Usuarios',
    href: '/admin/users',
    icon: <Users className="w-5 h-5" />,
  },
  {
    title: 'Cursos',
    href: '/admin/courses',
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    title: 'Calendario',
    href: '/admin/calendar',
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    title: 'Mensajes',
    href: '/admin/messages',
    icon: <MessageSquare className="w-5 h-5" />,
  },
  {
    title: 'Configuración',
    href: '/admin/settings',
    icon: <Settings className="w-5 h-5" />,
  },
];

interface SideNavProps {
  onNavigate: (title: string, href: string) => void;
}

export function SideNav({ onNavigate }: SideNavProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <nav
      className={cn(
        'fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transition-all duration-300',
        'hover:w-72'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex h-16 items-center px-6 border-b">
        <h1 className="text-xl font-semibold">School Management</h1>
      </div>
      
      <div className="px-3 py-4">
        {navItems.map((item) => (
          <button
            key={item.href}
            onClick={() => onNavigate(item.title, item.href)}
            className={cn(
              'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:bg-gray-100',
              pathname === item.href && 'bg-gray-100 text-gray-900'
            )}
          >
            {item.icon}
            <span className="flex-1 text-left">{item.title}</span>
            <ChevronRight className={cn(
              'w-4 h-4 transition-opacity',
              isHovered ? 'opacity-100' : 'opacity-0'
            )} />
          </button>
        ))}
      </div>
    </nav>
  );
} 