import Home from 'scenes/Home/Home';
import AuthDemo from 'scenes/AuthDemo/AuthDemo';
import { SwrProvider } from 'contexts/swr/SwrContext';
import Boundary from 'contexts/boundary/Boundary';
import Auth from 'contexts/auth/Auth';

function App() {
  return (
    <Boundary>
      <Auth>
        <SwrProvider>
          <Home />
          <AuthDemo />
        </SwrProvider>
      </Auth>
    </Boundary>
  );
}

export default App;
