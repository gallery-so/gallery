import { Router } from '@reach/router';
import AppContainer from 'scenes/AppContainer/AppContainer';
import Home from 'scenes/Home/Home';
import Auth from 'scenes/Auth/Auth';
import NotFound from 'scenes/NotFound/NotFound';
import Gallery from 'scenes/Gallery/Gallery';
import CollectionCreationFlow from 'scenes/CollectionCreationFlow/CollectionCreationFlow';
import Welcome from 'scenes/Welcome/Welcome';
import AuthenticatedRoute from 'components/AuthenticatedRoute/AuthenticatedRoute';

export default function Routes() {
  return (
    // primary={false} prevents jumpiness on nav: https://github.com/reach/router/issues/242
    <Router primary={false}>
      <AppContainer path="/">
        <Home path="/" />
        <Auth path="/auth" />
        <AuthenticatedRoute Component={Welcome} path="/welcome" />
        <AuthenticatedRoute Component={CollectionCreationFlow} path="/create" />
        <Gallery path="/:usernameOrWalletAddress" />
        <NotFound default path="404" />
      </AppContainer>
    </Router>
  );
}
