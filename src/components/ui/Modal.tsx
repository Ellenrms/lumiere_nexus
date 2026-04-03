import React from "react";
import { X } from "lucide-react";
import { Card } from "./Card";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ebony/60 backdrop-blur-sm animate-in fade-in duration-300">
      <Card variant="premium" className="w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-sand">
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
