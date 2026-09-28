import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { ProjectMedia } from '../../types';
import { resolveImageUrl } from '../../services/api';

interface LightboxProps {
  media: ProjectMedia[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  media,
  initialIndex = 0,
  isOpen,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextMedia();
      if (e.key === 'ArrowLeft') prevMedia();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, currentIndex, media.length]);

  if (!isOpen || media.length === 0) return null;

  const current = media[currentIndex] || media[0];

  const nextMedia = () => {
    setCurrentIndex(prev => (prev + 1) % media.length);
  };

  const prevMedia = () => {
    setCurrentIndex(prev => (prev - 1 + media.length) % media.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-fade-in">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-20"
        title="Close (Esc)"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation Arrows */}
      {media.length > 1 && (
        <>
          <button
            onClick={prevMedia}
            className="absolute left-6 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-20"
            title="Previous (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextMedia}
            className="absolute right-6 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-20"
            title="Next (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Main Content Area */}
      <div className="relative max-w-5xl max-h-[85vh] flex flex-col items-center justify-center">
        {current.media_type === 'video' ? (
          <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">
            <iframe
              src={current.url.replace('watch?v=', 'embed/')}
              title={current.caption || 'Project Video'}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        ) : (
          <img
            src={resolveImageUrl(current.url) || current.url}
            alt={current.caption || 'Project Screenshot'}
            className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl border border-white/10"
          />
        )}

        {/* Caption & Counter */}
        <div className="mt-3 text-center px-4 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-white border border-white/10">
          <p className="text-xs sm:text-sm font-semibold">{current.caption || `Image ${currentIndex + 1}`}</p>
          <p className="text-[11px] text-indigo-300 font-mono mt-0.5">{currentIndex + 1} of {media.length}</p>
        </div>

        {/* Interactive Thumbnail Strip */}
        {media.length > 1 && (
          <div className="mt-3 flex items-center justify-center gap-2 max-w-xl overflow-x-auto p-1.5 no-scrollbar">
            {media.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-12 h-9 sm:w-14 sm:h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  idx === currentIndex
                    ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/50 opacity-100 ring-2 ring-indigo-400/50'
                    : 'border-white/20 opacity-50 hover:opacity-90'
                }`}
                title={item.caption || `Image ${idx + 1}`}
              >
                {item.media_type === 'video' ? (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center text-[8px] text-white font-bold">
                    VIDEO
                  </div>
                ) : (
                  <img src={resolveImageUrl(item.url) || item.url} alt="" className="w-full h-full object-cover" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
