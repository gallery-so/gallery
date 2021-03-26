import { SwrProvider } from 'contexts/swr/SwrContext';
import Boundary from 'contexts/boundary/Boundary';
import Auth from 'contexts/auth/Auth';
import Routes from 'scenes/Routes';

function App() {
  return (
    <Boundary>
      <Auth>
        <SwrProvider>
          <Routes />
        </SwrProvider>
      </Auth>
    </Boundary>
  );
}

export default App;
