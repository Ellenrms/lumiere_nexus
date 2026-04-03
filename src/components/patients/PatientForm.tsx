'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { maskCPF, maskPhone } from '@/lib/masks';
import { Camera, X, Loader2 } from 'lucide-react';

interface PatientFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

export const PatientForm: React.FC<PatientFormProps> = ({ 
  onSuccess, 
  onCancel, 
  initialData 
}) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || '',
    cpf: initialData?.cpf || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    birth_date: initialData?.birth_date || '',
    notes: initialData?.notes || '',
    photo_url: initialData?.photo_url || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let maskedValue = value;
    if (name === 'cpf') maskedValue = maskCPF(value);
    if (name === 'phone') maskedValue = maskPhone(value);

    setFormData(prev => ({ ...prev, [name]: maskedValue }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      
      setUploading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('patient-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get Public URL (or Signed URL if private)
      const { data } = supabase.storage
        .from('patient-photos')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, photo_url: data.publicUrl }));
    } catch (error: any) {
      alert('Erro ao subir foto: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sanitização: enviar null em vez de string vazia para campos de tipo específico
      const patientData = {
        ...formData,
        birth_date: formData.birth_date || null,
        cpf: formData.cpf || null,
        phone: formData.phone || null,
        email: formData.email || null,
        updated_at: new Date()
      };

      const { error } = await supabase
        .from('patients')
        .upsert({
          id: initialData?.id,
          ...patientData
        });

      if (error) throw error;
      onSuccess();
    } catch (error: any) {
      alert('Erro ao salvar paciente: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Avatar Upload */}
        <div className="relative group">
          <Avatar 
            src={formData.photo_url} 
            name={formData.full_name || 'Nova Paciente'} 
            size="xl" 
            className="shadow-md"
          />
          <label className="absolute inset-0 flex items-center justify-center bg-ebony/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            {uploading ? <Loader2 className="text-white animate-spin" /> : <Camera className="text-white" />}
            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
          </label>
        </div>

        {/* Form Fields */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="md:col-span-2">
            <Input
              label="Nome Completo *"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Ex: Maria Clara Gonçalves"
              required
            />
          </div>
          
          <Input
            label="CPF (Opcional)"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            placeholder="000.000.000-00"
          />

          <Input
            label="Telefone (Opcional)"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
          />

          <Input
            label="E-mail"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="paciente@exemplo.com"
          />

          <Input
            label="Data de Nascimento"
            name="birth_date"
            type="date"
            value={formData.birth_date}
            onChange={handleChange}
          />

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-mahogany uppercase tracking-wider pl-1">
              Observações / Histórico Médico
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 rounded-[12px] bg-white border border-sand text-ebony placeholder:text-mid-gray outline-none transition-all focus:border-champagne focus:ring-2 focus:ring-champagne/10 text-sm"
              placeholder="Alergias, condições prévias, observações gerais..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-sand">
        <Button onClick={onCancel} variant="ghost" type="button" disabled={loading}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit" disabled={loading || uploading}>
          {loading ? 'Salvando...' : (initialData ? 'Atualizar Ficha' : 'Cadastrar Paciente')}
        </Button>
      </div>
    </form>
  );
};
