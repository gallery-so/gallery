import { createContext, memo, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { CornerErrorPill } from './ErrorPill';

type ErrorPillActions = {
  pushError: (error: string) => void;
  dismissError: () => void;
  dismissAllErrors: () => void;
};

const ErrorPillActionsContext = createContext<ErrorPillActions | undefined>(undefined);

export const useErrorPillActions = (): ErrorPillActions => {
  const context = useContext(ErrorPillActionsContext);
  if (!context) {
    throw new Error('Attempted to use ErrorPillActionsContext without a provider!');
  }

  return context;
};

type Props = { children: ReactNode };

const ErrorPillProvider = memo(({ children }: Props) => {
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
    <ErrorPillActionsContext.Provider value={value}>
      {errors.map(error => <CornerErrorPill key={error} message={error} onClose={dismissError} />)}
      {children}
    </ErrorPillActionsContext.Provider>
  );
});

export default ErrorPillProvider;

