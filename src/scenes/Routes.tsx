import { Location, Router } from '@reach/router';
import AuthenticatedRoute from 'components/AuthenticatedRoute/AuthenticatedRoute';
import GlobalNavbar from 'components/core/Page/Navbar';
import GlobalFooter from 'components/core/Page/Footer';
import FadeTransitioner from 'components/FadeTransitioner/FadeTransitioner';
import OnboardingFlow from 'flows/OnboardingFlow/OnboardingFlow';
import EditGalleryFlow from 'flows/EditGalleryFlow/EditGalleryFlow';
import Home from './Home/Home';
import Auth from './Auth/Auth';
import Password from './Password/Password';
import NotFound from './NotFound/NotFound';
import NftDetailPage from './NftDetailPage/NftDetailPage';
import Nuke from './Nuke/Nuke';
import UserGalleryPage from './UserGalleryPage/UserGalleryPage';

// Considered putting this in a different file, but we should tightly couple
// route updates to this array
const ROUTES_WITHOUT_NAVBAR = [
  '/',
  '/auth',
  '/password',
  '/welcome',
  '/edit',
  '/nuke',
];
const ROUTES_WITH_FOOTER = ['/welcome', '/edit'];

function shouldHideNavbar(pathname: string) {
  return ROUTES_WITHOUT_NAVBAR.reduce(
    (previous, curr) => previous || curr.includes(pathname),
    false,
  );
}

function shouldHideFooter(pathname: string) {
  return ROUTES_WITH_FOOTER.find(route => route === pathname);
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
              <NotFound path="/404" />
              <Nuke path="/nuke" />
              <NftDetailPage path="/:userName/:collectionId/:nftId" />
              <UserGalleryPage path="/:username" />
            </Router>
          </FadeTransitioner>
          {shouldHideFooter(location.pathname) ? null : <GlobalFooter />}
        </>
      )}
    </Location>
  );
}
