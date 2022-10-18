import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { GalleryLeftContentFragment$key } from '../../../../../__generated__/GalleryLeftContentFragment.graphql';
import { ProfileDropdown } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/ProfileDropdown';
import { UsernameBreadcrumb } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/Breadcrumbs';

type Props = {
  queryRef: GalleryLeftContentFragment$key;
};

export default function GalleryLeftContent({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment GalleryLeftContentFragment on Query {
        ...ProfileDropdownFragment
        ...BreadcrumbsUsernameBreadcrumb
      }
    `,
    queryRef
  );

  return (
    <ProfileDropdown queryRef={query} rightContent={<UsernameBreadcrumb queryRef={query} />} />
  );
}
