import React from 'react';
import { ProjectFeature } from '../../types';
import {
  Zap,
  FileCheck,
  ShieldCheck,
  Lock,
  BarChart3,
  Activity,
  TrendingUp,
  GitMerge,
  Layers,
  Video,
  Mic,
  GitPullRequest,
  FileText,
  CheckSquare,
  DollarSign,
  Shield,
  MapPin,
  Thermometer,
  Wrench,
  Navigation,
  Key,
  CreditCard,
  CheckCircle,
  Sparkles,
  Sun,
  TrendingDown,
  Award
} from 'lucide-react';

const iconMap: Record<string, any> = {
  Zap,
  FileCheck,
  ShieldCheck,
  Lock,
  BarChart3,
  Activity,
  TrendingUp,
  GitMerge,
  Layers,
  Video,
  Mic,
  GitPullRequest,
  FileText,
  CheckSquare,
  DollarSign,
  Shield,
  MapPin,
  Thermometer,
  Wrench,
  Navigation,
  Key,
  CreditCard,
  CheckCircle,
  Sparkles,
  Sun,
  TrendingDown,
  Award
};

interface FeaturesGridProps {
  features: ProjectFeature[];
}

export const FeaturesGrid: React.FC<FeaturesGridProps> = ({ features }) => {
  if (!features || features.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {features.map((feat, idx) => {
        const Icon = iconMap[feat.icon] || Zap;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 shadow-xs hover:shadow-md transition-all flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-2xs">
              <Icon className="w-6 h-6" />
            </div>

            <div className="space-y-1.5 min-w-0">
              <h4 className="text-base font-bold text-slate-900 dark:text-white font-sans">
                {feat.title}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {feat.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
