import Link from 'next/link';
import { useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { GLogo } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GLogo';
import { HomeText } from '~/contexts/globalLayout/GlobalNavbar/ProfileDropdown/Breadcrumbs';
import { NavDownArrow } from '~/contexts/globalLayout/GlobalNavbar/ProfileDropdown/NavDownArrow';
import { ProfileDropdownContent } from '~/contexts/globalLayout/GlobalNavbar/ProfileDropdown/ProfileDropdownContent';
import { FeedLeftContentFragment$key } from '~/generated/FeedLeftContentFragment.graphql';

type FeedLeftContentProps = {
  queryRef: FeedLeftContentFragment$key;
};

export function FeedLeftContent({ queryRef }: FeedLeftContentProps) {
  const query = useFragment(
    graphql`
      fragment FeedLeftContentFragment on Query {
        ...ProfileDropdownContentFragment

        viewer {
          ... on Viewer {
            __typename
          }
        }
      }
    `,
    queryRef
  );

  const [showDropdown, setShowDropdown] = useState(false);

  const isLoggedIn = query.viewer?.__typename === 'Viewer';

  if (!isLoggedIn) {
    return (
      <Link href={{ pathname: '/' }}>
        <GLogoLinkWrapper href="/">
          <GLogo />
        </GLogoLinkWrapper>
      </Link>
    );
  }

  return (
    <HStack
      gap={4}
      align="center"
      role="button"
      style={{ position: 'relative', cursor: 'pointer' }}
      onClick={() => setShowDropdown(true)}
    >
      <HomeText>Home</HomeText>

      <NavDownArrow />

      <ProfileDropdownContent
        showDropdown={showDropdown}
        onClose={() => setShowDropdown(false)}
        queryRef={query}
      />
    </HStack>
  );
}

const GLogoLinkWrapper = styled.a`
  cursor: pointer;
  text-decoration: none;
`;
