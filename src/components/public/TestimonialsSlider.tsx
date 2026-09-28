import React, { useEffect, useState, useRef } from 'react';
import { Testimonial } from '../../types';
import { api } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { Star, Quote, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export const TestimonialsSlider: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const { settings } = useSettings();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    api.testimonials.getAll()
      .then(res => { if (res.testimonials) setTestimonials(res.testimonials); })
      .catch(console.error);
  }, []);

  // Auto-advance every 5s
  useEffect(() => {
    if (testimonials.length <= 1) return;
    autoRef.current = setInterval(() => changeTo((prev) => (prev + 1) % testimonials.length), 5000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [testimonials.length]);

  const changeTo = (fn: (p: number) => number) => {
    setAnimating(true);
    setTimeout(() => {
      setCurrent(fn);
      setAnimating(false);
    }, 200);
  };

  const resetAuto = () => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => changeTo((prev) => (prev + 1) % testimonials.length), 5000);
  };

  const prev = () => { changeTo(p => (p - 1 + testimonials.length) % testimonials.length); resetAuto(); };
  const next = () => { changeTo(p => (p + 1) % testimonials.length); resetAuto(); };

  if (testimonials.length === 0) return null;

  const t = testimonials[current];

  return (
    <section className="relative py-24 overflow-hidden bg-[#08090f]">
      {/* ── Background ── */}
      <div className="absolute inset-0 bg-dot opacity-40" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

      {/* Ambient orbs */}
      <div className="absolute left-[15%] top-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute right-[15%] top-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-cyan-600/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ── */}
        <div className="text-center mb-14 space-y-3">
          <span className="section-label bg-indigo-500/15 text-indigo-300 border-indigo-500/25">
            <Quote className="w-3.5 h-3.5" />
            {settings.testimonials_badge_text || 'Client Endorsements'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            {settings.testimonials_section_title || 'Trusted by Leaders at Scale'}
          </h2>
          <p className="text-[14px] text-slate-500 max-w-lg mx-auto">
            {settings.testimonials_section_desc || 'What CTOs, CIOs, and engineering directors say about partnering with ITD.'}
          </p>
        </div>

        {/* ── Card ── */}
        <div className="relative max-w-4xl mx-auto">
          {/* Outer glow ring */}
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-indigo-500/20 via-transparent to-cyan-500/20 pointer-events-none" />

          <div
            className={`relative bg-white/[.04] backdrop-blur-xl border border-white/[.07] rounded-3xl p-8 sm:p-12
              shadow-[0_32px_80px_rgba(0,0,0,.6)]
              transition-all duration-200 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
          >
            {/* Decorative large quote */}
            <Quote className="absolute top-6 right-8 w-14 h-14 text-white/[.04] pointer-events-none" />

            {/* Stars */}
            <div className="flex items-center gap-1 mb-6">
              {[...Array(t.rating || 5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-2 text-[11px] font-mono font-bold text-amber-400/80">
                {t.rating || 5}.0 / 5.0
              </span>
            </div>

            {/* Quote */}
            <blockquote className="text-lg sm:text-xl md:text-2xl text-slate-100 font-medium leading-relaxed mb-8">
              "{t.content}"
            </blockquote>

            {/* Client + Project link */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-6 border-t border-white/[.06]">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src={t.author_avatar || t.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop'}
                    alt={t.author_name || t.client_name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/40"
                    onError={e => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop';
                    }}
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#08090f]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">{t.author_name || t.client_name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <p className="text-[12px] text-indigo-300 mt-0.5 font-medium">
                    {t.author_role || t.client_role} · {t.author_company || t.client_company}
                  </p>
                </div>
              </div>

              {t.project_name && onNavigate && (
                <button
                  onClick={() => onNavigate(`/projects/${t.project_slug || ''}`)}
                  className="self-start sm:self-auto px-4 py-2 rounded-xl text-[12px] font-semibold
                    bg-white/[.06] hover:bg-indigo-600 text-slate-300 hover:text-white
                    border border-white/[.08] hover:border-indigo-500
                    transition-all duration-200"
                >
                  Case Study: {t.project_name} →
                </button>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-white/[.05]">
              {/* Dot indicators */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { changeTo(() => i); resetAuto(); }}
                    className={`rounded-full transition-all duration-300 ${
                      i === current
                        ? 'w-6 h-2 bg-indigo-500'
                        : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                    }`}
                    aria-label={`Testimonial ${i + 1}`}
                  />
                ))}
              </div>

              {/* Prev / Next */}
              <div className="flex items-center gap-2">
                <button
                  onClick={prev}
                  className="p-2.5 rounded-xl bg-white/[.05] hover:bg-white/[.1] text-slate-300 hover:text-white border border-white/[.06] transition-all"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={next}
                  className="p-2.5 rounded-xl bg-white/[.05] hover:bg-indigo-600 text-slate-300 hover:text-white border border-white/[.06] hover:border-indigo-500 transition-all"
                  aria-label="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
