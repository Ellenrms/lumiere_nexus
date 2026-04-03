'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Mail, 
  Lock,
  Loader2,
  Trash2,
  ShieldAlert
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export default function ConfiguracoesPage() {
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
      // Nota: No Supabase Client-side, signUp desloga o admin.
      // Em uma aplicação real, usamos Server Actions com Service Role.
      // Para este MVP, vamos criar apenas o perfil ou usar o Invite se disponível.
      
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-display text-4xl text-ebony font-serif">Configurações</h1>
          <p className="text-mid-gray italic font-serif text-lg">Segurança e gestão de equipe da clínica</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={18} className="mr-2" /> Nova Colaboradora
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de Usuários */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-mahogany flex items-center gap-2">
            <Users size={16} /> Equipe Cadastrada
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
            <Card variant="premium" className="p-6 bg-bronze/5 border-bronze/20">
                <div className="flex items-center gap-3 mb-4 text-bronze">
                    <ShieldAlert size={20} />
                    <h4 className="text-xs font-bold uppercase tracking-widest">Níveis de Acesso</h4>
                </div>
                <div className="space-y-4 text-xs text-mid-gray leading-relaxed">
                    <p><strong>ADMIN:</strong> Acesso total às finanças, prontuários e configurações.</p>
                    <p><strong>RECEPTION:</strong> Pode agendar e cadastrar pacientes. Não vê dados financeiros ou notas médicas.</p>
                </div>
            </Card>
            
            <Card variant="premium" className="p-6 border-sand">
                <h4 className="text-xs font-bold uppercase mb-4 text-ebony">Suas Credenciais</h4>
                <div className="space-y-3">
                    <Button variant="outline" className="w-full text-[10px] h-9">Mudar Minha Senha</Button>
                    <Button variant="ghost" className="w-full text-[10px] h-9 text-red-500">Excluir Minha Conta</Button>
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
                <label className="text-sm font-medium text-mahogany uppercase tracking-wider pl-1">Cargo / Role</label>
                <select 
                    className="w-full px-4 py-3 rounded-[12px] bg-white border border-sand text-ebony outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/10 text-sm"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                    <option value="RECEPTION">Recepção (Acesso Limitado)</option>
                    <option value="ADMIN">Administrador (Dra. Maria)</option>
                </select>
            </div>
            <div className="p-3 bg-sand/20 rounded-xl flex items-start gap-3 border border-sand">
                <Lock size={16} className="text-bronze shrink-0 mt-0.5" />
                <p className="text-[10px] text-mahogany/70">
                    <strong>Senha Provisória:</strong> nexus@2024<br/>
                    A nova colaboradora poderá mudar a senha após o primeiro acesso.
                </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={saving}>
                {saving ? 'Cadastrando' : 'Finalizar Cadastro'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
