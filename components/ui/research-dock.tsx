'use client';

import {
  Home,
  User,
  BookOpen,
  GraduationCap,
  Search,
  FileText,
  Mail,
} from 'lucide-react';

import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock';

const data = [
  {
    title: 'Home',
    icon: <Home className='h-full w-full text-[#0CF2A0]' strokeWidth={1.5} />,
    href: '/',
  },
  {
    title: 'Professors',
    icon: <GraduationCap className='h-full w-full text-[#0CF2A0]' strokeWidth={1.5} />,
    href: '/professors',
  },
  {
    title: 'Research',
    icon: <BookOpen className='h-full w-full text-[#0CF2A0]' strokeWidth={1.5} />,
    href: '/research',
  },
  {
    title: 'Search',
    icon: <Search className='h-full w-full text-[#0CF2A0]' strokeWidth={1.5} />,
    href: '/search',
  },
  {
    title: 'Profile',
    icon: <User className='h-full w-full text-[#0CF2A0]' strokeWidth={1.5} />,
    href: '/profile',
  },
  {
    title: 'Publications',
    icon: <FileText className='h-full w-full text-[#0CF2A0]' strokeWidth={1.5} />,
    href: '/publications',
  },
  {
    title: 'Contact',
    icon: <Mail className='h-full w-full text-[#0CF2A0]' strokeWidth={1.5} />,
    href: '/contact',
  },
];

export function ResearchDock() {
  return (
    <div className="fixed top-2 left-1/2 max-w-full -translate-x-1/2 z-50">
      <Dock 
        className="items-center pt-2" 
        magnification={120} 
        distance={80} 
        panelHeight={54} 
        spring={{ mass: 0.5, stiffness: 350, damping: 25 }}
      >
        {data.map((item, idx) => (
          <DockItem
            key={idx}
            className="aspect-square bg-transparent mx-1.5"
          >
            <DockLabel>{item.title}</DockLabel>
            <DockIcon>
              <a href={item.href} className="block w-full h-full p-2">
                {item.icon}
              </a>
            </DockIcon>
          </DockItem>
        ))}
      </Dock>
    </div>
  );
} 