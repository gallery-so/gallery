import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { HStack } from '~/components/core/Spacer/Stack';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  StandardNavbarContainer,
} from '~/contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import { CommunityNavbarFragment$key } from '~/generated/CommunityNavbarFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';

import { SignInButton } from '../SignInButton';
import { SignUpButton } from '../SignUpButton';

type CommunityNavbarProps = {
  queryRef: CommunityNavbarFragment$key;
};

export function CommunityNavbar({ queryRef }: CommunityNavbarProps) {
  const query = useFragment(
    graphql`
      fragment CommunityNavbarFragment on Query {
        viewer {
          ... on Viewer {
            __typename
          }
        }
      }
    `,
    queryRef
  );

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  return (
    <StandardNavbarContainer>
      <NavbarLeftContent />

      <NavbarCenterContent />

      {query.viewer?.__typename === 'Viewer' ? null : (
        <HStack gap={8} align="center">
          <SignInButton buttonLocation="Collection Page Navbar" />
          {/* Don't show Sign Up btn on mobile bc it doesnt fit alongside Sign In, and onboarding isn't mobile optimized yet */}
          {!isMobile && <SignUpButton buttonLocation="Collection Page Navbar" />}
        </HStack>
      )}
    </StandardNavbarContainer>
  );
}
