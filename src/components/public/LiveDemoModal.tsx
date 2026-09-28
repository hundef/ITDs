import React, { useEffect } from 'react';
import { Project } from '../../types';
import { InteractiveProjectDemo } from './InteractiveProjectDemo';
import { X } from 'lucide-react';

interface LiveDemoModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LiveDemoModal: React.FC<LiveDemoModalProps> = ({ project, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-6xl">
        <InteractiveProjectDemo project={project} onClose={onClose} isModal={true} />
      </div>
    </div>
  );
};
