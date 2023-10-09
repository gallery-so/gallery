import { createContext, memo, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { AnimatedToast } from '~/components/Toast/Toast';
import { noop } from '~/shared/utils/noop';

type DismissToastHandler = () => void;

type ToastProps = {
  message?: string;
  onDismiss?: DismissToastHandler;
  autoClose?: boolean;
  children?: ReactNode;
  withoutNavbar?: boolean;
};

type ToastActions = {
  pushToast: ({
    message,
    onDismiss,
    autoClose,
    children,
    withoutNavbar = false,
  }: ToastProps) => void;
  dismissToast: (id: string) => void;
  dismissAllToasts: () => void;
};

const ToastActionsContext = createContext<ToastActions | undefined>(undefined);

export const useToastActions = (): ToastActions => {
  const context = useContext(ToastActionsContext);
  if (!context) {
    throw new Error('Attempted to use ToastActionsContext without a provider!');
  }

  return context;
};

type ToastType = {
  id: string;
  message?: string;
  onDismiss: DismissToastHandler;
  autoClose: boolean;
  children?: ReactNode;
  withoutNavbar?: boolean;
};

type Props = { children: ReactNode };

const ToastProvider = memo(({ children }: Props) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const pushToast = useCallback(
    ({ message, onDismiss = noop, autoClose = true, children, withoutNavbar }: ToastProps) => {
      setToasts((previousMessages) => [
        ...previousMessages,
        { message, onDismiss, autoClose, id: Date.now().toString(), children, withoutNavbar },
      ]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((previous) => {
      const toastToRemove = previous.find((toast) => toast.id === id);

      if (!toastToRemove) {
        return previous;
      }

      const nextToasts = previous.filter((toast) => toast !== toastToRemove);

      toastToRemove.onDismiss();

      return nextToasts;
    });
  }, []);

  const dismissAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value = useMemo(
    () => ({
      pushToast,
      dismissToast,
      dismissAllToasts,
    }),
    [pushToast, dismissToast, dismissAllToasts]
  );

  return (
    <ToastActionsContext.Provider value={value}>
      {toasts.map(({ message, autoClose, id, children, withoutNavbar }) => (
        <AnimatedToast
          data-testid={id}
          key={id}
          message={message}
          onClose={() => dismissToast(id)}
          autoClose={autoClose}
          withoutNavbar={withoutNavbar}
        >
          {children}
        </AnimatedToast>
      ))}
      {children}
    </ToastActionsContext.Provider>
  );
});

ToastProvider.displayName = 'ToastProvider';

export default ToastProvider;
