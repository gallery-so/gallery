import { SwrProvider } from './swr/SwrContext';
import Boundary from './boundary/Boundary';
import AuthProvider from './auth/AuthContext';
import ModalProvider from './modal/ModalContext';
import ToastProvider from './toast/ToastContext';
import { Web3ProviderNetwork } from './auth/Web3WalletContext';

type Props = {
  children: React.ReactNode;
};

export default function AppProvider({ children }: Props) {
  return (
    <Boundary>
      <ToastProvider>
        <AuthProvider>
          <Web3ProviderNetwork>
            <SwrProvider>
              <ModalProvider>{children}</ModalProvider>
            </SwrProvider>
          </Web3ProviderNetwork>
        </AuthProvider>
      </ToastProvider>
    </Boundary>
  );
}
