'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  Users, 
  ArrowUpRight, 
  ShoppingBag,
  Calendar,
  ChevronLeft
} from 'lucide-react';

export default function RelatoriosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPatients: 0,
    topProcedures: [] as any[],
    revenueByMonth: [] as any[],
    paymentMethods: [] as any[]
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data: appts, error: apptError } = await supabase
          .from('appointments')
          .select('*, patients(*), procedures(*)');
        
        const { data: records, error: recError } = await supabase
          .from('medical_records')
          .select('*, patients(*), procedures(*)');

        if (apptError || recError) throw new Error('Falha ao carregar dados');

        const totalRevenue = records ? records.reduce((acc, curr) => acc + (parseFloat(curr.products_used?.price) || 0), 0) : 0;
        const totalPatients = appts ? new Set(appts.map(a => a.patient_id)).size : 0;

        const proceduresCount: any = {};
        appts?.forEach(a => {
          const name = a.procedures?.name || 'Consulta/Outros';
          proceduresCount[name] = (proceduresCount[name] || 0) + 1;
        });

        const topProcedures = Object.entries(proceduresCount)
          .map(([name, count]) => ({ name, count }))
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 5);

        const payments: any = { Pix: 0, Dinheiro: 0, Cartão: 0 };
        records?.forEach(r => {
          if (r.payment_method) {
            payments[r.payment_method] = (payments[r.payment_method] || 0) + (parseFloat(r.products_used?.price) || 0);
          }
        });

        setStats({
          totalRevenue,
          totalPatients,
          topProcedures,
          revenueByMonth: [
            { month: 'JAN', value: 1200 },
            { month: 'FEV', value: 2100 },
            { month: 'MAR', value: 1800 },
            { month: 'ABR', value: (totalRevenue/10) || 300 },
            { month: 'MAI', value: 0 },
            { month: 'JUN', value: 0 },
            { month: 'JUL', value: 0 },
            { month: 'AGO', value: 0 },
            { month: 'SET', value: 0 },
            { month: 'OUT', value: 0 },
            { month: 'NOV', value: 0 },
            { month: 'DEZ', value: 0 },
          ],
          paymentMethods: Object.entries(payments).map(([name, value]) => ({ name, value })) as any[]
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-sand rounded-full text-mahogany transition-all border border-sand shadow-sm bg-white"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-display text-5xl text-ebony font-serif">Relatórios & BI</h1>
            <p className="text-mid-gray italic font-serif text-lg">Performance e faturamento da Lumière</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-sand shadow-sm">
          <Calendar size={18} className="text-bronze ml-2" />
          <span className="text-sm font-medium text-ebony pr-4">Visão Geral 2026</span>
        </div>
      </header>

      {/* Cards de Resumo - CONTRASTE TOTAL */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="premium" className="bg-[#1A1A1A] !text-white flex flex-col justify-between p-6 h-36 border-none shadow-xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Faturamento Total</p>
          <div className="flex justify-between items-end">
            <span className="text-2xl font-serif text-white">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalRevenue)}
            </span>
            <TrendingUp size={20} className="text-bronze" />
          </div>
        </Card>
        <Card variant="premium" className="bg-[#C5A059] !text-white flex flex-col justify-between p-6 h-36 border-none shadow-xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white">Total de Pacientes</p>
          <div className="flex justify-between items-end">
            <span className="text-2xl font-serif text-white">{stats.totalPatients}</span>
            <Users size={20} className="text-white/40" />
          </div>
        </Card>
        <Card variant="premium" className="flex flex-col justify-between p-6 h-36 border-sand/40 bg-white shadow-sm hover:shadow-md transition-all">
          <p className="text-[10px] uppercase tracking-[0.2em] text-mid-gray">Conversão Média</p>
          <div className="flex justify-between items-end">
            <span className="text-2xl font-serif text-ebony">84%</span>
            <ArrowUpRight size={20} className="text-green-500" />
          </div>
        </Card>
        <Card variant="premium" className="flex flex-col justify-between p-6 h-36 border-sand/40 bg-white shadow-sm hover:shadow-md transition-all">
          <p className="text-[10px] uppercase tracking-[0.2em] text-mid-gray">Valor Médio/Sessão</p>
          <div className="flex justify-between items-end">
            <span className="text-2xl font-serif text-ebony">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalRevenue / (stats.topProcedures.reduce((a, b)=>a+b.count,0) || 1))}
            </span>
            <ShoppingBag size={20} className="text-bronze" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card variant="premium" className="lg:col-span-2 p-8 bg-white border-sand shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg text-ebony font-serif">Crescimento Mensal</h3>
            <span className="text-[10px] uppercase tracking-widest text-mid-gray">Faturamento em R$</span>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {stats.revenueByMonth.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div 
                  className="w-full bg-bronze/10 rounded-t-lg transition-all group-hover:bg-bronze/30 relative"
                  style={{ height: `${(data.value / 3000) * 100}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-ebony text-white text-[8px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    R$ {data.value}
                  </div>
                </div>
                <span className="text-[9px] font-bold text-mid-gray">{data.month}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-8">
          <Card variant="premium" className="p-6 bg-white border-sand shadow-sm">
            <h3 className="text-lg text-ebony font-serif mb-6 flex items-center gap-2">
              <Syringe size={18} className="text-bronze" /> Mais Realizados
            </h3>
            <div className="space-y-4">
              {stats.topProcedures.map((proc, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-mid-gray">{proc.name}</span>
                    <span className="font-bold text-ebony">{proc.count}x</span>
                  </div>
                  <div className="h-1.5 bg-sand/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-bronze transition-all" 
                      style={{ width: `${(proc.count / stats.topProcedures[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="premium" className="p-6 bg-white border-sand shadow-sm">
            <h3 className="text-lg text-ebony font-serif mb-6">Meios de Pagamento</h3>
            <div className="grid grid-cols-2 gap-4">
              {stats.paymentMethods.map((method, i) => (
                <div key={i} className="p-3 bg-sand/10 rounded-xl border border-sand/50">
                  <p className="text-[8px] uppercase tracking-widest text-mid-gray mb-1">{method.name}</p>
                  <p className="text-sm font-bold text-ebony">R$ {method.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const Syringe = ({ size, className }: any) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/>
  </svg>
);
