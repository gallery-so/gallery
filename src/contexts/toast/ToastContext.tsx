import { createContext, memo, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatedToast } from './Toast';

type DismissToastHandler = () => void;

type ToastActions = {
  pushToast: (message: string, onDismiss?: DismissToastHandler, autoClose?: boolean) => void;
  dismissToast: () => void;
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

const noop = () => {};

type ToastType = {
  message: string;
  onDismiss: DismissToastHandler;
  autoClose: boolean;
};

type Props = { children: ReactNode };

const ToastProvider = memo(({ children }: Props) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const pushToast = useCallback(
    (message: string, onDismiss: DismissToastHandler = noop, autoClose: boolean = false) => {
      setToasts((previousMessages) => [...previousMessages, { message, onDismiss, autoClose }]);
    },
    []
  );

  // TODO: allow consumer to specify which toast to dismissbyID
  const dismissToast = useCallback(() => {
    setToasts((previousMessages) => {
      if (previousMessages.length === 0) {
        return previousMessages;
      }

      const toastToDismiss = previousMessages[previousMessages.length - 1];
      toastToDismiss.onDismiss();
      return previousMessages.slice(0, -1);
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
      {toasts.map(({ message, autoClose }) => (
        <AnimatedToast
          key={message}
          message={message}
          onClose={dismissToast}
          autoClose={autoClose}
        />
      ))}
      {children}
    </ToastActionsContext.Provider>
  );
});

export default ToastProvider;
