'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Clock, Calendar, Check, AlertTriangle, Loader2, User } from 'lucide-react';

interface AppointmentModalProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialDate?: string;
  initialTime?: string;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  onSuccess,
  onCancel,
  initialDate,
  initialTime
}) => {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [searchPatient, setSearchPatient] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const [formData, setFormData] = useState({
    patient_id: '',
    procedure_id: '',
    date: initialDate || new Date().toISOString().split('T')[0],
    time: initialTime || '09:00',
    duration_min: 30,
    notes: ''
  });

  const [conflict, setConflict] = useState(false);

  // Buscar Pacientes em tempo real
  useEffect(() => {
    if (searchPatient.length < 2) {
      setPatients([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      const { data } = await supabase
        .from('patients')
        .select('id, full_name, photo_url')
        .ilike('full_name', `%${searchPatient}%`)
        .limit(5);
      setPatients(data || []);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchPatient]);

  // Buscar Catálogo de Procedimentos
  useEffect(() => {
    const fetchProcedures = async () => {
      const { data } = await supabase.from('procedures').select('*').eq('active', true).order('name');
      setProcedures(data || []);
    };
    fetchProcedures();
  }, []);

  // Ao selecionar procedimento, ajusta a duração padrão
  const handleProcedureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const procId = e.target.value;
    const proc = procedures.find(p => p.id === procId);
    setFormData(prev => ({
      ...prev,
      procedure_id: procId,
      duration_min: proc ? proc.duration_min : 30
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_id) return alert('Selecione uma paciente.');

    setLoading(true);
    try {
      const start = new Date(`${formData.date}T${formData.time}`);
      const end = new Date(start.getTime() + formData.duration_min * 60000);

      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: formData.patient_id,
          procedure_id: formData.procedure_id || null,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          notes: formData.notes,
          status: 'confirmado'
        });

      if (error) throw error;
      onSuccess();
    } catch (error: any) {
      alert('Erro ao agendar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Busca de Paciente */}
      <div className="space-y-1.5 relative">
        <label className="text-sm font-medium text-mahogany uppercase tracking-wider pl-1">Paciente *</label>
        <div className="relative">
          <Input 
            placeholder="Digite o nome para buscar..."
            value={searchPatient}
            onChange={(e) => setSearchPatient(e.target.value)}
          />
          {isSearching && <Loader2 className="absolute right-3 top-3 animate-spin text-bronze" size={16} />}
        </div>
        
        {patients.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-sand rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
            {patients.map(p => (
              <div 
                key={p.id} 
                className="flex items-center gap-3 px-4 py-3 hover:bg-sand/30 cursor-pointer transition-colors border-b border-sand/50 last:border-0"
                onClick={() => {
                  setFormData({...formData, patient_id: p.id});
                  setSearchPatient(p.full_name);
                  setPatients([]);
                }}
              >
                <div className="w-8 h-8 rounded-full bg-sand flex items-center justify-center overflow-hidden">
                  {p.photo_url ? <img src={p.photo_url} className="w-full h-full object-cover" /> : <User size={14} className="text-bronze" />}
                </div>
                <span className="text-sm text-ebony">{p.full_name}</span>
                {formData.patient_id === p.id && <Check className="ml-auto text-bronze" size={16} />}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input 
          label="Data"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({...formData, date: e.target.value})}
        />
        <Input 
          label="Horário"
          type="time"
          value={formData.time}
          onChange={(e) => setFormData({...formData, time: e.target.value})}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-mahogany uppercase tracking-wider pl-1">Procedimento Previsto</label>
        <select 
          className="w-full px-4 py-3 rounded-[12px] bg-white border border-sand text-ebony outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/10 text-sm"
          value={formData.procedure_id}
          onChange={handleProcedureChange}
        >
          <option value="">Selecione um serviço (Opcional)</option>
          {procedures.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.duration_min} min)</option>
          ))}
        </select>
      </div>

      <Input 
        label="Duração em Minutos"
        type="number"
        value={formData.duration_min}
        onChange={(e) => setFormData({...formData, duration_min: parseInt(e.target.value) || 0})}
      />

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-mahogany uppercase tracking-wider pl-1">Observações do Agendamento</label>
        <textarea 
          className="w-full px-4 py-3 rounded-[12px] bg-white border border-sand text-ebony outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/10 text-sm"
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Ex: Recomendar jejum, trazer exames..."
        />
      </div>

      {/* Alerta de Conflito (Simulado por enquanto) */}
      {conflict && (
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="text-amber-500 shrink-0" size={20} />
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>Aviso de Conflito:</strong> Já existe uma paciente agendada neste horário. Deseja manter o agendamento simultâneo mesmo assim?
          </p>
        </div>
      )}

      <div className="flex justify-end gap-4 pt-4">
        <Button variant="ghost" onClick={onCancel} type="button">Cancelar</Button>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Agendando...' : 'Confirmar Horário'}
        </Button>
      </div>
    </form>
  );
};
