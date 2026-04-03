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
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { AppointmentModal } from './AppointmentModal';
import { Modal } from '../ui/Modal';

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); 

export const AgendaCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{date: string, time: string} | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

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

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      fetchAppointments();
      setActiveMenu(null);
    } catch (err: any) {
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchAppointments();
      setActiveMenu(null);
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

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
    const totalMinutesSince7 = (hours - 7) * 60 + minutes;
    return (totalMinutesSince7 / 60) * 100;
  };

  const getDurationHeight = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMin = (endDate.getTime() - startDate.getTime()) / 60000;
    return (diffMin / 60) * 100;
  };

  const getOverlapStyle = (appt: any, currentAppointments: any[]) => {
    const overlaps = currentAppointments.filter(a => {
      if (a.id === appt.id) return false;
      const aStart = new Date(a.start_time).getTime();
      const aEnd = new Date(a.end_time).getTime();
      const apptStart = new Date(appt.start_time).getTime();
      const apptEnd = new Date(appt.end_time).getTime();
      return (apptStart < aEnd && apptEnd > aStart);
    });

    const containerPadding = 60; 

    if (overlaps.length === 0) {
        return { width: `calc(100% - ${containerPadding + 20}px)`, left: `${containerPadding}px` };
    }

    const sortedGroup = [...overlaps, appt].sort((a,b) => a.id.localeCompare(b.id));
    const index = sortedGroup.findIndex(a => a.id === appt.id);
    const count = sortedGroup.length;
    
    const availableWidth = 100 - 15; 
    const widthPerAppt = availableWidth / count;
    const startLeft = 10; 

    return { 
        width: `${widthPerAppt}%`, 
        left: `${startLeft + (index * widthPerAppt)}%`,
        maxWidth: `${widthPerAppt}%`
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
            <Plus size={18} className="mr-2" /> Novo Agendamento / Bloqueio
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Lateral Esquerda */}
        <div className="lg:col-span-1 border-r border-sand/50 pr-4 space-y-6">
            <Card variant="premium" className="p-5 bg-[#1A1A1A] text-white border-none shadow-xl">
                <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-bronze/80 mb-4">Resumo Clínico</h3>
                <div className="flex justify-between items-end">
                    <span className="text-xs opacity-60">Sessões Hoje</span>
                    <span className="text-2xl font-serif">{appointments.filter(a => a.status !== 'bloqueado').length}</span>
                </div>
            </Card>

            <div className="space-y-4">
                <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-mahogany pl-1">Próximas Pacientes</h3>
                {appointments.filter(a => a.status !== 'bloqueado').length === 0 ? (
                    <p className="text-xs text-mid-gray italic pl-1">Nenhum agendamento para hoje.</p>
                ) : (
                    <div className="space-y-3">
                        {appointments.filter(a => a.status !== 'bloqueado').slice(0, 5).map((appt) => (
                            <div key={appt.id} className="p-3 bg-white border border-sand/60 rounded-xl shadow-sm hover:border-bronze/40 transition-colors group">
                                <p className="text-[10px] font-bold text-bronze mb-1">
                                    {new Date(appt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="text-xs font-bold text-ebony truncate group-hover:text-bronze transition-colors">{appt.patients?.full_name}</p>
                                <p className="text-[10px] text-mid-gray truncate">{appt.procedures?.name || 'Consulta'}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Lado Direito: Grade Horária */}
        <div className="lg:col-span-3">
          <Card variant="premium" className="relative h-[1500px] bg-white border-sand/50 shadow-inner overflow-y-auto">
            {/* Linhas de Fundo */}
            {HOURS.map((hour) => (
              <div 
                key={hour} 
                className="absolute w-full border-t border-sand/30 flex items-start"
                style={{ top: `${(hour - 7) * 100}px`, height: '100px' }}
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
                    const isBlocked = appt.status === 'bloqueado';
                    const isFalta = appt.status === 'falta';
                    const isCancelado = appt.status === 'cancelado';
                    const isPresente = appt.status === 'presente';

                    return (
                        <div 
                            key={appt.id}
                            className={`absolute rounded-xl border p-4 shadow-sm group hover:ring-2 transition-all z-10 overflow-visible ${
                                isBlocked 
                                ? 'bg-slate-100 border-slate-300 opacity-80 cursor-not-allowed stripe-bg' 
                                : isFalta ? 'bg-red-50 border-red-200' 
                                : isCancelado ? 'bg-gray-100 border-gray-300 opacity-60' 
                                : isPresente ? 'bg-green-50 border-green-200'
                                : 'bg-sand/20 border-bronze/20 hover:ring-bronze/30 cursor-pointer'
                            }`}
                            style={{ 
                                top: `${top}px`, 
                                height: `${height}px`, 
                                left: style.left,
                                width: style.width,
                                minHeight: '40px' 
                            }}
                        >
                            <div className="flex justify-between items-start h-full">
                                <div className="flex items-start gap-2 h-full min-w-0">
                                    {!isBlocked && (
                                        <div className="w-6 h-6 rounded-full border border-bronze/20 overflow-hidden bg-white shrink-0 hidden md:block">
                                            {appt.patients?.photo_url ? <img src={appt.patients.photo_url} className="w-full h-full object-cover" /> : <User size={12} className="m-auto mt-1.5 text-bronze/40" />}
                                        </div>
                                    )}
                                    <div className="min-w-0 flex flex-col justify-between h-full">
                                        <div>
                                            <p className={`text-[10px] font-bold uppercase tracking-tight truncate ${isBlocked ? 'text-slate-500' : 'text-ebony'}`}>
                                                {isBlocked ? 'HORÁRIO BLOQUEADO' : appt.patients?.full_name}
                                            </p>
                                            {!isBlocked && (
                                                <p className="text-[9px] text-mahogany/60 flex items-center gap-1 font-medium truncate mt-0.5">
                                                    <Syringe size={10} className="text-bronze" /> {appt.procedures?.name || 'Consulta'}
                                                </p>
                                            )}
                                            {isBlocked && appt.notes && (
                                                <p className="text-[9px] text-slate-400 italic truncate mt-0.5">{appt.notes}</p>
                                            )}
                                        </div>
                                        
                                        {/* Badge de Status */}
                                        {!isBlocked && appt.status !== 'confirmado' && (
                                            <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full w-fit mt-1 ${
                                                isFalta ? 'bg-red-200 text-red-700' : 
                                                isCancelado ? 'bg-gray-200 text-gray-700' : 
                                                'bg-green-200 text-green-700'
                                            }`}>
                                                {appt.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right shrink-0 flex flex-col justify-between h-full">
                                    <p className={`text-[9px] font-bold tracking-widest ${isBlocked ? 'text-slate-400' : 'text-bronze'}`}>
                                        {new Date(appt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    
                                    {/* Botão de Menu Três Pontos */}
                                    <div className="relative mt-auto">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenu(activeMenu === appt.id ? null : appt.id);
                                            }}
                                            className="p-1 hover:bg-black/5 rounded-full transition-colors"
                                        >
                                            <MoreHorizontal size={16} className={isBlocked ? 'text-slate-400' : 'text-ebony/40'} />
                                        </button>

                                        {/* Menu Suspenso (Dropdown) */}
                                        {activeMenu === appt.id && (
                                            <div className="absolute right-0 bottom-8 z-50 w-44 bg-white border border-sand rounded-xl shadow-2xl p-1 animate-in zoom-in-95 duration-150 origin-bottom-right">
                                                <div className="text-[10px] uppercase font-bold text-mahogany/40 px-3 py-2 border-b border-sand/40">Ações</div>
                                                <button onClick={() => updateStatus(appt.id, 'presente')} className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-ebony hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors">
                                                    <CheckCircle2 size={14} /> Confirmar Presença
                                                </button>
                                                <button onClick={() => updateStatus(appt.id, 'falta')} className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-ebony hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors">
                                                    <XCircle size={14} /> Marcar Falta
                                                </button>
                                                <button onClick={() => updateStatus(appt.id, 'cancelado')} className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-ebony hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-colors">
                                                    <AlertCircle size={14} /> Cancelar Sessão
                                                </button>
                                                <div className="h-[1px] bg-sand/40 my-1" />
                                                <button onClick={() => deleteAppointment(appt.id)} className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                                                    <Trash2 size={14} /> Excluir Registro
                                                </button>
                                            </div>
                                        )}
                                    </div>
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
        title="Agendar Sessão / Bloqueio"
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

      <style jsx>{`
        .stripe-bg {
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(0, 0, 0, 0.03) 10px,
            rgba(0, 0, 0, 0.03) 20px
          );
        }
      `}</style>
    </div>
  );
};
