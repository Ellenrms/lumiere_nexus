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
  Stethoscope,
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
          patients (full_name, photo_url),
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
        {/* Lado Esquerdo: Mini Calendário e Stats (Opcional) */}
        <div className="lg:col-span-1 border-r border-sand/50 pr-4 space-y-6">
            <Card variant="premium" className="p-4 bg-bronze/5 border-bronze/10">
                <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-bronze mb-4">Resumo do Dia</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-sm text-mid-gray">Agendamentos</span>
                        <span className="text-xl font-serif text-ebony">{appointments.length}</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <span className="text-sm text-mid-gray">Ocupação Estimada</span>
                        <span className="text-xl font-serif text-ebony">
                            {Math.round((appointments.reduce((acc, curr) => {
                                const diff = (new Date(curr.end_time).getTime() - new Date(curr.start_time).getTime()) / 60000;
                                return acc + diff;
                            }, 0) / (12 * 60)) * 100)}%
                        </span>
                    </div>
                </div>
            </Card>
        </div>

        {/* Lado Direito: Grade Horária */}
        <div className="lg:col-span-3">
          <Card variant="premium" className="relative h-[1300px] bg-white border-sand/50 overflow-y-auto">
            {/* Linhas de Fundo (Horas) */}
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

            {/* Agendamentos Renderizados */}
            {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-20">
                    <Loader2 className="animate-spin text-bronze" size={32} />
                </div>
            ) : (
                appointments.map((appt) => {
                    const top = getTimePosition(appt.start_time);
                    const height = getDurationHeight(appt.start_time, appt.end_time);

                    return (
                        <div 
                            key={appt.id}
                            className="absolute left-20 right-4 rounded-xl border border-bronze/20 bg-sand/20 p-4 shadow-sm group hover:ring-2 hover:ring-bronze/30 transition-all cursor-pointer z-10"
                            style={{ top: `${top}px`, height: `${height}px`, minHeight: '40px' }}
                            onClick={() => {
                                // Futuro: Abrir detalhes ou prontuário
                            }}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full border border-bronze/20 overflow-hidden bg-white shrink-0 hidden md:block">
                                        {appt.patients?.photo_url ? <img src={appt.patients.photo_url} className="w-full h-full object-cover" /> : <User size={14} className="m-auto mt-2 text-bronze/40" />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-ebony uppercase tracking-wide truncate max-w-[200px]">
                                            {appt.patients?.full_name}
                                        </p>
                                        <p className="text-[10px] text-mahogany/60 flex items-center gap-1 font-medium mt-0.5">
                                            <Stethoscope size={10} /> {appt.procedures?.name || 'Consulta'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-bronze tracking-widest">
                                        {new Date(appt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-bronze/10 rounded-lg">
                                        <MoreHorizontal size={14} className="text-mahogany" />
                                    </button>
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
