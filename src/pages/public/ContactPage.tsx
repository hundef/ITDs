import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Mail, Phone, MapPin } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();

  const email   = settings.primary_email   || 'contact@insa.gov.et';
  const phone   = settings.phone_number    || '+251-0135685458';
  const address = settings.office_address  || 'Wollo Sefer, Bole Addis Ababa Ethiopia';

  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-80 h-80 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
            {settings.contact_card_heading || 'Contact Coordinates'}
          </h1>
        </div>

        <div className="space-y-8">
          {/* Email */}
          <div className="flex items-start gap-4 sm:gap-5 group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/50 shadow-xs group-hover:scale-105 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                {settings.contact_email_label || 'Email'}
              </span>
              <a
                href={`mailto:${email}`}
                className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block"
              >
                {email}
              </a>
              {settings.contact_email_sla && (
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                  {settings.contact_email_sla}
                </span>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-4 sm:gap-5 group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-100 dark:border-cyan-900/50 shadow-xs group-hover:scale-105 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                {settings.contact_phone_label || 'Telephone'}
              </span>
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors block"
              >
                {phone}
              </a>
              {settings.contact_phone_hours && (
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                  {settings.contact_phone_hours}
                </span>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-4 sm:gap-5 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900/50 shadow-xs group-hover:scale-105 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                {settings.contact_address_label || 'Headquarters'}
              </span>
              <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                {address}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

