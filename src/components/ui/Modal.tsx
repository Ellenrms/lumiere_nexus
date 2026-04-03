import React from "react";
import { X } from "lucide-react";
import { Card } from "./Card";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  maxWidth = 'max-w-4xl' 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ebony/60 backdrop-blur-sm animate-in fade-in duration-300">
      <Card variant="premium" className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto relative shadow-2xl bg-[#F5F1E9] border-none`}>
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-bronze/20">
          <h2 className="text-display text-2xl text-ebony">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-sand rounded-full transition-colors text-mahogany"
          >
            <X size={20} />
          </button>
        </header>
        {children}
      </Card>
    </div>
  );
};
