import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { FeedLeftContentFragment$key } from '__generated__/FeedLeftContentFragment.graphql';
import { ProfileDropdown } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/ProfileDropdown';
import { HomeText } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/Breadcrumbs';

type FeedLeftContentProps = {
  queryRef: FeedLeftContentFragment$key;
};

export function FeedLeftContent({ queryRef }: FeedLeftContentProps) {
  const query = useFragment(
    graphql`
      fragment FeedLeftContentFragment on Query {
        ...ProfileDropdownFragment
      }
    `,
    queryRef
  );

  return <ProfileDropdown queryRef={query} rightContent={<HomeText>Home</HomeText>} />;
}
