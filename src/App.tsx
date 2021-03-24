import { SwrProvider } from './contexts/swr/SwrContext';
import Home from './scenes/Home/Home';

function App() {
  return (
    <SwrProvider>
      <Home />
    </SwrProvider>
  );
}

export default App;
