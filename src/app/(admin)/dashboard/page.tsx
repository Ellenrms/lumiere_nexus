'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/ui/Avatar';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  Plus,
  Loader2,
  Syringe,
  Percent,
  UserPlus
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayAppointments: [] as any[],
    totalPatients: 0,
    monthlyRevenue: 0,
    newPatientsMonth: 0,
    occupancyRate: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // 1. Agendamentos e Ocupação
      const { data: appts } = await supabase
        .from('appointments')
        .select('*, patients(full_name, photo_url), procedures(name, duration_min)')
        .gte('start_time', `${today}T00:00:00`)
        .lte('start_time', `${today}T23:59:59`)
        .order('start_time', { ascending: true });

      // Cálculo de Ocupação (Grade de 14h = 840 min)
      const validAppts = appts?.filter(a => a.status !== 'cancelado' && a.status !== 'bloqueado') || [];
      const totalBookedMin = validAppts.reduce((acc, curr) => acc + (curr.procedures?.duration_min || 30), 0);
      const occupancy = Math.min(Math.round((totalBookedMin / 840) * 100), 100);

      // 2. Novos Pacientes no Mês
      const { count: newPCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      // 3. Faturamento do Mês
      const { data: revData } = await supabase
        .from('medical_records')
        .select('products_used')
        .eq('payment_status', 'pago')
        .gte('created_at', startOfMonth.toISOString());

      const monthlyTotal = revData?.reduce((acc: number, curr: any) => acc + parseFloat(curr.products_used?.price || 0), 0) || 0;

      const { count: totalP } = await supabase.from('patients').select('*', { count: 'exact', head: true });

      setStats({
        todayAppointments: appts || [],
        totalPatients: totalP || 0,
        monthlyRevenue: monthlyTotal,
        newPatientsMonth: newPCount || 0,
        occupancyRate: occupancy
      });

    } catch (error: any) {
      console.error('Erro no dashboard:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-bronze" size={32} />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-display text-4xl text-ebony">Olá, Dra. Maria Gonçalves</h1>
          <p className="text-mid-gray italic font-serif text-lg">Aqui está o resumo estratégico da Lumière.</p>
        </div>
        <div className="hidden md:flex gap-3">
            <Link href="/agenda">
                <button className="flex items-center gap-2 px-6 py-3 bg-ebony text-white rounded-xl hover:bg-ebony/90 transition-all shadow-lg text-sm font-medium">
                    <Calendar size={18} /> Ver Agenda Completa
                </button>
            </Link>
        </div>
      </header>

      {/* Grid de Stats Estratégicas - VISIBILIDADE MÁXIMA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Ocupação do Dia - CRÍTICO PARA SaaS */}
        <div className="bg-[#1A1A1A] rounded-[24px] p-6 flex flex-col justify-between h-40 shadow-2xl border-b-4 border-bronze group hover:scale-[1.02] transition-transform">
            <div className="flex justify-between items-start">
                <div className="p-3 bg-white/10 rounded-xl text-bronze"><Percent size={24} /></div>
                <div className="text-right">
                    <span className="block text-[10px] font-bold text-white uppercase tracking-[0.2em]">Ocupação Hoje</span>
                    <span className="text-[9px] text-bronze font-bold uppercase tracking-widest mt-1 block">Agenda do Dia</span>
                </div>
            </div>
            <div className="flex items-end justify-between">
                <p className="text-4xl font-serif text-white">{stats.occupancyRate}%</p>
                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-bronze transition-all duration-1000" style={{ width: `${stats.occupancyRate}%` }} />
                </div>
            </div>
        </div>

        {/* Card 2: Receita Mensal */}
        <div className="bg-[#C5A059] rounded-[24px] p-6 flex flex-col justify-between h-40 shadow-2xl border-b-4 border-white/40 group hover:scale-[1.02] transition-transform">
            <div className="flex justify-between items-start">
                <div className="p-3 bg-white/20 rounded-xl text-white"><TrendingUp size={24} /></div>
                <div className="text-right">
                    <span className="block text-[10px] font-bold text-white uppercase tracking-[0.2em]">Receita do Mês</span>
                    <span className="text-[9px] text-white/60 font-medium uppercase tracking-widest mt-1 block">Bruto Recebido</span>
                </div>
            </div>
            <p className="text-3xl font-serif text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats.monthlyRevenue)}
            </p>
        </div>

        {/* Card 3: Novos Pacientes (Crescimento) */}
        <div className="bg-[#1A1A1A] rounded-[24px] p-6 flex flex-col justify-between h-40 shadow-2xl border-b-4 border-bronze group hover:scale-[1.02] transition-transform">
            <div className="flex justify-between items-start">
                <div className="p-3 bg-white/10 rounded-xl text-bronze"><UserPlus size={24} /></div>
                <div className="text-right">
                    <span className="block text-[10px] font-bold text-white uppercase tracking-[0.2em]">Novas Pacientes</span>
                    <span className="text-[9px] text-bronze font-bold uppercase tracking-widest mt-1 block">Este Mês</span>
                </div>
            </div>
            <div className="flex items-end justify-between">
                <p className="text-4xl font-serif text-white">+{stats.newPatientsMonth}</p>
                <span className="text-[10px] text-white/40 font-medium pb-1">Crescimento Fiel</span>
            </div>
        </div>

        {/* Card 4: Tick Médio ou Atendimentos Pendentes */}
        <div className="bg-white border-2 border-sand rounded-[24px] p-6 flex flex-col justify-between h-40 shadow-xl border-b-4 border-sand/50 group hover:scale-[1.02] transition-transform">
            <div className="flex justify-between items-start">
                <div className="p-3 bg-sand rounded-xl text-mahogany"><Clock size={24} /></div>
                <div className="text-right">
                    <span className="block text-[10px] font-bold text-ebony uppercase tracking-[0.2em]">Sessões Pendentes</span>
                    <span className="text-[9px] text-mahogany/60 font-bold uppercase tracking-widest mt-1 block">Próximas Hoje</span>
                </div>
            </div>
            <p className="text-4xl font-serif text-ebony">
                {stats.todayAppointments.filter(a => a.status === 'confirmado').length}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 bg-white rounded-[24px] border border-sand shadow-sm">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-serif text-ebony">Próximos Atendimentos</h3>
                <Link href="/agenda" className="text-xs text-bronze hover:underline font-bold tracking-widest uppercase flex items-center gap-1">
                    Ver tudo <ArrowRight size={12} />
                </Link>
            </div>

            {stats.todayAppointments.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-sand/50 rounded-2xl bg-sand/5">
                    <Calendar className="mx-auto text-sand/40 mb-4" size={40} />
                    <p className="text-ebony font-medium italic font-serif">Nenhuma paciente agendada para hoje.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {stats.todayAppointments.map((appt) => (
                        <div key={appt.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${appt.status === 'cancelado' ? 'bg-gray-50 border-gray-200 opacity-50' : 'bg-sand/5 border-sand/20 hover:bg-sand/10'}`}>
                            <div className="flex items-center gap-4">
                                <div className="text-center min-w-[60px] border-r border-sand pr-4">
                                    <p className="text-lg font-serif text-ebony">
                                        {new Date(appt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Avatar src={appt.patients?.photo_url} name={appt.patients?.full_name} size="sm" />
                                    <div>
                                        <p className="text-sm font-bold text-ebony tracking-tight">{appt.patients?.full_name}</p>
                                        <p className="text-xs text-mahogany/60 flex items-center gap-1 uppercase tracking-tighter font-medium">
                                            <Syringe size={10} className="text-bronze" /> {appt.procedures?.name || 'Consulta'}
                                            {appt.status !== 'confirmado' && <span className="ml-1 text-[8px] border px-1 rounded font-bold uppercase">{appt.status}</span>}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <Link href={`/pacientes/${appt.patient_id}`}>
                                <button className="p-2 hover:bg-bronze/10 rounded-full text-bronze transition-all">
                                    <ArrowRight size={20} />
                                </button>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="space-y-6">
            <div className="p-8 bg-mahogany text-white rounded-[32px] shadow-2xl relative overflow-hidden group">
                <div className="relative z-10">
                    <h3 className="text-2xl font-serif mb-2">Novo Prontuário</h3>
                    <p className="text-sm text-white/70 mb-8 leading-relaxed">Cadastre uma nova paciente para iniciar o acompanhamento clínico imediatamente.</p>
                    <Link href="/pacientes">
                        <button className="flex items-center gap-2 px-8 py-4 bg-bronze text-white rounded-xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg hover:scale-105 transition-all">
                            <Plus size={18} /> Cadastrar Paciente
                        </button>
                    </Link>
                </div>
                <Users className="absolute -bottom-6 -right-6 text-white/5 group-hover:scale-110 transition-transform" size={160} />
            </div>

            <div className="p-6 bg-white rounded-[24px] border border-sand shadow-sm">
                <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-bronze mb-4">Métrica Geral</h4>
                <div className="flex justify-between items-end border-b border-sand pb-4 mb-4">
                    <span className="text-xs text-mid-gray">Total de Pacientes</span>
                    <span className="text-2xl font-serif text-ebony">{stats.totalPatients}</span>
                </div>
                <div className="bg-sand/10 p-4 rounded-xl border-l-4 border-bronze">
                    <p className="text-sm text-ebony leading-relaxed font-serif italic">
                        "Lembre de anexar as fotos de antes e depois nos atendimentos de hoje."
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
