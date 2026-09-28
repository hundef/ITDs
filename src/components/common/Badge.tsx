import React from 'react';
import { ProjectStatus, UserRole } from '../../types';
import { CheckCircle2, Clock, Calendar, AlertCircle, Shield, User, Briefcase, FileEdit } from 'lucide-react';

export const StatusBadge: React.FC<{ status: ProjectStatus | string; className?: string }> = ({ status, className = '' }) => {
  const norm = (status || '').toLowerCase();

  if (norm === 'completed') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5" />
        Completed
      </span>
    );
  }

  if (norm === 'ongoing') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 ${className}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
        </span>
        Ongoing
      </span>
    );
  }

  if (norm === 'upcoming') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 ${className}`}>
        <Calendar className="w-3.5 h-3.5" />
        Upcoming
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 ${className}`}>
      <AlertCircle className="w-3.5 h-3.5" />
      {status}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: UserRole | string; className?: string }> = ({ role, className = '' }) => {
  const norm = (role || '').toLowerCase();

  if (norm === 'super_admin') {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 ${className}`}>
        <Shield className="w-3 h-3" /> Super Admin
      </span>
    );
  }

  if (norm === 'administrator') {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30 ${className}`}>
        <Shield className="w-3 h-3" /> Administrator
      </span>
    );
  }

  if (norm === 'project_manager') {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 ${className}`}>
        <Briefcase className="w-3 h-3" /> Project Manager
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 ${className}`}>
      <FileEdit className="w-3 h-3" /> Content Manager
    </span>
  );
};

export const CategoryBadge: React.FC<{ name: string; color?: string; className?: string }> = ({ name, color = '#6366f1', className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}
      style={{
        backgroundColor: `${color}15`,
        borderColor: `${color}40`,
        color: color
      }}
    >
      {name}
    </span>
  );
};

export const TechBadge: React.FC<{ name: string; color?: string; className?: string }> = ({ name, color = '#3b82f6', className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700/80 shadow-2xs ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color || '#6366f1' }} />
      {name}
    </span>
  );
};
