import React from 'react';
import { ProjectResult } from '../../types';
import { TrendingUp, Award, Zap, CheckCircle2 } from 'lucide-react';

interface ResultsMetricsProps {
  results: ProjectResult[];
}

export const ResultsMetrics: React.FC<ResultsMetricsProps> = ({ results }) => {
  if (!results || results.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {results.map((res, idx) => (
        <div
          key={idx}
          className="bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-850 dark:to-slate-900 rounded-2xl p-6 border border-indigo-100 dark:border-slate-800 shadow-xs flex flex-col justify-between"
        >
          <div className="space-y-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 font-sans tracking-tight">
              {res.metric_value}
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {res.metric_label}
            </h4>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 leading-relaxed">
            {res.description}
          </p>
        </div>
      ))}
    </div>
  );
};
