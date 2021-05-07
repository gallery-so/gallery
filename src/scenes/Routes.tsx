import { Location, Router } from '@reach/router';
import AuthenticatedRoute from 'components/AuthenticatedRoute/AuthenticatedRoute';
import Home from 'scenes/Home/Home';
import Auth from 'scenes/Auth/Auth';
import Password from 'scenes/Password/Password';
import NotFound from 'scenes/NotFound/NotFound';
import Gallery from 'scenes/Gallery/Gallery';
import OnboardingFlow from 'flows/OnboardingFlow/OnboardingFlow';
import EditGalleryFlow from 'flows/EditGalleryFlow/EditGalleryFlow';
import FadeTransitioner from 'flows/OnboardingFlow/FadeTransitioner';

export default function Routes() {
  return (
    <Location>
      {({ location }) => (
        <FadeTransitioner nodeKey={location.key ?? ''}>
          {/* primary={false} prevents jumpiness on nav: https://github.com/reach/router/issues/242 */}
          <Router primary={false} location={location}>
            <Home path="/" />
            <Auth path="/auth" />
            <Password path="/password" />
            <AuthenticatedRoute Component={OnboardingFlow} path="/welcome" />
            <AuthenticatedRoute Component={EditGalleryFlow} path="/edit" />
            <Gallery path="/:usernameOrWalletAddress" />
            <NotFound default path="404" />
          </Router>
        </FadeTransitioner>
      )}
    </Location>
  );
}
