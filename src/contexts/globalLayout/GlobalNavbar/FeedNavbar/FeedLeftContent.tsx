import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { FeedLeftContentFragment$key } from '__generated__/FeedLeftContentFragment.graphql';
import { ProfileDropdownOrSignInButton } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdownOrSignInButton';
import { HomeText } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/Breadcrumbs';

type FeedLeftContentProps = {
  queryRef: FeedLeftContentFragment$key;
};

export function FeedLeftContent({ queryRef }: FeedLeftContentProps) {
  const query = useFragment(
    graphql`
      fragment FeedLeftContentFragment on Query {
        ...ProfileDropdownOrSignInButtonFragment
      }
    `,
    queryRef
  );

  return (
    <ProfileDropdownOrSignInButton
      queryRef={query}
      profileRightContent={<HomeText>Home</HomeText>}
    />
  );
}
