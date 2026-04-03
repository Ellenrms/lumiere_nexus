'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Check, Columns, MousePointer2, X } from 'lucide-react';
import { Card } from '../ui/Card';

interface PhotoComparatorProps {
  isOpen: boolean;
  onClose: () => void;
  availablePhotos: any[];
}

export const PhotoComparator: React.FC<PhotoComparatorProps> = ({
  isOpen,
  onClose,
  availablePhotos
}) => {
  const [selectedBefore, setSelectedBefore] = useState<any>(null);
  const [selectedAfter, setSelectedAfter] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'selection' | 'comparison'>('selection');

  const handleSelect = (photo: any) => {
    if (!selectedBefore) {
      setSelectedBefore(photo);
    } else if (!selectedAfter) {
      setSelectedAfter(photo);
    } else {
      // Já tem dois, reseta e começa pelo before de novo
      setSelectedBefore(photo);
      setSelectedAfter(null);
    }
  };

  const handleCompare = () => {
    if (selectedBefore && selectedAfter) {
      setViewMode('comparison');
    }
  };

  const handleReset = () => {
    setSelectedBefore(null);
    setSelectedAfter(null);
    setViewMode('selection');
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={viewMode === 'selection' ? "Selecione as Fotos para Comparação" : "Comparação Lado a Lado"}
      maxWidth="6xl"
    >
      <div className="space-y-6">
        {viewMode === 'selection' ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[50vh] overflow-y-auto p-2 border border-sand/30 rounded-xl">
              {availablePhotos.map((photo, idx) => {
                const isBefore = selectedBefore?.id === photo.id;
                const isAfter = selectedAfter?.id === photo.id;
                
                return (
                  <div 
                    key={photo.id} 
                    onClick={() => handleSelect(photo)}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all border-4 ${
                      isBefore ? 'border-bronze shadow-lg scale-105' : 
                      isAfter ? 'border-champagne shadow-lg scale-105' : 
                      'border-transparent hover:border-sand'
                    }`}
                  >
                    <img src={photo.storage_path} className="w-full h-full object-cover" alt="Patient" />
                    {isBefore && (
                      <div className="absolute top-2 left-2 bg-bronze text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-widest">
                        Antes
                      </div>
                    )}
                    {isAfter && (
                      <div className="absolute top-2 left-2 bg-champagne text-mahogany text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-widest">
                        Depois
                      </div>
                    )}
                    {(isBefore || isAfter) && (
                      <div className="absolute inset-0 bg-ebony/10 flex items-center justify-center">
                        <Check className="text-white" size={32} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-6 bg-sand/20 rounded-2xl border border-sand">
              <div className="flex items-center gap-8">
                <div className="text-center space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-mahogany/60">Foto de Início</p>
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-sand flex items-center justify-center overflow-hidden bg-white">
                    {selectedBefore ? <img src={selectedBefore.storage_path} className="w-full h-full object-cover" /> : <Columns className="text-sand/40" size={24} />}
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-mahogany/60">Foto de Comparação</p>
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-sand flex items-center justify-center overflow-hidden bg-white">
                    {selectedAfter ? <img src={selectedAfter.storage_path} className="w-full h-full object-cover" /> : <Columns className="text-sand/40" size={24} />}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button variant="ghost" onClick={handleReset}>Limpar seleção</Button>
                <Button 
                  variant="primary" 
                  disabled={!selectedBefore || !selectedAfter} 
                  onClick={handleCompare}
                  className="px-10"
                >
                  Comparar Agora
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card variant="premium" className="overflow-hidden border-bronze/30 !p-0">
                <div className="bg-bronze text-white text-center py-2 text-xs uppercase font-bold tracking-[0.3em]">Antes</div>
                <div className="aspect-[3/4] md:aspect-square overflow-hidden bg-ebony/5">
                  <img src={selectedBefore.storage_path} className="w-full h-full object-contain" alt="Before" />
                </div>
              </Card>
              <Card variant="premium" className="overflow-hidden border-champagne/30 !p-0">
                <div className="bg-champagne text-mahogany text-center py-2 text-xs uppercase font-bold tracking-[0.3em]">Depois</div>
                <div className="aspect-[3/4] md:aspect-square overflow-hidden bg-ebony/5">
                  <img src={selectedAfter.storage_path} className="w-full h-full object-contain" alt="After" />
                </div>
              </Card>
            </div>
            
            <div className="flex justify-between items-center bg-sand/10 p-4 rounded-xl border border-sand">
              <p className="text-sm text-mid-gray italic font-serif flex items-center gap-2">
                <MousePointer2 size={14} />
                Use o zoom do navegador se precisar aproximar os detalhes.
              </p>
              <Button variant="ghost" onClick={() => setViewMode('selection')} className="flex items-center gap-2">
                <Columns size={16} /> Alternar fotos
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
