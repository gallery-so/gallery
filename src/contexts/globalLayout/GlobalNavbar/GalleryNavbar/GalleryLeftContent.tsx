import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { GalleryLeftContentFragment$key } from '../../../../../__generated__/GalleryLeftContentFragment.graphql';
import { ProfileDropdown } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/ProfileDropdown';
import NavActionFollow from 'components/Follow/NavActionFollow';

type Props = {
  queryRef: GalleryLeftContentFragment$key;
};

export default function GalleryLeftContent({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment GalleryLeftContentFragment on Query {
        ...ProfileDropdownFragment
        ...BreadcrumbsUsernameBreadcrumb
        ...NavActionFollowQueryFragment

        userByUsername(username: $username) {
          ...NavActionFollowUserFragment
        }
      }
    `,
    queryRef
  );

  const user = query.userByUsername;

  return (
    <ProfileDropdown
      queryRef={query}
      rightContent={user ? <NavActionFollow userRef={user} queryRef={query} /> : null}
    />
  );
}
