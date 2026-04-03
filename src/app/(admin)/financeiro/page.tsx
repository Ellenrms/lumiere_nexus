'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { 
  DollarSign, 
  Search, 
  Calendar, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  CheckCircle2, 
  Clock,
  Loader2,
  TrendingUp,
  Receipt,
  ChevronLeft
} from 'lucide-react';

export default function FinanceiroPage() {
  const router = useRouter();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          *,
          patients (full_name, id),
          procedures (name, id)
        `)
        .gte('created_at', `${dateFilter}T00:00:00`)
        .lte('created_at', `${dateFilter}T23:59:59`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      console.error('Erro:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateFilter]);

  const handleUpdatePayment = async (id: string, status: string, method?: string) => {
    try {
      setUpdatingId(id);
      const { error } = await supabase
        .from('medical_records')
        .update({ 
          payment_status: status,
          payment_method: method || null
        })
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error: any) {
      alert('Erro ao atualizar pagamento: ' + error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const totals = records.reduce((acc: any, current: any) => {
    const valet = parseFloat(current.products_used?.price || 0);
    if (current.payment_status === 'pago') {
      acc.paid += valet;
    } else {
      acc.pending += valet;
    }
    return acc;
  }, { paid: 0, pending: 0 });

  const averageTicket = records.length > 0 ? totals.paid / records.filter((r: any) => r.payment_status === 'pago').length || 0 : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header com Filtro de Data e Voltar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-3 hover:bg-sand rounded-xl text-mahogany transition-all border border-sand shadow-sm bg-white"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-display text-4xl text-ebony font-serif">Fluxo Financeiro</h1>
            <p className="text-sm text-mid-gray italic font-serif">Inteligência de faturamento e recebimentos da Lumière</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-sand">
          <Calendar size={18} className="text-bronze ml-2" />
          <input 
            type="date" 
            className="border-none outline-none text-sm text-ebony font-medium"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Cards de Resumo Econômico - VISIBILIDADE SaaS MÁXIMA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Faturamento Real (Pago) */}
        <div className="bg-[#1A1A1A] rounded-[24px] p-6 flex flex-col justify-between h-40 shadow-2xl border-b-4 border-bronze group hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-white/10 rounded-xl text-bronze"><TrendingUp size={24} /></div>
            <div className="text-right">
                <span className="block text-[10px] font-bold text-white uppercase tracking-[0.2em]">Faturamento Real</span>
                <span className="text-[9px] text-bronze font-bold uppercase tracking-widest mt-1 block">Total Recebido</span>
            </div>
          </div>
          <p className="text-3xl font-serif text-white">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.paid)}
          </p>
        </div>

        {/* Card 2: Previsão de Receita (Pendentes) */}
        <div className="bg-[#C5A059] rounded-[24px] p-6 flex flex-col justify-between h-40 shadow-2xl border-b-4 border-white/40 group hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-white/20 rounded-xl text-white"><Clock size={24} /></div>
            <div className="text-right">
                <span className="block text-[10px] font-bold text-white uppercase tracking-[0.2em]">Previsão p/ Receber</span>
                <span className="text-[9px] text-white/60 font-medium uppercase tracking-widest mt-1 block">Aguardando Pagamento</span>
            </div>
          </div>
          <p className="text-3xl font-serif text-white">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.pending)}
          </p>
        </div>

        {/* Card 3: Ticket Médio do Dia */}
        <div className="bg-white border-2 border-sand rounded-[24px] p-6 flex flex-col justify-between h-40 shadow-xl border-b-4 border-sand/50 group hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-sand rounded-xl text-mahogany"><DollarSign size={24} /></div>
            <div className="text-right">
                <span className="block text-[10px] font-bold text-ebony uppercase tracking-[0.2em]">Ticket Médio</span>
                <span className="text-[9px] text-mahogany/60 font-bold uppercase tracking-widest mt-1 block">Valor por Sessão</span>
            </div>
          </div>
          <p className="text-3xl font-serif text-ebony">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(averageTicket)}
          </p>
        </div>

        {/* Card 4: Volume de Atendimentos */}
        <div className="bg-white border-2 border-sand rounded-[24px] p-6 flex flex-col justify-between h-40 shadow-xl border-b-4 border-sand/50 group hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-sand rounded-xl text-mahogany"><Receipt size={24} /></div>
            <div className="text-right">
                <span className="block text-[10px] font-bold text-ebony uppercase tracking-[0.2em]">Atendimentos</span>
                <span className="text-[9px] text-mahogany/60 font-bold uppercase tracking-widest mt-1 block">No Período</span>
            </div>
          </div>
          <p className="text-4xl font-serif text-ebony">{records.length}</p>
        </div>
      </div>

      {/* Tabela de Lançamentos */}
      <div className="bg-white rounded-[24px] border border-sand shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1A1A1A] text-white">
              <tr className="text-left text-[10px] uppercase tracking-[0.2em] font-bold">
                <th className="px-8 py-6">Paciente / Atendimento</th>
                <th className="px-6 py-6 border-l border-white/10">Procedimento</th>
                <th className="px-6 py-6 border-l border-white/10">Valor</th>
                <th className="px-6 py-6 border-l border-white/10">Status</th>
                <th className="px-8 py-6 text-right border-l border-white/10">Ação de Baixa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-bronze" size={32} />
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center italic text-mid-gray font-serif">
                    Nenhum atendimento realizado nesta data.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="group hover:bg-sand/10 transition-all">
                    <td className="px-8 py-5">
                      <div>
                        <p className="text-sm font-bold text-ebony tracking-tight">{record.patients?.full_name}</p>
                        <p className="text-[10px] text-mid-gray uppercase tracking-widest font-medium">
                          {new Date(record.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs text-mahogany uppercase tracking-wider font-bold">
                      {record.procedures?.name || 'Não especificado'}
                    </td>
                    <td className="px-6 py-5 text-sm font-serif text-ebony font-bold">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(record.products_used?.price || 0)}
                    </td>
                    <td className="px-6 py-5">
                      {record.payment_status === 'pago' ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[9px] uppercase font-bold tracking-widest border border-green-200">
                          <CheckCircle2 size={12} /> {record.payment_method}
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[9px] uppercase font-bold tracking-widest border border-amber-200">
                          <Clock size={12} /> Pendente
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      {record.payment_status !== 'pago' ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleUpdatePayment(record.id, 'pago', 'Pix')}
                            className="p-2 hover:bg-bronze hover:text-white rounded-lg text-bronze flex flex-col items-center gap-1 border border-bronze/20 transition-all"
                            disabled={updatingId === record.id}
                          >
                            <Smartphone size={16} />
                            <span className="text-[7px] font-bold">PIX</span>
                          </button>
                          <button 
                            onClick={() => handleUpdatePayment(record.id, 'pago', 'Cartão')}
                            className="p-2 hover:bg-bronze hover:text-white rounded-lg text-bronze flex flex-col items-center gap-1 border border-bronze/20 transition-all"
                            disabled={updatingId === record.id}
                          >
                            <CreditCard size={16} />
                            <span className="text-[7px] font-bold">CARD</span>
                          </button>
                          <button 
                            onClick={() => handleUpdatePayment(record.id, 'pago', 'Dinheiro')}
                            className="p-2 hover:bg-bronze hover:text-white rounded-lg text-bronze flex flex-col items-center gap-1 border border-bronze/20 transition-all"
                            disabled={updatingId === record.id}
                          >
                            <Banknote size={16} />
                            <span className="text-[7px] font-bold">CASH</span>
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleUpdatePayment(record.id, 'pendente')}
                          className="text-[10px] font-bold uppercase tracking-widest text-mid-gray hover:text-red-500 transition-colors"
                          disabled={updatingId === record.id}
                        >
                          Estornar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
