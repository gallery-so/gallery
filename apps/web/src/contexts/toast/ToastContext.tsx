import { createContext, memo, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { GalleryElementTrackingProps } from 'shared/contexts/AnalyticsContext';

import { noop } from '~/shared/utils/noop';

import { AnimatedToast } from './Toast';

type DismissToastHandler = () => void;
type ToastVariant = 'success' | 'error';

export type ToastButtonProps = {
  label: string;
  onClick: () => void;
  eventProperties: GalleryElementTrackingProps;
};

type ToastProps = {
  message: string;
  onDismiss?: DismissToastHandler;
  autoClose?: boolean;
  variant?: ToastVariant;
  buttonProps?: ToastButtonProps;
};

type ToastActions = {
  pushToast: ({ message, onDismiss, autoClose, variant, buttonProps }: ToastProps) => void;
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
  message: string;
  onDismiss: DismissToastHandler;
  autoClose: boolean;
  variant: ToastVariant;
  buttonProps?: ToastButtonProps;
};

type Props = { children: ReactNode };

const ToastProvider = memo(({ children }: Props) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const pushToast = useCallback(
    ({
      message,
      onDismiss = noop,
      autoClose = true,
      variant = 'success',
      buttonProps,
    }: ToastProps) => {
      setToasts((previousMessages) => [
        ...previousMessages,
        { message, onDismiss, autoClose, id: Date.now().toString(), variant, buttonProps },
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
      {toasts.map(({ message, autoClose, id, variant, buttonProps }) => (
        <AnimatedToast
          data-testid={id}
          key={id}
          message={message}
          onClose={() => dismissToast(id)}
          autoClose={autoClose}
          variant={variant}
          buttonProps={buttonProps}
        />
      ))}
      {children}
    </ToastActionsContext.Provider>
  );
});

ToastProvider.displayName = 'ToastProvider';

export default ToastProvider;
