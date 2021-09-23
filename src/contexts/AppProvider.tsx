import { SwrProvider } from './swr/SwrContext';
import Boundary from './boundary/Boundary';
import AuthProvider from './auth/AuthContext';
import ModalProvider from './modal/ModalContext';
import ErrorPillProvider from './error/ErrorPillContext';

type Props = {
  children: React.ReactNode;
};

export default function AppProvider({ children }: Props) {
  return (
    <Boundary>
      <ErrorPillProvider>
        <AuthProvider>
          <SwrProvider>
            <ModalProvider>{children}</ModalProvider>
          </SwrProvider>
        </AuthProvider>
      </ErrorPillProvider>
    </Boundary>
  );
}
