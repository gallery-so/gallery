import { SwrProvider } from './swr/SwrContext';
import Boundary from './boundary/Boundary';
import AuthProvider from './auth/AuthContext';
import ModalProvider from './modal/ModalContext';
import ToastProvider from './toast/ToastContext';

type Props = {
  children: React.ReactNode;
};

export default function AppProvider({ children }: Props) {
  return (
    <Boundary>
      <ToastProvider>
        <AuthProvider>
          <SwrProvider>
            <ModalProvider>{children}</ModalProvider>
          </SwrProvider>
        </AuthProvider>
      </ToastProvider>
    </Boundary>
  );
}
