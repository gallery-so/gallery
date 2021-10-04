import Routes from 'scenes/_Router/Router';
import AppProvider from './contexts/AppProvider';

function App() {
  return (
    <AppProvider>
      <Routes />
    </AppProvider>
  );
}

export default App;
