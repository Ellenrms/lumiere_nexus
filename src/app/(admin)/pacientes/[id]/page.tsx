'use client';

import React, { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { MedicalRecordForm } from '@/components/records/MedicalRecordForm';
import { PhotoComparator } from '@/components/clinical/PhotoComparator';
import { 
  Calendar, 
  Clock, 
  FileText, 
  ChevronLeft, 
  Plus, 
  Phone, 
  Mail, 
  Fingerprint,
  AlertCircle,
  History,
  Edit2,
  Image as ImageIcon,
  Loader2,
  Columns
} from 'lucide-react';
import Link from 'next/link';

export default function PacientePerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [patient, setPatient] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const allPhotos = records.reduce((acc: any[], current: any) => {
    return [...acc, ...(current.record_photos || [])];
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Buscar dados da paciente
      const { data: pData, error: pError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (pError) throw pError;
      setPatient(pData);

      // 2. Buscar atendimentos e fotos vinculadas
      const { data: rData, error: rError } = await supabase
        .from('medical_records')
        .select(`
          *,
          record_photos (*)
        `)
        .eq('patient_id', id)
        .order('created_at', { ascending: false });

      if (rError) throw rError;
      setRecords(rData || []);

    } catch (error: any) {
      console.error('Erro:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-bronze" size={40} />
      </div>
    );
  }

  if (!patient) return <div className="p-20 text-center">Paciente não encontrada.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Voltar */}
      <Link 
        href="/pacientes" 
        className="inline-flex items-center gap-2 text-sm text-mahogany/60 hover:text-bronze transition-colors"
      >
        <ChevronLeft size={16} />
        Voltar para a listagem
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lado Esquerdo: Resumo do Prontuário */}
        <aside className="lg:col-span-1 space-y-6">
          <Card variant="premium" className="text-center p-8">
            <Avatar src={patient.photo_url} name={patient.full_name} size="xl" className="mx-auto mb-4 border-2 border-sand" />
            <h1 className="text-2xl font-serif text-ebony mb-1">{patient.full_name}</h1>
            <p className="text-xs text-mid-gray uppercase tracking-widest mb-6">Prontuário #{patient.id.slice(0, 8)}</p>
            
            <div className="flex flex-col gap-3 text-left border-t border-sand pt-6">
              <div className="flex items-center gap-3 text-sm text-mahogany/80">
                <Fingerprint size={16} className="text-bronze" />
                <span>{patient.cpf || 'CPF não informado'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-mahogany/80">
                <Phone size={16} className="text-bronze" />
                <span>{patient.phone || 'Tel não informado'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-mahogany/80">
                <Calendar size={16} className="text-bronze" />
                <span>{patient.birth_date ? new Date(patient.birth_date).toLocaleDateString() : 'DN não informada'}</span>
              </div>
            </div>
          </Card>

          <Card variant="premium" className="p-6 bg-mahogany/5 border-mahogany/10">
            <h3 className="flex items-center gap-2 text-sm font-medium text-mahogany uppercase tracking-widest mb-4">
              <AlertCircle size={16} /> Alerta Clínico
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-mid-gray uppercase tracking-widest mb-1">Alergias</p>
                <p className="text-sm text-ebony font-medium">{patient.allergies || 'Sem alergias registradas'}</p>
              </div>
              <div>
                <p className="text-[10px] text-mid-gray uppercase tracking-widest mb-1">Cirurgias Prévias</p>
                <p className="text-sm text-ebony font-medium">{patient.surgeries || 'Nenhuma registrada'}</p>
              </div>
            </div>
          </Card>
        </aside>

        {/* Lado Direito: Timeline de Atendimentos */}
        <main className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-display text-2xl text-ebony flex items-center gap-3">
              <History className="text-bronze" size={24} />
              Linha do Tempo
            </h2>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 border-bronze/30 text-bronze hover:bg-bronze hover:text-white transition-all shadow-sm"
                onClick={() => setIsComparatorOpen(true)}
                disabled={allPhotos.length < 2}
              >
                <Columns size={16} />
                Antes e Depois
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                className="flex items-center gap-2 shadow-md"
                onClick={() => setIsRecordModalOpen(true)}
              >
                <Plus size={16} />
                Novo Atendimento
              </Button>
            </div>
          </div>

          {records.length === 0 ? (
            <Card className="p-20 text-center border-dashed border-2 border-sand">
              <FileText size={40} className="mx-auto text-sand mb-4" />
              <p className="text-mid-gray italic font-serif text-lg">Inicie o acompanhamento clínico desta paciente.</p>
            </Card>
          ) : (
            <div className="relative space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-sand/60">
              {records.map((record, index) => (
                <div key={record.id} className="relative pl-12 animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                  {/* Dot */}
                  <div className="absolute left-0 top-1.5 w-[40px] h-[40px] rounded-full bg-white border-2 border-bronze flex items-center justify-center z-10 shadow-sm">
                    <Clock size={16} className="text-bronze" />
                  </div>

                  <Card variant="premium" className="hover:border-bronze/20 transition-all">
                    <header className="flex justify-between items-start mb-4 border-b border-sand/50 pb-3">
                      <div>
                        <p className="text-lg font-serif text-ebony">Atendimento Clínico</p>
                        <p className="text-[10px] uppercase tracking-widest text-mahogany/60">
                          {new Date(record.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => {
                            setEditingRecord(record);
                            setIsRecordModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-sand rounded-lg text-bronze transition-colors"
                          title="Editar Evolução"
                        >
                          <Edit2 size={14} />
                        </button>
                        <span className="px-3 py-1 bg-sand/30 rounded-full text-[10px] uppercase font-bold text-mahogany tracking-widest">
                          {record.status}
                        </span>
                      </div>
                    </header>

                    <div className="space-y-4">
                      {record.chief_complaint && (
                        <div className="bg-sand/10 p-3 rounded-lg border-l-2 border-bronze">
                          <p className="text-[10px] uppercase tracking-widest text-mahogany/60 mb-1">Queixa Principal</p>
                          <p className="text-sm text-ebony leading-relaxed">{record.chief_complaint}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-mahogany/60 mb-2">Evolução e Notas</p>
                        <p className="text-sm text-ebony/80 leading-relaxed whitespace-pre-wrap">
                          {record.notes_rich?.evolution || 'Sem notas registradas.'}
                        </p>
                      </div>

                      {/* Fotos do Dia */}
                      {record.record_photos && record.record_photos.length > 0 && (
                        <div className="pt-4 mt-4 border-t border-sand/30">
                          <p className="text-[10px] uppercase tracking-widest text-mahogany/60 mb-3 flex items-center gap-2">
                            <ImageIcon size={12} /> Galeria da Sessão
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {record.record_photos.map((photo: any) => (
                              <div key={photo.id} className="w-24 h-24 rounded-lg overflow-hidden border border-sand hover:scale-105 transition-transform cursor-zoom-in">
                                <img src={photo.storage_path} className="w-full h-full object-cover" alt="Sessão" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal de Novo Atendimento */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setEditingRecord(null);
        }}
        title={editingRecord ? "Editar Atendimento" : "Novo Atendimento"}
      >
        <MedicalRecordForm 
          patientId={patient.id}
          patientName={patient.full_name}
          initialData={editingRecord}
          onCancel={() => {
            setIsRecordModalOpen(false);
            setEditingRecord(null);
          }}
          onSuccess={() => {
            setIsRecordModalOpen(false);
            setEditingRecord(null);
            fetchData();
          }}
        />
      </Modal>

      {/* Ferramenta de Comparativo Antes e Depois */}
      <PhotoComparator 
        isOpen={isComparatorOpen}
        onClose={() => setIsComparatorOpen(false)}
        availablePhotos={allPhotos}
      />
    </div>
  );
}
