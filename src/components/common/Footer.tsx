import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import {
  Mail, Phone, MapPin, ShieldCheck,
  Twitter, Linkedin, Github, Youtube, ArrowUpRight
} from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

const NavCol: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h4 className="text-[11px] font-bold uppercase tracking-[.1em] text-slate-400 mb-4">{title}</h4>
    <ul className="space-y-2.5">{children}</ul>
  </div>
);

const NavLink: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <li>
    <button
      onClick={onClick}
      className="text-[13px] text-slate-500 hover:text-white transition-colors duration-200 text-left"
    >
      {children}
    </button>
  </li>
);

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useSettings();

  const socials = [
    { icon: Twitter,  href: settings.twitter_url,  label: 'Twitter'  },
    { icon: Linkedin, href: settings.linkedin_url, label: 'LinkedIn' },
    { icon: Github,   href: settings.github_url,   label: 'GitHub'   },
    { icon: Youtube,  href: settings.youtube_url,  label: 'YouTube'  },
  ].filter(s => s.href);

  return (
    <footer className="relative bg-[#08090f] text-slate-400 overflow-hidden">
      {/* Top gradient line removed */}

      {/* Ambient blobs */}
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-indigo-600/6 blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-cyan-600/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Main grid ── */}
        <div className="pt-16 pb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 border-b border-white/[.05]">

          {/* Brand column */}
          <div className="lg:col-span-4 space-y-5">
            <button onClick={() => onNavigate('/')} className="flex items-center gap-3 group">
              <div style={{ perspective: '600px' }}>
                {/* ITD — staggered flip-in + spin loop per letter */}
                <div className="flex items-baseline gap-[1px]">
                  {(settings.logo_name || settings.company_name || 'ITD').split('').map((char, i) => (
                    <span
                      key={i}
                      className="font-extrabold text-xl font-sans text-indigo-400 inline-block"
                      style={{
                        transformOrigin: 'center',
                        animation: `letterFlipIn 0.6s cubic-bezier(.16,1,.3,1) ${i * 120}ms both, letterSpin 3s ease-in-out ${0.6 + i * 0.12 + 1}s infinite`
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </div>
                {/* Tagline typewriter */}
                <span
                  className="block text-[10px] font-bold uppercase tracking-[.12em] text-slate-500 mt-0.5 overflow-hidden whitespace-nowrap"
                  style={{ animation: 'typewriter 1.4s steps(24,end) 0.8s both' }}
                >
                  Create. Innovate. Impact.
                </span>
              </div>
            </button>

            <p className="text-[13px] text-slate-500 leading-relaxed max-w-xs">
              {settings.company_tagline || 'Engineering high-impact enterprise software, autonomous cloud platforms, and verifiable AI pipelines.'}
            </p>

            {/* Socials */}
            {socials.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                {socials.map(s => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="w-8 h-8 rounded-lg bg-white/[.04] border border-white/[.06] flex items-center justify-center text-slate-500 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all duration-200"
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Links */}
          <div className="lg:col-span-3">
            <NavCol title="Company">
              <NavLink onClick={() => onNavigate('/about')}>About Us</NavLink>
              <NavLink onClick={() => onNavigate('/team')}>Leadership & Team</NavLink>
              <NavLink onClick={() => onNavigate('/projects')}>Project Portfolio</NavLink>
              <NavLink onClick={() => onNavigate('/services')}>Services</NavLink>
              <NavLink onClick={() => onNavigate('/blog')}>Tech Insights</NavLink>
            </NavCol>
          </div>

          {/* Address + Contact */}
          <div className="lg:col-span-5">
            <h4 className="text-[11px] font-bold uppercase tracking-[.1em] text-slate-400 mb-3">
              Address
            </h4>
            <div className="space-y-4 pt-2">
              {settings.primary_email && (
                <a href={`mailto:${settings.primary_email}`} className="flex items-center gap-2.5 text-[12px] text-slate-500 hover:text-slate-300 transition-colors group">
                  <span className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  </span>
                  {settings.primary_email}
                </a>
              )}
              {settings.phone_number && (
                <a href={`tel:${settings.phone_number}`} className="flex items-center gap-2.5 text-[12px] text-slate-500 hover:text-slate-300 transition-colors group">
                  <span className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0 group-hover:bg-cyan-500/20 transition-colors">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  </span>
                  {settings.phone_number}
                </a>
              )}
              {settings.office_address && (
                <div className="flex items-start gap-2.5 text-[12px] text-slate-500">
                  <span className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-violet-400" />
                  </span>
                  <span className="leading-relaxed">{settings.office_address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-slate-600">
            © {new Date().getFullYear()} {settings.company_name || 'Company'}. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-[12px]">
            <span className="flex items-center gap-1.5 text-emerald-500 font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
