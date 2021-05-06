import { Router } from '@reach/router';
import AppContainer from 'scenes/AppContainer/AppContainer';
import Home from 'scenes/Home/Home';
import NotFound from 'scenes/NotFound/NotFound';
import Gallery from 'scenes/Gallery/Gallery';
import OnboardingFlow from 'flows/OnboardingFlow/OnboardingFlow';
import AuthenticatedRoute from 'components/AuthenticatedRoute/AuthenticatedRoute';

export default function Routes() {
  return (
    // primary={false} prevents jumpiness on nav: https://github.com/reach/router/issues/242
    <Router primary={false}>
      <AppContainer path="/">
        <Home path="/" />
        {/* might use this in the future: <Auth path="/auth" /> */}
        <AuthenticatedRoute Component={OnboardingFlow} path="/welcome" />
        <Gallery path="/:usernameOrWalletAddress" />
        <NotFound default path="404" />
      </AppContainer>
    </Router>
  );
}
