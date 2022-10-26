import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { GalleryLeftContentFragment$key } from '../../../../../__generated__/GalleryLeftContentFragment.graphql';
import NavActionFollow from 'components/Follow/NavActionFollow';
import { useBreakpoint } from 'hooks/useWindowSize';
import { useMemo } from 'react';
import { size } from 'components/core/breakpoints';
import { ProfileDropdown } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/ProfileDropdown';

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

  const breakpoint = useBreakpoint();

  const rightContent = useMemo(() => {
    if (breakpoint === size.mobile) {
      return null;
    } else if (user) {
      return <NavActionFollow userRef={user} queryRef={query} />;
    } else {
      return null;
    }
  }, [breakpoint, query, user]);

  return <ProfileDropdown queryRef={query} rightContent={rightContent} />;
}
