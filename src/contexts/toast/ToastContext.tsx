import { createContext, memo, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatedToast } from './Toast';

type ToastActions = {
  pushError: (error: string) => void;
  dismissError: () => void;
  dismissAllErrors: () => void;
};

const ToastActionsContext = createContext<ToastActions | undefined>(undefined);

export const useToastActions = (): ToastActions => {
  const context = useContext(ToastActionsContext);
  if (!context) {
    throw new Error('Attempted to use ToastActionsContext without a provider!');
  }

  return context;
};

type Props = { children: ReactNode };

const ToastProvider = memo(({ children }: Props) => {
  const [errors, setErrors] = useState<string[]>([]);

  const pushError = useCallback((error: string) => {
    setErrors(previousErrors => [...previousErrors, error]);
  }, []);

  const dismissError = useCallback(() => {
    setErrors(previousErrors => previousErrors.slice(0, -1));
  }, []);

  const dismissAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const value = useMemo(() => ({
    pushError, dismissError, dismissAllErrors,
  }), [pushError, dismissError, dismissAllErrors]);

  return (
    <ToastActionsContext.Provider value={value}>
      {errors.map(error => <AnimatedToast key={error} message={error} onClose={dismissError} />)}
      {children}
    </ToastActionsContext.Provider>
  );
});

export default ToastProvider;

