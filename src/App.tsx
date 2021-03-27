import { SwrProvider } from 'contexts/swr/SwrContext';
import Boundary from 'contexts/boundary/Boundary';
import AuthProvider from 'contexts/auth/Auth';
import ModalProvider from 'contexts/modal/ModalContext';
import Routes from 'scenes/Routes';

function App() {
  return (
    <Boundary>
      <AuthProvider>
        <SwrProvider>
          <ModalProvider>
            <Routes />
          </ModalProvider>
        </SwrProvider>
      </AuthProvider>
    </Boundary>
  );
}

export default App;
