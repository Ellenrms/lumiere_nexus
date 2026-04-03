'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { PatientForm } from '@/components/patients/PatientForm';
import { MedicalRecordForm } from '@/components/records/MedicalRecordForm';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  UserPlus, 
  Edit2, 
  Trash2,
  Phone,
  Mail,
  Loader2,
  ChevronLeft
} from 'lucide-react';

export default function PacientesPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('patients')
        .select('*')
        .order('full_name', { ascending: true });

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,cpf.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar pacientes:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchPatients, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta paciente? Esta ação é irreversível.')) return;
    
    try {
      const { error } = await supabase.from('patients').delete().eq('id', id);
      if (error) throw error;
      fetchPatients();
    } catch (error: any) {
      alert('Erro ao excluir: ' + error.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header com Voltar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-sand rounded-full text-mahogany transition-all border border-sand shadow-sm bg-white"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-display text-4xl text-ebony">Gestão de Pacientes</h1>
            <p className="text-sm text-mid-gray italic font-serif">Base de prontuários e contatos da clínica</p>
          </div>
        </div>
        <Button 
          variant="primary" 
          className="flex items-center gap-2 shadow-lg"
          onClick={() => {
            setEditingPatient(null);
            setIsModalOpen(true);
          }}
        >
          <UserPlus size={18} />
          <span>Nova Paciente</span>
        </Button>
      </div>

      {/* Filters Card */}
      <Card variant="premium" className="flex items-center gap-4 px-6 py-4 border-none shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-mid-gray pointer-events-none" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou CPF..."
            className="w-full pl-12 pr-4 py-3 bg-chrome/50 rounded-xl text-ebony outline-none focus:ring-2 focus:ring-champagne/10 transition-all font-sans"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      {/* Listing */}
      <Card variant="premium" className="overflow-hidden border-none shadow-sm !p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sand/30 border-b border-sand">
              <tr className="text-left text-[10px] uppercase tracking-widest text-mahogany/70">
                <th className="px-8 py-5">Paciente</th>
                <th className="px-6 py-5">CPF</th>
                <th className="px-6 py-5">Contatos</th>
                <th className="px-6 py-5">Última Atualização</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-bronze" size={32} />
                    <p className="mt-4 text-mid-gray text-sm italic font-serif">Aguardando dados premium...</p>
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="max-w-xs mx-auto space-y-4">
                      <p className="text-mid-gray font-serif italic text-lg">Sem registros encontrados.</p>
                      <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
                        Adicionar primeira paciente
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id} className="group hover:bg-sand/10 transition-all">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <Avatar src={patient.photo_url} name={patient.full_name} size="md" />
                        <div>
                          <p className="text-sm font-medium text-ebony group-hover:text-bronze transition-colors">{patient.full_name}</p>
                          <p className="text-[10px] text-mid-gray uppercase tracking-widest font-sans">{patient.id.slice(0,8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-mahogany/80 font-sans">
                      {patient.cpf || '-'}
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      {patient.phone ? (
                        <div className="flex items-center gap-2 text-xs text-mid-gray">
                          <Phone size={12} className="text-champagne" />
                          <span>{patient.phone}</span>
                        </div>
                      ) : null}
                      {patient.email ? (
                        <div className="flex items-center gap-2 text-xs text-mid-gray">
                          <Mail size={12} className="text-champagne" />
                          <span>{patient.email}</span>
                        </div>
                      ) : null}
                      {!patient.phone && !patient.email && <span className="text-xs text-mid-gray italic">Sem contato</span>}
                    </td>
                    <td className="px-6 py-4 text-xs text-mid-gray italic">
                      {new Date(patient.updated_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/pacientes/${patient.id}`}
                          className="p-2 hover:bg-champagne/10 rounded-xl text-bronze transition-colors"
                          title="Ver Perfil Completo"
                        >
                          <ChevronRight size={18} />
                        </Link>
                        <button 
                          onClick={() => {
                            setSelectedPatient(patient);
                            setIsRecordModalOpen(true);
                          }}
                          className="p-2 hover:bg-bronze/10 rounded-xl text-bronze transition-colors flex items-center gap-1 text-xs font-medium"
                          title="Novo Atendimento"
                        >
                          <Plus size={16} />
                          <span className="hidden md:inline">Atendimento</span>
                        </button>
                        <button 
                          onClick={() => {
                            setEditingPatient(patient);
                            setIsModalOpen(true);
                          }}
                          className="p-2 hover:bg-sand rounded-xl text-mahogany transition-colors"
                          title="Ver Prontuário"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(patient.id)}
                          className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal / Form */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingPatient ? 'Prontuário da Paciente' : 'Criar Novo Registro'}
      >
        <PatientForm 
          initialData={editingPatient}
          onCancel={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchPatients();
          }}
        />
      </Modal>

      {/* Modal de Novo Atendimento */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Novo Atendimento"
      >
        {selectedPatient && (
          <MedicalRecordForm 
            patientId={selectedPatient.id}
            patientName={selectedPatient.full_name}
            onCancel={() => setIsRecordModalOpen(false)}
            onSuccess={() => {
              setIsRecordModalOpen(false);
              fetchPatients();
            }}
          />
        )}
      </Modal>

      {/* Decorative details */}
      <div className="flex items-center gap-3 text-[10px] text-mahogany/40 uppercase tracking-[0.2em] pt-4 font-serif italic">
        <span className="w-8 h-px bg-sand" />
        Lumière Advanced Aesthetic System
      </div>
    </div>
  );
}
