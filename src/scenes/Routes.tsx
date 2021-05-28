import { Location, Router } from '@reach/router';
import AuthenticatedRoute from 'components/AuthenticatedRoute/AuthenticatedRoute';
import GlobalNavbar from 'components/GlobalNavbar/GlobalNavbar';
import GlobalFooter from 'components/GlobalFooter/GlobalFooter';
import FadeTransitioner from 'components/FadeTransitioner/FadeTransitioner';
import Home from 'scenes/Home/Home';
import Auth from 'scenes/Auth/Auth';
import Password from 'scenes/Password/Password';
import NotFound from 'scenes/NotFound/NotFound';
import Gallery from 'scenes/Gallery/Gallery';
import NftDetailPage from 'scenes/NftDetailPage/NftDetailPage';
import OnboardingFlow from 'flows/OnboardingFlow/OnboardingFlow';
import EditGalleryFlow from 'flows/EditGalleryFlow/EditGalleryFlow';

import CoolIntro from 'scenes/CoolIntro/CoolIntro';

// considered putting this in a different file, but we should tightly couple
// route updates to this array
const ROUTES_WITHOUT_NAVBAR = ['/', '/auth', '/password', '/welcome', '/edit'];
const ROUTES_WITH_FOOTER = ['/welcome', '/edit'];

function shouldHideNavbar(pathname: string) {
  return ROUTES_WITHOUT_NAVBAR.reduce(
    (prev, curr) => prev || curr.includes(pathname),
    false
  );
}

function shouldHideFooter(pathname: string) {
  return ROUTES_WITH_FOOTER.find((route) => route === pathname);
}

export default function Routes() {
  return (
    <Location>
      {({ location }) => (
        <>
          {shouldHideNavbar(location.pathname) ? null : <GlobalNavbar />}
          <FadeTransitioner nodeKey={location.key}>
            {/* primary={false} prevents jumpiness on nav: https://github.com/reach/router/issues/242 */}
            <Router primary={false} location={location}>
              <Home path="/" />
              <Auth path="/auth" />
              <Password path="/password" />
              <AuthenticatedRoute Component={OnboardingFlow} path="/welcome" />
              <AuthenticatedRoute Component={EditGalleryFlow} path="/edit" />
              {/* TODO: this route should be part of the onboarding flow */}
              {/* <CoolIntro path="/intro" /> */}
              <NotFound path="/404" />
              <NftDetailPage path="/:userName/:collectionId/:nftId" />
              <Gallery path="/:usernameOrWalletAddress" />
            </Router>
          </FadeTransitioner>
          {shouldHideFooter(location.pathname) ? null : <GlobalFooter />}
        </>
      )}
    </Location>
  );
}
