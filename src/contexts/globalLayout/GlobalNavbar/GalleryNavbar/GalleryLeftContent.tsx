import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { GalleryLeftContentFragment$key } from '../../../../../__generated__/GalleryLeftContentFragment.graphql';
import NavActionFollow from 'components/Follow/NavActionFollow';
import { ProfileDropdownOrSignInButton } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdownOrSignInButton';

type Props = {
  queryRef: GalleryLeftContentFragment$key;
};

export default function GalleryLeftContent({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment GalleryLeftContentFragment on Query {
        ...BreadcrumbsUsernameBreadcrumb
        ...NavActionFollowQueryFragment
        ...ProfileDropdownOrSignInButtonFragment

        userByUsername(username: $username) {
          ...NavActionFollowUserFragment
        }
      }
    `,
    queryRef
  );

  const user = query.userByUsername;

  return (
    <ProfileDropdownOrSignInButton
      queryRef={query}
      profileRightContent={user ? <NavActionFollow userRef={user} queryRef={query} /> : null}
    />
  );
}
