import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { FeedLeftContentFragment$key } from '__generated__/FeedLeftContentFragment.graphql';
import { HomeText } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/Breadcrumbs';
import { HStack } from 'components/core/Spacer/Stack';
import { NavDownArrow } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/NavDownArrow';
import { useState } from 'react';
import { ProfileDropdownContent } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/ProfileDropdownContent';
import { GLogo } from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/GLogo';
import Link from 'next/link';
import styled from 'styled-components';

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
