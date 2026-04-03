'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  MoreHorizontal,
  User,
  Syringe,
  Loader2
} from 'lucide-react';
import { AppointmentModal } from './AppointmentModal';
import { Modal } from '../ui/Modal';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 até 20:00

export const AgendaCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{date: string, time: string} | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const startOfDay = new Date(currentDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (full_name, id, photo_url),
          procedures (name, duration_min)
        `)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar agenda:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentDate]);

  const nextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const prevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const getTimePosition = (timeStr: string) => {
    const date = new Date(timeStr);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const totalMinutesSince8 = (hours - 8) * 60 + minutes;
    return (totalMinutesSince8 / 60) * 100; // Retorna altura em pixels relative a 100px por hora
  };

  const getDurationHeight = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMin = (endDate.getTime() - startDate.getTime()) / 60000;
    return (diffMin / 60) * 100; // 100px por hora
  };

  // Função para calcular sobreposição e retornar estilo (width e left)
  const getOverlapStyle = (appt: any, currentAppointments: any[]) => {
    const overlaps = currentAppointments.filter(a => {
      if (a.id === appt.id) return false;
      const aStart = new Date(a.start_time).getTime();
      const aEnd = new Date(a.end_time).getTime();
      const apptStart = new Date(appt.start_time).getTime();
      const apptEnd = new Date(appt.end_time).getTime();
      return (apptStart < aEnd && apptEnd > aStart);
    });

    if (overlaps.length === 0) return { width: 'calc(100% - 84px)', left: '80px' };

    // Lógica simples de divisão de espaço
    const index = [...overlaps, appt].sort((a,b) => a.id.localeCompare(b.id)).findIndex(a => a.id === appt.id);
    const count = overlaps.length + 1;
    const widthPercentage = (100 - 15) / count; // 15% reservado para as labels de hora
    const left = 80 + (index * ((100 - 15) / count) * 8); // Offset heurístico para visualização

    return { 
        width: `${widthPercentage}%`, 
        left: `${80 + (index * (80 / count))}%`,
        maxWidth: `${widthPercentage}%`
    };
  };

  return (
    <div className="space-y-6">
      {/* Header da Agenda */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4 bg-white p-1.5 rounded-2xl border border-sand shadow-sm">
          <button onClick={prevDay} className="p-2 hover:bg-sand rounded-xl text-mahogany transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="px-4 text-center min-w-[200px]">
            <p className="text-sm font-medium text-ebony">
              {currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
            </p>
          </div>
          <button onClick={nextDay} className="p-2 hover:bg-sand rounded-xl text-mahogany transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCurrentDate(new Date())} className="border-sand">Hoje</Button>
          <Button variant="primary" onClick={() => {
            setSelectedSlot(null);
            setIsModalOpen(true);
          }} className="shadow-lg">
            <Plus size={18} className="mr-2" /> Novo Agendamento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Lateral Esquerda: Lista Rápida */}
        <div className="lg:col-span-1 border-r border-sand/50 pr-4 space-y-6">
            <Card variant="premium" className="p-5 bg-[#1A1A1A] text-white border-none shadow-xl">
                <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-bronze/80 mb-4">Resumo Clínico</h3>
                <div className="flex justify-between items-end">
                    <span className="text-xs opacity-60">Sessões Hoje</span>
                    <span className="text-2xl font-serif">{appointments.length}</span>
                </div>
            </Card>

            <div className="space-y-4">
                <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-mahogany pl-1">Próximas Pacientes</h3>
                {appointments.length === 0 ? (
                    <p className="text-xs text-mid-gray italic pl-1">Nenhum agendamento para hoje.</p>
                ) : (
                    <div className="space-y-3">
                        {appointments.slice(0, 5).map((appt) => (
                            <div key={appt.id} className="p-3 bg-white border border-sand/60 rounded-xl shadow-sm hover:border-bronze/40 transition-colors">
                                <p className="text-[10px] font-bold text-bronze mb-1">
                                    {new Date(appt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="text-xs font-bold text-ebony truncate">{appt.patients?.full_name}</p>
                                <p className="text-[10px] text-mid-gray truncate">{appt.procedures?.name || 'Consulta'}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Lado Direito: Grade Horária */}
        <div className="lg:col-span-3">
          <Card variant="premium" className="relative h-[1300px] bg-white border-sand/50 shadow-inner overflow-y-auto">
            {/* Linhas de Fundo */}
            {HOURS.map((hour) => (
              <div 
                key={hour} 
                className="absolute w-full border-t border-sand/30 flex items-start"
                style={{ top: `${(hour - 8) * 100}px`, height: '100px' }}
              >
                <span className="relative -top-3 left-4 text-[10px] font-bold text-mahogany/40 tracking-widest bg-white pr-2">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}

            {/* Agendamentos */}
            {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-20">
                    <Loader2 className="animate-spin text-bronze" size={32} />
                </div>
            ) : (
                appointments.map((appt) => {
                    const top = getTimePosition(appt.start_time);
                    const height = getDurationHeight(appt.start_time, appt.end_time);
                    const style = getOverlapStyle(appt, appointments);

                    return (
                        <div 
                            key={appt.id}
                            className="absolute rounded-xl border border-bronze/20 bg-sand/20 p-4 shadow-sm group hover:ring-2 hover:ring-bronze/30 transition-all cursor-pointer z-10"
                            style={{ 
                                top: `${top}px`, 
                                height: `${height}px`, 
                                left: style.left,
                                width: style.width,
                                minHeight: '40px' 
                            }}
                        >
                            <div className="flex justify-between items-start overflow-hidden">
                                <div className="flex items-start gap-2">
                                    <div className="w-6 h-6 rounded-full border border-bronze/20 overflow-hidden bg-white shrink-0 hidden md:block">
                                        {appt.patients?.photo_url ? <img src={appt.patients.photo_url} className="w-full h-full object-cover" /> : <User size={12} className="m-auto mt-1.5 text-bronze/40" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-ebony uppercase tracking-tight truncate">
                                            {appt.patients?.full_name}
                                        </p>
                                        <p className="text-[9px] text-mahogany/60 flex items-center gap-1 font-medium truncate mt-0.5">
                                            <Syringe size={10} className="text-bronze" /> {appt.procedures?.name || 'Consulta'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[9px] font-bold text-bronze tracking-widest">
                                        {new Date(appt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}

            {/* Marcador de Hora Atual */}
            {new Date().toDateString() === currentDate.toDateString() && (
                <div 
                    className="absolute left-0 right-0 border-t-2 border-red-400 z-20 pointer-events-none before:absolute before:-top-1 before:left-0 before:w-2 before:h-2 before:bg-red-400 before:rounded-full"
                    style={{ top: `${getTimePosition(new Date().toISOString())}px` }}
                />
            )}
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Agendar Sessão"
      >
        <AppointmentModal 
            onCancel={() => setIsModalOpen(false)}
            onSuccess={() => {
                setIsModalOpen(false);
                fetchAppointments();
            }}
            initialDate={currentDate.toISOString().split('T')[0]}
        />
      </Modal>
    </div>
  );
};
