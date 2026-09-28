import React from 'react';
import { ArrowRight, Sparkles, PhoneCall, Mail } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const ContactCTA: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { settings } = useSettings();

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 border border-indigo-700/40 p-8 sm:p-14 overflow-hidden shadow-2xl">
        {/* Glow orb */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-cyan-300 border border-white/20 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready to Elevate Your Technology Stack?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight font-sans">
            {settings.contact_cta_title || "Let's Discuss Your Architecture"}
          </h2>

          <p className="text-indigo-200 text-base sm:text-lg leading-relaxed">
            {settings.contact_cta_desc || 'Whether you require a dedicated AI vector intelligence platform, cloud modernization, or high-throughput ledgers, our team is ready to assist.'}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('/contact')}
              className="px-8 py-4 rounded-2xl text-base font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-xl hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Schedule Architecture Consultation</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('/projects')}
              className="px-6 py-4 rounded-2xl text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-colors flex items-center justify-center gap-2"
            >
              <span>Browse 40+ Case Studies</span>
            </button>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-indigo-300">
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-cyan-300" />
              Direct: {settings.primary_email || 'contact@insa.gov.et'}
            </span>
            <span className="flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-cyan-300" />
              Call: {settings.phone_number || '+251-0135685458'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
