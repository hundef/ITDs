import React from 'react';
import { ProjectWorkflow } from '../../types';
import {
  UploadCloud,
  Cpu,
  Search,
  CheckCircle2,
  Shield,
  Radio,
  BarChart2,
  Sliders,
  CheckSquare,
  UserCheck,
  PhoneCall,
  CheckCircle,
  Key,
  Database,
  Send,
  Server,
  Activity,
  Smartphone,
  ShieldCheck,
  Lock,
  RefreshCw,
  Globe,
  CreditCard,
  Truck,
  CloudSun,
  BarChart
} from 'lucide-react';

const iconMap: Record<string, any> = {
  UploadCloud,
  Cpu,
  Search,
  CheckCircle2,
  Shield,
  Radio,
  BarChart2,
  Sliders,
  CheckSquare,
  UserCheck,
  PhoneCall,
  CheckCircle,
  Key,
  Database,
  Send,
  Server,
  Activity,
  Smartphone,
  ShieldCheck,
  Lock,
  RefreshCw,
  Globe,
  CreditCard,
  Truck,
  CloudSun,
  BarChart
};

interface WorkflowTimelineProps {
  workflows: ProjectWorkflow[];
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({ workflows }) => {
  if (!workflows || workflows.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="relative pl-6 sm:pl-8 border-l-2 border-indigo-500/30 dark:border-indigo-500/30 space-y-10">
        {workflows.map((wf, idx) => {
          const Icon = iconMap[wf.icon] || Cpu;
          return (
            <div key={idx} className="relative group">
              {/* Step indicator node */}
              <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-slate-900 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs sm:text-sm shadow-md group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                {wf.step_number || (idx + 1)}
              </div>

              {/* Step Content Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-xs hover:shadow-md transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
                    <Icon className="w-5 h-5 text-indigo-500 shrink-0" />
                    <span>{wf.title}</span>
                  </h4>

                  {wf.actor && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      Actor: {wf.actor}
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {wf.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
