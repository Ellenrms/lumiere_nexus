'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  Plus,
  Loader2,
  Syringe
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayAppointments: [] as any[],
    totalPatients: 0,
    monthlyRevenue: 0,
    activeProcedures: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // 1. Agendamentos de Hoje
      const { data: appts } = await supabase
        .from('appointments')
        .select('*, patients(full_name, photo_url), procedures(name)')
        .gte('start_time', `${today}T00:00:00`)
        .lte('start_time', `${today}T23:59:59`)
        .order('start_time', { ascending: true });

      // 2. Contadores Rápidos
      const { count: pCount } = await supabase.from('patients').select('*', { count: 'exact', head: true });
      const { count: procCount } = await supabase.from('procedures').select('*', { count: 'exact', head: true });

      // 3. Faturamento do Mês
      const firstDay = new Date();
      firstDay.setDate(1);
      const { data: revData } = await supabase
        .from('medical_records')
        .select('products_used')
        .eq('payment_status', 'pago')
        .gte('created_at', firstDay.toISOString());

      const monthlyTotal = revData?.reduce((acc, curr) => acc + parseFloat(curr.products_used?.price || 0), 0) || 0;

      setStats({
        todayAppointments: appts || [],
        totalPatients: pCount || 0,
        monthlyRevenue: monthlyTotal,
        activeProcedures: procCount || 0
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
          <p className="text-mid-gray italic font-serif text-lg">Aqui está o resumo do seu dia na Lumière.</p>
        </div>
        <div className="hidden md:flex gap-3">
            <Link href="/agenda">
                <button className="flex items-center gap-2 px-6 py-3 bg-ebony text-white rounded-xl hover:bg-ebony/90 transition-all shadow-lg text-sm font-medium">
                    <Calendar size={18} /> Ver Agenda Completa
                </button>
            </Link>
        </div>
      </header>

      {/* Grid de Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="premium" className="bg-white border-sand/40 p-6 flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
                <div className="p-2 bg-bronze/10 rounded-lg text-bronze"><Users size={20} /></div>
                <span className="text-[10px] font-bold text-mahogany/40 uppercase tracking-[0.2em]">Total Pacientes</span>
            </div>
            <p className="text-3xl font-serif text-ebony">{stats.totalPatients}</p>
        </Card>

        <Card variant="premium" className="bg-bronze text-white p-6 flex flex-col justify-between h-36 border-none shadow-xl">
            <div className="flex justify-between items-start">
                <div className="p-2 bg-white/10 rounded-lg text-white"><TrendingUp size={20} /></div>
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">Receita do Mês</span>
            </div>
            <p className="text-3xl font-serif">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats.monthlyRevenue)}
            </p>
        </Card>

        <Card variant="premium" className="bg-white border-sand/40 p-6 flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
                <div className="p-2 bg-mahogany/10 rounded-lg text-mahogany"><Clock size={20} /></div>
                <span className="text-[10px] font-bold text-mahogany/40 uppercase tracking-[0.2em]">Consultas Hoje</span>
            </div>
            <p className="text-3xl font-serif text-ebony">{stats.todayAppointments.length}</p>
        </Card>

        <Card variant="premium" className="bg-sand/20 border-sand/40 p-6 flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
                <div className="p-2 bg-bronze/10 rounded-lg text-bronze"><Syringe size={20} /></div>
                <span className="text-[10px] font-bold text-mahogany/40 uppercase tracking-[0.2em]">Serviços Ativos</span>
            </div>
            <p className="text-3xl font-serif text-ebony">{stats.activeProcedures}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agenda de Hoje Próxima */}
        <Card variant="premium" className="lg:col-span-2 p-8 border-sand/30 bg-white">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-serif text-ebony">Próximos Atendimentos</h3>
                <Link href="/agenda" className="text-xs text-bronze hover:underline font-bold tracking-widest uppercase flex items-center gap-1">
                    Ver tudo <ArrowRight size={12} />
                </Link>
            </div>

            {stats.todayAppointments.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-sand/50 rounded-2xl">
                    <Calendar className="mx-auto text-sand/40 mb-4" size={40} />
                    <p className="text-mid-gray italic font-serif">Nenhuma paciente agendada para hoje.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {stats.todayAppointments.map((appt) => (
                        <div key={appt.id} className="flex items-center justify-between p-4 bg-sand/5 rounded-2xl border border-sand/20 hover:bg-sand/10 transition-colors">
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
        </Card>

        {/* Ações Rápidas */}
        <div className="space-y-6">
            <Card variant="premium" className="p-8 bg-mahogany text-white border-none shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                    <h3 className="text-xl font-serif mb-2">Novo Prontuário</h3>
                    <p className="text-xs text-white/60 mb-6 leading-relaxed">Cadastre uma nova paciente para iniciar o acompanhamento clínico.</p>
                    <Link href="/pacientes">
                        <button className="flex items-center gap-2 px-6 py-3 bg-bronze text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all">
                            <Plus size={16} /> Cadastrar Paciente
                        </button>
                    </Link>
                </div>
                <Users className="absolute -bottom-6 -right-6 text-white/5 group-hover:scale-110 transition-transform" size={160} />
            </Card>

            <Card variant="premium" className="p-6 border-sand/30 bg-white">
                <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-mid-gray mb-4">Lembrete do Sistema</h4>
                <div className="bg-sand/10 p-4 rounded-xl border-l-4 border-bronze">
                    <p className="text-xs text-mahogany/80 italic font-serif leading-relaxed">
                        "Lembre de anexar as fotos de antes e depois nos atendimentos de hoje para alimentar os relatórios de evolução."
                    </p>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
}
