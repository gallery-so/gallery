import { createContext, memo, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatedToast } from './Toast';

type ToastActions = {
  pushToast: (message: string) => void;
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

type Props = { children: ReactNode };

const ToastProvider = memo(({ children }: Props) => {
  const [messages, setMessages] = useState<string[]>([]);

  const pushToast = useCallback((message: string) => {
    setMessages(previousMessages => [...previousMessages, message]);
  }, []);

  const dismissToast = useCallback(() => {
    setMessages(previousMessages => previousMessages.slice(0, -1));
  }, []);

  const dismissAllToasts = useCallback(() => {
    setMessages([]);
  }, []);

  const value = useMemo(() => ({
    pushToast, dismissToast, dismissAllToasts,
  }), [pushToast, dismissToast, dismissAllToasts]);

  return (
    <ToastActionsContext.Provider value={value}>
      {messages.map(message => <AnimatedToast key={message} message={message} onClose={dismissToast} />)}
      {children}
    </ToastActionsContext.Provider>
  );
});

export default ToastProvider;

