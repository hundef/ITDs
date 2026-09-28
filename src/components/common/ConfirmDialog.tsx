import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={onCancel}
      />

      {/* Dialog Card */}
      <div className="relative flex items-center justify-center w-full min-h-screen">
        <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-slide-up">
          {/* Icon */}
          <div className="flex justify-center pt-6 pb-2">
            <div className={`p-3 rounded-full ${isDangerous ? 'bg-rose-50 dark:bg-rose-950/20' : 'bg-amber-50 dark:bg-amber-950/20'}`}>
              <AlertTriangle className={`w-6 h-6 ${isDangerous ? 'text-rose-600' : 'text-amber-600'}`} />
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {/* Title */}
            <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center mb-2">
              {title}
            </h3>

            {/* Message */}
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center leading-relaxed mb-6">
              {message}
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 px-4 py-2.5 rounded-lg text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDangerous
                    ? 'bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-800'
                    : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800'
                }`}
              >
                {isLoading ? 'Processing...' : confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
