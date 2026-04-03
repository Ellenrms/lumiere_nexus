'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Home, 
  Calendar, 
  Users, 
  Package, 
  DollarSign, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronRight,
  Loader2
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
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (error) {
              console.error('Erro ao buscar perfil:', error.message);
              setUserRole('RECEPTION');
          } else {
              setUserRole(data?.role || 'RECEPTION');
          }
        }
      } catch (err) {
        console.error('Falha na autenticação:', err);
        setUserRole('RECEPTION');
      } finally {
        setLoading(false);
      }
    };
    getProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  // Filtrar itens do menu por Role
  const filteredMenuItems = menuItems.filter(item => {
    if (userRole === 'ADMIN') return true;
    // Se não for ADMIN, esconde Financeiro, Relatórios e Configurações
    const restricted = ['Financeiro', 'Relatórios', 'Configurações'];
    return !restricted.includes(item.label);
  });

  return (
    <aside className="w-64 h-screen bg-ebony text-chrome flex flex-col fixed left-0 top-0 z-50 border-r border-white/5">
      <div className="p-8 mb-4">
        <h1 className="text-2xl font-serif tracking-tight text-white">Lumière</h1>
        <p className="text-[10px] uppercase tracking-[0.3em] text-champagne/60 -mt-1 font-sans font-bold">SaaS Edition</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {loading ? (
            <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-bronze/40" size={20} /></div>
        ) : (
            filteredMenuItems.map((item) => {
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
                        className={`transition-colors ${isActive ? 'text-bronze' : 'text-champagne/60 group-hover:text-champagne'}`} 
                        />
                        <span className="text-sm font-medium tracking-wide font-sans">
                        {item.label}
                        </span>
                    </div>
                    {isActive && <ChevronRight size={14} className="text-bronze animate-pulse" />}
                    </Link>
                );
            })
        )}
      </nav>

      <div className="p-6 border-t border-white/5">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-chrome/40 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all duration-300"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium font-sans">Sair da Conta</span>
        </button>
      </div>
    </aside>
  );
};
