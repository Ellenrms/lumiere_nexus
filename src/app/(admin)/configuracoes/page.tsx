'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Mail, 
  Lock,
  Loader2,
  Trash2,
  ShieldAlert,
  ChevronLeft
} from 'lucide-react';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: 'nexus@2024',
    full_name: '',
    role: 'RECEPTION'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: formData.role
          }
        }
      });

      if (error) throw error;
      
      alert(`Usuário ${formData.full_name} cadastrado com sucesso! Senha inicial: ${formData.password}`);
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      alert('Erro ao cadastrar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-sand rounded-full text-mahogany transition-all border border-sand shadow-sm bg-white"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-display text-4xl text-ebony">Configurações</h1>
            <p className="text-sm text-mid-gray italic font-serif">Segurança e gestão de equipe da clínica</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)} className="shadow-lg">
          <UserPlus size={18} className="mr-2" /> Nova Colaboradora
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de Usuários */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-mahogany flex items-center gap-2 pl-1">
            <Users size={14} className="text-bronze" /> Equipe Cadastrada
          </h3>
          
          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-bronze" /></div>
          ) : (
            <div className="space-y-4">
                {users.map((user) => (
                    <Card key={user.id} variant="premium" className="flex items-center justify-between p-4 bg-white border-sand shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'ADMIN' ? 'bg-ebony text-bronze' : 'bg-sand text-mahogany'}`}>
                                {user.role === 'ADMIN' ? <ShieldCheck size={20} /> : <Users size={20} />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-ebony">{user.full_name}</p>
                                <p className="text-[10px] uppercase font-bold tracking-widest text-bronze/60">{user.role}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {user.role !== 'ADMIN' && (
                                <button className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Desativar">
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
          )}
        </div>

        {/* Info de Segurança */}
        <div className="space-y-6">
            <Card variant="premium" className="p-6 bg-bronze/5 border-bronze/20 shadow-inner">
                <div className="flex items-center gap-3 mb-4 text-bronze">
                    <ShieldAlert size={20} />
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Níveis de Acesso</h4>
                </div>
                <div className="space-y-4 text-xs text-mahogany/80 leading-relaxed">
                    <p><strong>ADMIN:</strong> Acesso total às finanças, prontuários e configurações do sistema.</p>
                    <p><strong>RECEPTION:</strong> Pode agendar sessões e cadastrar pacientes. Não tem acesso a dados financeiros ou notas médicas sigilosas.</p>
                </div>
            </Card>
            
            <Card variant="premium" className="p-6 border-sand bg-white">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-ebony">Suas Credenciais</h4>
                <div className="space-y-3">
                    <Button variant="outline" className="w-full text-[10px] h-10 border-sand">Alterar Senha</Button>
                    <Button variant="ghost" className="w-full text-[10px] h-10 text-red-500 hover:bg-red-50">Sair com Segurança</Button>
                </div>
            </Card>
        </div>
      </div>

      {/* Modal Novo Usuário */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Cadastrar Nova Colaboradora"
      >
        <form onSubmit={handleAddUser} className="space-y-6">
          <div className="space-y-4">
            <Input 
                label="Nome Completo"
                placeholder="Ex: Rafaela Bicego"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
            <Input 
                label="E-mail"
                type="email"
                placeholder="exemplo@clinica.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-ebony uppercase tracking-[0.15em] pl-1">Cargo / Role</label>
                <select 
                    className="w-full px-4 py-3 rounded-[12px] bg-white border border-sand text-ebony outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/10 text-sm font-sans"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                    <option value="RECEPTION">Recepção (Acesso Limitado)</option>
                    <option value="ADMIN">Administrador (Dra. Maria)</option>
                </select>
            </div>
            <div className="p-4 bg-sand/20 rounded-xl flex items-start gap-3 border border-sand shadow-inner">
                <Lock size={16} className="text-bronze shrink-0 mt-0.5" />
                <p className="text-[10px] text-ebony/70 leading-relaxed font-sans">
                    <strong className="text-ebony">Atenção:</strong> A senha provisória padrão é <code className="bg-white px-1 py-0.5 rounded border border-sand font-bold text-ebony">nexus@2024</code>. Oriente a colaboradora a trocá-la no primeiro acesso.
                </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-sand/30">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={saving}>
                {saving ? 'Gravando...' : 'Finalizar Cadastro'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
