import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { FeedLeftContentFragment$key } from '__generated__/FeedLeftContentFragment.graphql';
import { HomeText } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/Breadcrumbs';
import { size } from 'components/core/breakpoints';
import { HStack } from 'components/core/Spacer/Stack';
import { NavDownArrow } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/NavDownArrow';
import { useState } from 'react';
import { Dropdown } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/Dropdown';
import { useBreakpoint } from 'hooks/useWindowSize';
import { FeedLeftContentDesktop$key } from '../../../../../__generated__/FeedLeftContentDesktop.graphql';
import { FeedLeftContentMobile$key } from '../../../../../__generated__/FeedLeftContentMobile.graphql';
import { ProfileDropdown } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/ProfileDropdown';

type DesktopLeftContentProps = {
  queryRef: FeedLeftContentDesktop$key;
};

function DesktopLeftContent({ queryRef }: DesktopLeftContentProps) {
  const query = useFragment(
    graphql`
      fragment FeedLeftContentDesktop on Query {
        ...ProfileDropdownFragment
      }
    `,
    queryRef
  );

  return <ProfileDropdown queryRef={query} rightContent={<HomeText>Home</HomeText>} />;
}

type MobileLeftContentProps = {
  queryRef: FeedLeftContentMobile$key;
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
