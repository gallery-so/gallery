import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import NavActionFollow from '~/components/Follow/NavActionFollow';
import { ProfileDropdown } from '~/contexts/globalLayout/GlobalNavbar/ProfileDropdown/ProfileDropdown';
import { GalleryLeftContentFragment$key } from '~/generated/GalleryLeftContentFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';

type Props = {
  queryRef: GalleryLeftContentFragment$key;
};

export default function GalleryLeftContent({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment GalleryLeftContentFragment on Query {
        ...NavActionFollowQueryFragment
        ...ProfileDropdownFragment

        userByUsername(username: $username) {
          ...NavActionFollowUserFragment
        }
      }
    `,
    queryRef
  );

  const user = query.userByUsername;

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const rightContent = useMemo(() => {
    if (isMobile) {
      return null;
    } else if (user) {
      return <NavActionFollow userRef={user} queryRef={query} />;
    } else {
      return null;
    }
  }, [isMobile, query, user]);

  return <ProfileDropdown queryRef={query} rightContent={rightContent} />;
}
