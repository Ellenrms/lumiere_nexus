'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { 
  Loader2, 
  Stethoscope, 
  DollarSign, 
  FileText, 
  Camera, 
  Trash2,
  Plus
} from 'lucide-react';

interface MedicalRecordFormProps {
  patientId: string;
  patientName: string;
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

export const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({
  patientId,
  patientName,
  onSuccess,
  onCancel,
  initialData
}) => {
  const [loading, setLoading] = useState(false);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    procedure_id: initialData?.procedure_id || '',
    price_charged: initialData?.products_used?.price || '',
    chief_complaint: initialData?.chief_complaint || '',
    clinical_notes: initialData?.notes_rich?.evolution || '',
    status: initialData?.status || 'finalizado'
  });

  const [photos, setPhotos] = useState<any[]>(
    initialData?.record_photos?.map((p: any) => ({ url: p.storage_path, path: p.storage_path })) || []
  );

  useEffect(() => {
    const fetchProcedures = async () => {
      const { data } = await supabase
        .from('procedures')
        .select('*')
        .eq('active', true)
        .order('name');
      setProcedures(data || []);
    };
    fetchProcedures();
  }, []);

  const handleProcedureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const selected = procedures.find(p => p.id === id);
    setFormData(prev => ({
      ...prev,
      procedure_id: id,
      price_charged: selected ? selected.price.toString() : ''
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      
      setUploading(true);
      const files = Array.from(e.target.files);
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `records/${patientId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('patient-photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('patient-photos')
          .getPublicUrl(filePath);

        setPhotos(prev => [...prev, { url: data.publicUrl, path: filePath }]);
      }
    } catch (error: any) {
      alert('Erro no upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.procedure_id) return alert('Selecione um procedimento.');

    setLoading(true);
    try {
      // 1. Criar ou Atualizar Atendimento (Medical Record)
      const { data: record, error: recordError } = await supabase
        .from('medical_records')
        .upsert({
          id: initialData?.id,
          patient_id: patientId,
          procedure_id: formData.procedure_id,
          chief_complaint: formData.chief_complaint,
          notes_rich: { evolution: formData.clinical_notes },
          products_used: { price: formData.price_charged },
          status: formData.status
        })
        .select()
        .single();

      if (recordError) throw recordError;

      // 2. Salvar Fotos vinculadas (se houver)
      if (photos.length > 0) {
        const photosPayload = photos.map(p => ({
          record_id: record.id,
          patient_id: patientId,
          storage_path: p.url,
          category: 'atendimento'
        }));

        const { error: photosError } = await supabase
          .from('record_photos')
          .insert(photosPayload);
        
        if (photosError) throw photosError;
      }

      onSuccess();
    } catch (error: any) {
      alert('Erro ao salvar atendimento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-sand/20 p-4 rounded-xl border border-sand/50 mb-6">
        <p className="text-xs text-mahogany uppercase tracking-widest mb-1">Paciente em Atendimento</p>
        <p className="text-xl font-serif text-ebony">{patientName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Procedimento e Valor */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-mahogany uppercase tracking-wider pl-1 flex items-center gap-2">
              <Stethoscope size={14} className="text-bronze" /> 
              Procedimento Realizado *
            </label>
            <select
              required
              className="w-full px-4 py-3 rounded-[12px] bg-white border border-sand text-ebony outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/10 text-sm"
              value={formData.procedure_id}
              onChange={handleProcedureChange}
            >
              <option value="">Selecione um serviço do catálogo...</option>
              {procedures.map(p => (
                <option key={p.id} value={p.id}>{p.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}</option>
              ))}
            </select>
          </div>

          <Input 
            label="Valor do Atendimento (R$)"
            value={formData.price_charged}
            onChange={(e) => setFormData({...formData, price_charged: e.target.value})}
            placeholder="0,00"
          />
        </div>

        {/* Queixa Principal */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-mahogany uppercase tracking-wider pl-1 flex items-center gap-2">
            <FileText size={14} className="text-bronze" />
            Queixa Principal / Motivo
          </label>
          <textarea
            className="w-full px-4 py-3 rounded-[12px] bg-white border border-sand text-ebony placeholder:text-mid-gray outline-none transition-all focus:border-champagne focus:ring-2 focus:ring-champagne/10 text-sm"
            rows={4}
            value={formData.chief_complaint}
            onChange={(e) => setFormData({...formData, chief_complaint: e.target.value})}
            placeholder="O que a paciente deseja tratar hoje?"
          />
        </div>
      </div>

      {/* Evolução Clínica */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-mahogany uppercase tracking-wider pl-1 font-serif italic text-bronze">
          Evolução Clínica do Dia
        </label>
        <textarea
          className="w-full px-4 py-3 rounded-[12px] bg-white border border-sand text-ebony placeholder:text-mid-gray outline-none transition-all focus:border-champagne focus:ring-2 focus:ring-champagne/10 text-sm"
          rows={6}
          value={formData.clinical_notes}
          onChange={(e) => setFormData({...formData, clinical_notes: e.target.value})}
          placeholder="Descreva o atendimento, técnicas usadas, intercorrências..."
        />
      </div>

      {/* Galeria de Fotos */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-mahogany uppercase tracking-wider pl-1 flex items-center gap-2">
          <Camera size={14} className="text-bronze" /> 
          Registros Fotográficos
        </label>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {photos.map((photo, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-sand shadow-sm group">
              <img src={photo.url} className="object-cover w-full h-full" alt="Session" />
              <button 
                type="button"
                onClick={() => setPhotos(prev => prev.filter((_, i) => i !== idx))}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          
          <label className="aspect-square rounded-lg border-2 border-dashed border-sand flex flex-col items-center justify-center cursor-pointer hover:bg-sand/20 transition-all text-mahogany/40">
            {uploading ? <Loader2 className="animate-spin" /> : <Plus size={24} />}
            <span className="text-[10px] uppercase font-medium mt-2">Adicionar Foto</span>
            <input type="file" multiple className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-8 border-t border-sand">
        <Button onClick={onCancel} variant="ghost" type="button" disabled={loading}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit" disabled={loading || uploading}>
          {loading ? 'Finalizando...' : 'Concluir Atendimento'}
        </Button>
      </div>
    </form>
  );
};

const X = ({ size }: { size: number }) => <Trash2 size={size} />;
