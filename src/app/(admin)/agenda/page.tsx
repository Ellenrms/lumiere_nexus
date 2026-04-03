'use client';

import React from 'react';
import { AgendaCalendar } from '@/components/agenda/AgendaCalendar';

export default function AgendaPage() {
  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-display text-4xl text-ebony">Agenda Lumière</h1>
        <p className="text-mid-gray italic font-serif text-lg">Gestão de horários e produtividade clínica</p>
      </header>

      <AgendaCalendar />
    </div>
  );
}
