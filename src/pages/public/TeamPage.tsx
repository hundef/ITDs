import React, { useEffect, useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { TeamMember } from '../../types';
import { api } from '../../services/api';
import { Users, Mail, Linkedin, Github, ShieldCheck, Users2 } from 'lucide-react';

export const TeamPage: React.FC = () => {
  const { settings } = useSettings();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [viewMode, setViewMode] = useState<'leaders' | 'professionals'>('leaders');
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.team.getAll().then(res => {
      if (res.team) setTeam(res.team);
    }).catch(err => console.error(err)).finally(() => setIsLoading(false));
  }, []);

  // Separate leaders and non-leaders
  const allLeaders = team.filter(m => m.is_leadership);
  
  // Sort leaders: Director first, then Deputy Director, then Intelligence Technology Division, then others
  const sortedLeaders = allLeaders.sort((a, b) => {
    const roleA = (a.role || '').toLowerCase();
    const roleB = (b.role || '').toLowerCase();
    
    // Define priority order
    const getPriority = (role: string) => {
      if (role === 'director' || role === 'general director') return 0;
      if (role.includes('deputy director')) return 1;
      if (role.includes('intelligence') && role.includes('technology') && role.includes('division')) return 2;
      return 3; // Others
    };
    
    return getPriority(roleA) - getPriority(roleB);
  });
  
  const leaders = sortedLeaders;
  
  // Group non-leaders by department
  const departmentGroups: { [key: string]: TeamMember[] } = {};
  team.forEach(member => {
    if (member.department && member.department.trim() && !member.is_leadership) {
      if (!departmentGroups[member.department]) {
        departmentGroups[member.department] = [];
      }
      departmentGroups[member.department].push(member);
    }
  });
  
  const departments = Object.keys(departmentGroups).sort();

  return (
    <div className="pt-28 pb-20 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          <Users className="w-3.5 h-3.5" />
          <span>{settings.team_badge_text || 'Our Technical Leadership'}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
          {settings.team_section_title || 'Leaders & Professionals Behind ITD'}
        </h1>
      </div>

      {/* View Mode Toggle */}
      <div className="space-y-3 flex flex-col items-center">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setViewMode('leaders')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              viewMode === 'leaders'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 inline-block mr-2" />
            Leaders
          </button>
          
          <button
            onClick={() => setViewMode('professionals')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              viewMode === 'professionals'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Users2 className="w-4 h-4 inline-block mr-2" />
            Professionals
          </button>
        </div>
      </div>

      {/* Leaders Section with Full Information */}
      {viewMode === 'leaders' && (
        <div className="space-y-12 max-w-2xl mx-auto">
          <div className="space-y-8">
            <div className="flex items-center justify-center gap-3">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Leaders</h2>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-40 rounded-xl bg-slate-100 dark:bg-slate-850 animate-pulse border border-slate-200 dark:border-slate-800" />
                ))}
              </div>
            ) : leaders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {leaders.map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-col items-center text-center group"
                  >
                    {member.is_visible === 1 || member.is_visible === true ? (
                      <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 mb-4 ring-2 ring-indigo-600 shadow-lg group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={member.avatar || '/avatars/avatar_default.jpg'}
                          alt={member.name}
                          onError={(e) => { e.currentTarget.src = '/avatars/avatar_default.jpg'; }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="relative w-32 h-32 mb-4 group/hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-400/10 dark:to-purple-400/10 rounded-2xl blur-xl group-hover/hidden:from-indigo-500/20 group-hover/hidden:to-purple-500/20 transition-all duration-300" />
                        <div className="relative w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 rounded-2xl flex flex-col items-center justify-center ring-2 ring-indigo-200/50 dark:ring-indigo-800/50 border border-indigo-100/50 dark:border-indigo-800/30 group-hover/hidden:ring-indigo-300 dark:group-hover/hidden:ring-indigo-700 transition-all duration-300 backdrop-blur-sm">
                          <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center opacity-60 group-hover/hidden:opacity-100 transition-opacity">
                            <ShieldCheck className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Name - only show if visible */}
                    {member.is_visible === 1 || member.is_visible === true ? (
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {member.name}
                      </h3>
                    ) : null}
                    
                    {/* Role - always show */}
                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {member.role}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShieldCheck className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No leadership members found.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Professionals by Department (Expandable List View) */}
      {viewMode === 'professionals' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3">
            <Users2 className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Professionals</h2>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-850 dark:to-slate-900 rounded-lg animate-pulse border border-slate-200 dark:border-slate-800" />
              ))}
            </div>
          ) : departments.length > 0 ? (
            <div className="space-y-3">
              {departments.map((dept, idx) => {
                const colors = [
                  'from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-900/30 hover:from-blue-100 hover:to-blue-200/50',
                  'from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 border-purple-200 dark:border-purple-900/30 hover:from-purple-100 hover:to-purple-200/50',
                  'from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10 border-emerald-200 dark:border-emerald-900/30 hover:from-emerald-100 hover:to-emerald-200/50',
                  'from-rose-50 to-rose-100/50 dark:from-rose-950/20 dark:to-rose-900/10 border-rose-200 dark:border-rose-900/30 hover:from-rose-100 hover:to-rose-200/50'
                ];
                
                const iconColors = [
                  'from-blue-500 to-blue-600',
                  'from-purple-500 to-purple-600',
                  'from-emerald-500 to-emerald-600',
                  'from-rose-500 to-rose-600'
                ];
                
                return (
                  <div
                    key={dept}
                    className="space-y-2"
                  >
                    <div className={`group relative bg-gradient-to-r ${colors[idx % 4]} border border-slate-200 dark:border-slate-800 rounded-xl px-6 py-4 flex items-center justify-between hover:shadow-md transition-all duration-300`}>
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${iconColors[idx % 4]} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                          <Users2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                            {dept}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm ring-1 ring-white/20 dark:ring-slate-700/20">
                          {departmentGroups[dept].length} {departmentGroups[dept].length === 1 ? 'member' : 'members'}
                        </span>
                        {departmentGroups[dept].some(m => m.is_visible === 1 || m.is_visible === true) && (
                          <button
                            onClick={() => setExpandedDept(expandedDept === dept ? null : dept)}
                            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-all cursor-pointer"
                          >
                            <svg
                              className={`w-5 h-5 transition-transform duration-300 ${expandedDept === dept ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded members list */}
                    {expandedDept === dept && (
                      <div className="pl-6 space-y-3 mt-3">
                        {departmentGroups[dept].map(member => (
                          (member.is_visible === 1 || member.is_visible === true || member.is_visible === undefined) && (
                            <div
                              key={member.id}
                              className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all"
                            >
                              <img
                                src={member.avatar || '/avatars/avatar_default.jpg'}
                                alt={member.name}
                                onError={(e) => { e.currentTarget.src = '/avatars/avatar_default.jpg'; }}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                  {member.name}
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  {member.role}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {member.email && (
                                  <a
                                    href={`mailto:${member.email}`}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    title="Email"
                                  >
                                    <Mail className="w-4 h-4" />
                                  </a>
                                )}
                                {member.linkedin_url && (
                                  <a
                                    href={member.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    title="LinkedIn"
                                  >
                                    <Linkedin className="w-4 h-4" />
                                  </a>
                                )}
                                {member.github_url && (
                                  <a
                                    href={member.github_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    title="GitHub"
                                  >
                                    <Github className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">No team members found.</p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && team.length === 0 && (
        <div className="text-center py-16">
          <Users className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <p className="text-slate-500 dark:text-slate-400">No team members found.</p>
        </div>
      )}
    </div>
  );
};
