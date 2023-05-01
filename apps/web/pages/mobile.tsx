import { graphql, useLazyLoadQuery } from "react-relay";

import { BasicNavbar } from "~/contexts/globalLayout/GlobalNavbar/BasicNavbar/BasicNavbar";
import { StandardSidebar } from "~/contexts/globalLayout/GlobalSidebar/StandardSidebar";
import { mobileQuery } from "~/generated/mobileQuery.graphql";
import GalleryRoute from "~/scenes/_Router/GalleryRoute";
import MobileAppLandingPage from "~/scenes/ContentPages/MobileAppLandingPage";

export default function Mobile() {
  const query = useLazyLoadQuery<mobileQuery>(
    graphql`
    query mobileQuery{
        ...StandardSidebarFragment
        ...BasicNavbarFragment
    }`,{}
  )

  return <GalleryRoute
    navbar={<BasicNavbar queryRef={query} />}
    sidebar={<StandardSidebar queryRef={query}/>}
    element={<MobileAppLandingPage  />}
  />;
}