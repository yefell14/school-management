'use client';

import { X, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function ContentPanel({
  isOpen,
  onClose,
  children,
  title,
}: ContentPanelProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-white transition-transform duration-300 ease-in-out',
        'transform',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-6 bg-white">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 flex items-center gap-2"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver</span>
          </button>
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-2 hover:bg-gray-100"
          aria-label="Cerrar panel"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="h-[calc(100vh-4rem)] overflow-y-auto p-6">
        {children}
      </div>
    </div>
  );
} 