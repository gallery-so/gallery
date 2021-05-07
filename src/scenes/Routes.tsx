import { Router } from '@reach/router';
import AuthenticatedRoute from 'components/AuthenticatedRoute/AuthenticatedRoute';
import AppContainer from 'scenes/AppContainer/AppContainer';
import Home from 'scenes/Home/Home';
import NotFound from 'scenes/NotFound/NotFound';
import Gallery from 'scenes/Gallery/Gallery';
import NftDetailPage from 'scenes/NftDetailPage/NftDetailPage';
import OnboardingFlow from 'flows/OnboardingFlow/OnboardingFlow';
import EditGalleryFlow from 'flows/EditGalleryFlow/EditGalleryFlow';

export default function Routes() {
  return (
    // primary={false} prevents jumpiness on nav: https://github.com/reach/router/issues/242
    <Router primary={false}>
      <AppContainer path="/">
        <Home path="/" />
        {/* might use this in the future: <Auth path="/auth" /> */}
        <AuthenticatedRoute Component={OnboardingFlow} path="/welcome" />
        <AuthenticatedRoute Component={EditGalleryFlow} path="/edit" />
        <NftDetailPage path="/nft" />
        <Gallery path="/:usernameOrWalletAddress" />
        <NotFound default path="404" />
      </AppContainer>
    </Router>
  );
}
