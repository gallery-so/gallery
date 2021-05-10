import Routes from 'scenes/Routes';
import AppProvider from './contexts/AppProvider';

function App() {
  return (
    <AppProvider>
      <Routes />
    </AppProvider>
  );
}

export default App;
