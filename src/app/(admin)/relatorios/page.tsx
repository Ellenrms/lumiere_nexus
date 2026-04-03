'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  BarChart3, 
  Calendar,
  Loader2,
  Syringe,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function RelatoriosPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    monthlyRevenue: [],
    topProcedures: [],
    paymentMethods: [],
    totalRevenue: 0,
    totalPatients: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Buscar todos os atendimentos pagos
      const { data: records, error: rError } = await supabase
        .from('medical_records')
        .select(`
          *,
          procedures (name)
        `)
        .eq('payment_status', 'pago');

      if (rError) throw rError;

      // 2. Buscar contagem de pacientes
      const { count: pCount } = await supabase.from('patients').select('*', { count: 'exact', head: true });

      // Processar dados para o gráfico de barras (Últimos 6 meses)
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthlyData = new Array(12).fill(0).map((_, i) => ({ 
        month: months[i], 
        value: 0,
        full: months[i] 
      }));

      let total = 0;
      const procCount: Record<string, number> = {};
      const payCount: Record<string, number> = {};

      records?.forEach((r: any) => {
        const date = new Date(r.created_at);
        const mIdx = date.getMonth();
        const amount = parseFloat(r.products_used?.price || 0);
        
        monthlyData[mIdx].value += amount;
        total += amount;

        // Top Procedimentos
        const pName = r.procedures?.name || 'Consulta/Outros';
        procCount[pName] = (procCount[pName] || 0) + 1;

        // Métodos de Pagamento
        const method = r.payment_method || 'Outros';
        payCount[method] = (payCount[method] || 0) + amount;
      });

      // Ordenar e pegar os relevantes
      const topProcs = Object.entries(procCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a,b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        monthlyRevenue: monthlyData,
        topProcedures: topProcs,
        paymentMethods: Object.entries(payCount).map(([name, value]) => ({ name, value })),
        totalRevenue: total,
        totalPatients: pCount || 0
      });

    } catch (error: any) {
      console.error('Erro ao processar relatórios:', error.message);
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

  const maxVal = Math.max(...stats.monthlyRevenue.map((m: any) => m.value)) || 1;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="mb-6">
        <h1 className="text-display text-4xl text-ebony">Inteligência de Negócio</h1>
        <p className="text-mid-gray italic font-serif text-lg">Performance e faturamento da Lumière</p>
      </header>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="premium" className="bg-[#1A1A1A] text-white flex flex-col justify-between p-6 h-36 border-none shadow-xl">
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-60">Faturamento Total</p>
          <div className="flex justify-between items-end">
            <span className="text-2xl font-serif">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalRevenue)}
            </span>
            <TrendingUp size={20} className="text-bronze" />
          </div>
        </Card>
        <Card variant="premium" className="bg-[#C5A059] text-white flex flex-col justify-between p-6 h-36 border-none shadow-xl">
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-90">Total de Pacientes</p>
          <div className="flex justify-between items-end">
            <span className="text-2xl font-serif">{stats.totalPatients}</span>
            <Users size={20} className="text-white/40" />
          </div>
        </Card>
        <Card variant="premium" className="flex flex-col justify-between p-6 h-36 border-sand/40 bg-white shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.2em] text-mid-gray">Conversão Média</p>
          <div className="flex justify-between items-end">
            <span className="text-2xl font-serif text-ebony">84%</span>
            <ArrowUpRight size={20} className="text-green-500" />
          </div>
        </Card>
        <Card variant="premium" className="flex flex-col justify-between p-6 h-36 border-sand/40 bg-white shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.2em] text-mid-gray">Valor Médio/Sessão</p>
          <div className="flex justify-between items-end">
            <span className="text-2xl font-serif text-ebony">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalRevenue / (stats.topProcedures.reduce((a:any, b:any)=>a+b.count,0) || 1))}
            </span>
            <ShoppingBag size={20} className="text-bronze" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Gráfico de Faturamento SVG Customizado */}
        <Card variant="premium" className="lg:col-span-2 p-8 border-sand/30 bg-white shadow-lg">
          <h3 className="text-sm font-serif text-ebony mb-10 flex items-center gap-2">
            <BarChart3 size={18} className="text-bronze" /> Crescimento Mensal
          </h3>
          
          <div className="relative h-64 w-full flex items-end justify-between gap-2 md:gap-4 px-2 border-b border-sand/50">
            {stats.monthlyRevenue.map((m: any, i: number) => {
                const height = (m.value / maxVal) * 100;
                return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative h-full">
                        {/* Tooltip simples no hover */}
                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-ebony text-white text-[10px] px-2 py-1 rounded-lg z-10 pointer-events-none whitespace-nowrap">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.value)}
                        </div>
                        
                        {/* Barra SVG/CSS */}
                        <div className="w-full mt-auto relative">
                             <div 
                                className="w-full bg-bronze/10 border-t border-x border-bronze/30 group-hover:bg-bronze/30 transition-all rounded-t-lg"
                                style={{ height: `${height}%`, minHeight: m.value > 0 ? '4px' : '0' }}
                             />
                        </div>
                        
                        <span className="absolute -bottom-7 text-[10px] font-bold text-mahogany/40 uppercase tracking-widest">{m.month}</span>
                    </div>
                )
            })}

            {/* Linhas de fundo heurísticas */}
            <div className="absolute left-0 right-0 h-px border-t border-dashed border-sand/30 bottom-[25%]" />
            <div className="absolute left-0 right-0 h-px border-t border-dashed border-sand/30 bottom-[50%]" />
            <div className="absolute left-0 right-0 h-px border-t border-dashed border-sand/30 bottom-[75%]" />
          </div>
        </Card>

        {/* Top Procedimentos e Pagamentos */}
        <div className="space-y-6">
            <Card variant="premium" className="p-6 border-sand/30 shadow-md">
                <h3 className="text-sm font-serif text-ebony mb-6 flex items-center gap-2">
                    <Syringe size={18} className="text-bronze" /> Mais Realizados
                </h3>
                <div className="space-y-5">
                    {stats.topProcedures.length === 0 ? (
                        <p className="text-xs text-mid-gray italic">Sem dados suficientes.</p>
                    ) : (
                        stats.topProcedures.map((p: any, i: number) => (
                            <div key={i} className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-ebony font-medium">{p.name}</span>
                                    <span className="text-bronze font-bold">{p.count}x</span>
                                </div>
                                <div className="h-1.5 w-full bg-sand/30 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-bronze rounded-full" 
                                        style={{ width: `${(p.count / stats.topProcedures[0].count) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            <Card variant="premium" className="p-6 border-sand/30 shadow-md">
                <h3 className="text-sm font-serif text-ebony mb-6">Meios de Pagamento</h3>
                <div className="grid grid-cols-2 gap-4">
                    {stats.paymentMethods.map((pm: any, i: number) => (
                        <div key={i} className="bg-sand/10 p-3 rounded-xl border border-sand/40">
                            <p className="text-[10px] uppercase tracking-widest text-mahogany/60 mb-1">{pm.name}</p>
                            <p className="text-sm font-bold text-ebony">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(pm.value)}
                            </p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
}
