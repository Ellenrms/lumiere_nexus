'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Clock, 
  DollarSign, 
  Tag,
  Loader2,
  Settings2
} from 'lucide-react';

export default function ProcedimentosPage() {
  const [procedures, setProcedures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    duration_min: 60,
    price: '',
    category: 'Geral',
    active: true
  });

  const fetchProcedures = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('procedures')
        .select('*')
        .order('name', { ascending: true });

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setProcedures(data || []);
    } catch (error: any) {
      console.error('Erro:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcedures();
  }, [search]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        price: formData.price ? parseFloat(formData.price.toString().replace(',','.')) : 0
      };

      const { error } = await supabase
        .from('procedures')
        .upsert({
          id: editingProcedure?.id,
          ...payload
        });

      if (error) throw error;
      
      setIsModalOpen(false);
      setEditingProcedure(null);
      setFormData({ name: '', duration_min: 60, price: '', category: 'Geral', active: true });
      fetchProcedures();
    } catch (error: any) {
      alert('Erro ao salvar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este procedimento do catálogo?')) return;
    try {
      const { error } = await supabase.from('procedures').delete().eq('id', id);
      if (error) throw error;
      fetchProcedures();
    } catch (error: any) {
      alert('Erro ao excluir: ' + error.message);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-page-header">
        <div>
          <h1 className="text-page-title text-ebony">Catálogo de Procedimentos</h1>
          <p className="text-sm text-mid-gray">Defina os serviços e preços da Lumière</p>
        </div>
        <Button 
          variant="primary" 
          className="flex items-center gap-2 shadow-lg"
          onClick={() => {
            setEditingProcedure(null);
            setFormData({ name: '', duration_min: 60, price: '', category: 'Geral', active: true });
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} />
          <span>Novo Procedimento</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <Card variant="premium" className="p-6">
            <h3 className="text-sm font-medium text-mahogany uppercase tracking-widest mb-4">Busca Rápida</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" size={16} />
              <input 
                type="text" 
                placeholder="Ex: Botox..."
                className="w-full pl-10 pr-4 py-2.5 bg-sand/20 rounded-lg text-sm text-ebony outline-none focus:ring-1 focus:ring-bronze/30"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </Card>

          <Card variant="premium" className="p-6">
            <h3 className="text-sm font-medium text-mahogany uppercase tracking-widest mb-4">Estatísticas</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-mid-gray uppercase tracking-widest">Total Ativos</p>
                <p className="text-2xl font-serif text-ebony">{procedures.filter(p => p.active).length}</p>
              </div>
            </div>
          </Card>
        </aside>

        {/* Categories / Procedures List */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-2 py-20 text-center">
                <Loader2 className="animate-spin mx-auto text-bronze" size={32} />
              </div>
            ) : procedures.length === 0 ? (
              <Card variant="premium" className="col-span-2 p-12 text-center border-dashed border-2 border-sand">
                <p className="text-mid-gray italic font-serif">Nenhum procedimento cadastrado.</p>
              </Card>
            ) : (
              procedures.map((proc) => (
                <Card key={proc.id} className="group hover:border-bronze/30 transition-all cursor-default">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-sand/50 rounded-lg text-bronze">
                      <Settings2 size={20} />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingProcedure(proc);
                          setFormData({
                            name: proc.name,
                            duration_min: proc.duration_min,
                            price: proc.price.toString(),
                            category: proc.category || 'Geral',
                            active: proc.active
                          });
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 hover:bg-sand rounded-lg text-mahogany"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(proc.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium text-ebony mb-1">{proc.name}</h3>
                  <p className="text-xs text-mid-gray uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Tag size={10} className="text-champagne" />
                    {proc.category || 'Geral'}
                  </p>

                  <div className="flex justify-between items-end pt-4 border-t border-sand/50">
                    <div className="flex items-center gap-2 text-xs text-mid-gray">
                      <Clock size={14} className="text-mahogany" />
                      <span>{proc.duration_min} min</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-mid-gray uppercase tracking-widest">Valor</p>
                      <p className="text-xl font-serif text-bronze">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proc.price)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingProcedure ? 'Editar Procedimento' : 'Novo Procedimento'}
      >
        <form onSubmit={handleSave} className="space-y-6">
          <Input 
            label="Nome do Procedimento *"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Ex: Toxina Botulínica (3 áreas)"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Preço em R$ *"
              required
              type="text"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              placeholder="0,00"
            />
            <Input 
              label="Duração (Minutos) *"
              required
              type="number"
              value={formData.duration_min}
              onChange={(e) => setFormData({...formData, duration_min: parseInt(e.target.value) || 0})}
              placeholder="60"
            />
          </div>

          <Input 
            label="Categoria"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            placeholder="Ex: Facial, Corporal"
          />

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} type="button">Cancelar</Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Gravando...' : (editingProcedure ? 'Atualizar catálogo' : 'Adicionar ao catálogo')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
