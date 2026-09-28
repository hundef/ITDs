import { useState, useCallback } from 'react';

export interface ConfirmOptions {
  title?: string;
  isDangerous?: boolean;
}

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  isDangerous: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    isDangerous: false,
    onConfirm: () => {},
    onCancel: () => {}
  });

  const confirm = useCallback((message: string, options: ConfirmOptions = {}): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title || 'Confirm Action',
        message,
        isDangerous: options.isDangerous || false,
        onConfirm: () => {
          resolve(true);
          setConfirmState(prev => ({ ...prev, isOpen: false }));
        },
        onCancel: () => {
          resolve(false);
          setConfirmState(prev => ({ ...prev, isOpen: false }));
        }
      });
    });
  }, []);

  return {
    confirm,
    confirmState,
    closeConfirm: () => setConfirmState(prev => ({ ...prev, isOpen: false }))
  };
};
