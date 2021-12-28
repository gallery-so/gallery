import { Location, Router } from '@reach/router';
import GalleryAuthenticatedRoute from 'scenes/_Router/GalleryAuthenticatedRoute';
import FadeTransitioner from 'components/FadeTransitioner/FadeTransitioner';
import OnboardingFlow from 'flows/OnboardingFlow/OnboardingFlow';
import EditGalleryFlow from 'flows/EditGalleryFlow/EditGalleryFlow';
import GalleryNavigationContextProvider from 'contexts/navigation/GalleryNavigationContext';
import GoldMembershipMintPage from 'scenes/MembershipMintPage/GoldMembershipMintPage';
import Home from '../Home/Home';
import Auth from '../Auth/Auth';
import NftDetailPage from '../NftDetailPage/NftDetailPage';
import Nuke from '../Nuke/Nuke';
import UserGalleryPage from '../UserGalleryPage/UserGalleryPage';
import GalleryRoute from './GalleryRoute';
import SilverMembershipMintPage from 'scenes/MembershipMintPage/SilverMembershipMintPage';
import MemberListPage from 'scenes/MemberListPage/MemberListPage';

export default function Routes() {
  return (
    <Location>
      {({ location }) => (
        <GalleryNavigationContextProvider locationKey={location.key} pathname={location.pathname}>
          <FadeTransitioner>
            <Router
              primary={false} // prevents jumpiness on nav: https://github.com/reach/router/issues/242
              location={location}
            >
              <GalleryRoute path="/" component={Home} navbar={false} footerVisibleOutOfView />
              <GalleryRoute path="/auth" component={Auth} navbar={false} footerVisibleOutOfView />
              <GalleryAuthenticatedRoute path="/welcome" component={OnboardingFlow} freshLayout />
              <GalleryAuthenticatedRoute path="/edit" component={EditGalleryFlow} freshLayout />
              <GalleryRoute path="/members" component={MemberListPage} />
              <GalleryRoute
                path="/membership/silver"
                component={SilverMembershipMintPage}
                navbar={false}
              />
              {/* <GalleryRoute
                path="/membership/white"
                component={WhiteMembershipMintPage}
                navbar={false}
              /> */}
              <GalleryRoute
                path="/membership/gold"
                component={GoldMembershipMintPage}
                navbar={false}
              />
              <GalleryRoute path="/nuke" component={Nuke} navbar={false} />
              <GalleryRoute path="/:userName/:collectionId/:nftId" component={NftDetailPage} />
              <GalleryRoute path="/:username" component={UserGalleryPage} />
            </Router>
          </FadeTransitioner>
        </GalleryNavigationContextProvider>
      )}
    </Location>
  );
}
