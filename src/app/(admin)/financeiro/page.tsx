'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
  Receipt
} from 'lucide-react';

export default function FinanceiroPage() {
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

  const totals = records.reduce((acc, current) => {
    const valet = parseFloat(current.products_used?.price || 0);
    if (current.payment_status === 'pago') {
      acc.paid += valet;
    } else {
      acc.pending += valet;
    }
    return acc;
  }, { paid: 0, pending: 0 });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header com Filtro de Data */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-page-header">
        <div>
          <h1 className="text-page-title text-ebony">Fluxo Financeiro</h1>
          <p className="text-sm text-mid-gray italic font-serif">Acompanhamento de atendimentos e recebimentos</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-sand">
          <Calendar size={18} className="text-bronze ml-2" />
          <input 
            type="date" 
            className="border-none outline-none text-sm text-ebony font-medium"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="premium" className="bg-bronze text-white p-6 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] opacity-80 mb-1">Total Recebido</p>
              <p className="text-3xl font-serif">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.paid)}</p>
            </div>
            <TrendingUp size={24} className="opacity-50" />
          </div>
        </Card>

        <Card variant="premium" className="p-6 border-mahogany/20">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-mid-gray mb-1">A Receber (Pendentes)</p>
              <p className="text-3xl font-serif text-mahogany">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.pending)}</p>
            </div>
            <Clock size={24} className="text-mahogany/30" />
          </div>
        </Card>

        <Card variant="premium" className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-mid-gray mb-1">Atendimentos Hoje</p>
              <p className="text-3xl font-serif text-ebony">{records.length}</p>
            </div>
            <Receipt size={24} className="text-sand" />
          </div>
        </Card>
      </div>

      {/* Tabela de Lançamentos */}
      <Card variant="premium" className="overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sand/30 border-b border-sand">
              <tr className="text-left text-[10px] uppercase tracking-widest text-mahogany/70">
                <th className="px-8 py-5">Paciente / Atendimento</th>
                <th className="px-6 py-5">Procedimento</th>
                <th className="px-6 py-5">Valor</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-8 py-5 text-right">Baixa de Pagamento</th>
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
                        <p className="text-sm font-medium text-ebony">{record.patients?.full_name}</p>
                        <p className="text-[10px] text-mid-gray uppercase tracking-widest">
                          {new Date(record.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs text-mahogany uppercase tracking-wider font-medium">
                      {record.procedures?.name || 'Não especificado'}
                    </td>
                    <td className="px-6 py-5 text-sm font-serif text-ebony">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(record.products_used?.price || 0)}
                    </td>
                    <td className="px-6 py-5">
                      {record.payment_status === 'pago' ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] uppercase font-bold tracking-widest border border-green-100">
                          <CheckCircle2 size={12} /> Pago via {record.payment_method}
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] uppercase font-bold tracking-widest border border-amber-100">
                          <Clock size={12} /> Pendente
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      {record.payment_status !== 'pago' ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleUpdatePayment(record.id, 'pago', 'Pix')}
                            className="p-2 hover:bg-sand rounded-lg text-mahogany flex flex-col items-center gap-1 border border-sand/50"
                            title="Pagar via Pix"
                            disabled={updatingId === record.id}
                          >
                            <Smartphone size={16} />
                            <span className="text-[8px] uppercase">Pix</span>
                          </button>
                          <button 
                            onClick={() => handleUpdatePayment(record.id, 'pago', 'Cartão')}
                            className="p-2 hover:bg-sand rounded-lg text-mahogany flex flex-col items-center gap-1 border border-sand/50"
                            title="Pagar via Cartão"
                            disabled={updatingId === record.id}
                          >
                            <CreditCard size={16} />
                            <span className="text-[8px] uppercase">Cartão</span>
                          </button>
                          <button 
                            onClick={() => handleUpdatePayment(record.id, 'pago', 'Dinheiro')}
                            className="p-2 hover:bg-sand rounded-lg text-mahogany flex flex-col items-center gap-1 border border-sand/50"
                            title="Pagar via Dinheiro"
                            disabled={updatingId === record.id}
                          >
                            <Banknote size={16} />
                            <span className="text-[8px] uppercase">Cash</span>
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleUpdatePayment(record.id, 'pendente')}
                          className="text-xs text-mid-gray hover:text-red-500 underline underline-offset-4"
                          disabled={updatingId === record.id}
                        >
                          Estornar Pagamento
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
