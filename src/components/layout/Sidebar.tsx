'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  Users, 
  Package, 
  DollarSign, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Calendar, label: 'Agenda', href: '/agenda' },
  { icon: Users, label: 'Pacientes', href: '/pacientes' },
  { icon: Package, label: 'Procedimentos', href: '/procedimentos' },
  { icon: DollarSign, label: 'Financeiro', href: '/financeiro' },
  { icon: BarChart3, label: 'Relatórios', href: '/relatorios' },
  { icon: Settings, label: 'Configurações', href: '/configuracoes' },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-ebony text-chrome flex flex-col fixed left-0 top-0 z-50 border-r border-white/5">
      <div className="p-8 mb-4">
        <h1 className="text-2xl font-serif tracking-tight">Lumière</h1>
        <p className="text-[10px] uppercase tracking-[0.3em] text-champagne/60 -mt-1 font-sans">SaaS Edition</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300
                ${isActive 
                  ? 'bg-bronze/10 text-bronze' 
                  : 'text-chrome/60 hover:bg-white/5 hover:text-champagne'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon 
                  size={20} 
                  className={`transition-colors ${isActive ? 'text-bronze' : 'text-champagne group-hover:text-champagne'}`} 
                />
                <span className="text-sm font-medium tracking-wide font-sans">
                  {item.label}
                </span>
              </div>
              {isActive && <ChevronRight size={14} className="text-bronze animate-pulse" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-chrome/40 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all duration-300">
          <LogOut size={20} />
          <span className="text-sm font-medium font-sans">Sair da Conta</span>
        </button>
      </div>
    </aside>
  );
};
