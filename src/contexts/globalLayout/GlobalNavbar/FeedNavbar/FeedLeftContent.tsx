import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { FeedLeftContentFragment$key } from '__generated__/FeedLeftContentFragment.graphql';
import { ProfileDropdownOrSignInButton } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdownOrSignInButton';
import { HomeText } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/Breadcrumbs';
import styled from 'styled-components';
import breakpoints, { size } from 'components/core/breakpoints';
import { HStack } from 'components/core/Spacer/Stack';
import { NavDownArrow } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/NavDownArrow';
import { useState } from 'react';
import { Dropdown } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/Dropdown';
import { useBreakpoint } from 'hooks/useWindowSize';

type DesktopLeftContentProps = {
  queryRef: any;
};

function DesktopLeftContent({ queryRef }: DesktopLeftContentProps) {
  const query = useFragment(
    graphql`
      fragment FeedLeftContentDesktop on Query {
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

type MobileLeftContentProps = {
  queryRef: any;
};

function MobileLeftContent({ queryRef }: MobileLeftContentProps) {
  const query = useFragment(
    graphql`
      fragment FeedLeftContentMobile on Query {
        ...DropdownFragment
      }
    `,
    queryRef
  );

  const [showDrodown, setShowDropdown] = useState(false);

  return (
    <HStack
      gap={4}
      align="center"
      role="button"
      style={{ position: 'relative' }}
      onClick={() => setShowDropdown(true)}
    >
      <HomeText>Home</HomeText>
      <NavDownArrow />

      <Dropdown
        showDropdown={showDrodown}
        onClose={() => setShowDropdown(false)}
        queryRef={query}
      />
    </HStack>
  );
}

type FeedLeftContentProps = {
  queryRef: FeedLeftContentFragment$key;
};

export function FeedLeftContent({ queryRef }: FeedLeftContentProps) {
  const query = useFragment(
    graphql`
      fragment FeedLeftContentFragment on Query {
        ...ProfileDropdownOrSignInButtonFragment
        ...FeedLeftContentMobile
        ...FeedLeftContentDesktop
      }
    `,
    queryRef
  );

  const breakpoint = useBreakpoint();

  return (
    <>
      {breakpoint === size.mobile ? (
        <MobileLeftContent queryRef={query} />
      ) : (
        <DesktopLeftContent queryRef={query} />
      )}
    </>
  );
}
