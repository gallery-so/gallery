import { HStack } from 'components/core/Spacer/Stack';
import { NavbarLink } from 'contexts/globalLayout/GlobalNavbar/NavbarLink';
import Link from 'next/link';
import { useRouter } from 'next/router';
import isFeatureEnabled, { FeatureFlag } from 'utils/graphql/isFeatureEnabled';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { GalleryNavLinksFragment$key } from '../../../../../__generated__/GalleryNavLinksFragment.graphql';

type Props = {
  username: string;
  queryRef: GalleryNavLinksFragment$key;
};

export function GalleryNavLinks({ username, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment GalleryNavLinksFragment on Query {
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const { pathname } = useRouter();

  const galleriesUrl = `/${username}/galleries`;
  const followersUrl = `/${username}/followers`;
  const activityUrl = `/${username}/activity`;

  const isWhiteRinoEnabled = isFeatureEnabled(FeatureFlag.WHITE_RINO, query);

  return (
    <HStack gap={8}>
      <Link href={galleriesUrl}>
        <NavbarLink href={galleriesUrl} active={pathname === '/[username]/galleries'}>
          Galleries
        </NavbarLink>
      </Link>

      <Link href={followersUrl}>
        <NavbarLink href={followersUrl} active={pathname === '/[username]/followers'}>
          Followers
        </NavbarLink>
      </Link>

      {isWhiteRinoEnabled && (
        <Link href={activityUrl}>
          <NavbarLink href={activityUrl} active={pathname === '/[username]/activity'}>
            Activity
          </NavbarLink>
        </Link>
      )}
    </HStack>
  );
}
