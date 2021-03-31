import { Router } from '@reach/router';
import AppContainer from 'scenes/AppContainer/AppContainer';
import Home from 'scenes/Home/Home';
import Auth from 'scenes/Auth/Auth';
import NotFound from 'scenes/NotFound/NotFound';
import Gallery from 'scenes/Gallery/Gallery';

export default function Routes() {
  return (
    <>
      <Router>
        <AppContainer path="/">
          <Home path="/" />
          <Auth path="/auth" />
          <Gallery path="/:usernameOrWalletAddress" />
          <NotFound default path="404" />
        </AppContainer>
      </Router>
    </>
  );
}
