import { graphql, useFragment } from 'react-relay';

import { HStack } from '~/components/core/Spacer/Stack';
import { BasicNavbarFragment$key } from '~/generated/BasicNavbarFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';

import { SignInButton } from '../SignInButton';
import { SignUpButton } from '../SignUpButton';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from '../StandardNavbarContainer';

type Props = {
  queryRef: BasicNavbarFragment$key;
};
export function BasicNavbar({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment BasicNavbarFragment on Query {
        viewer {
          ... on Viewer {
            __typename
          }
        }
      }
    `,
    queryRef
  );

  const isLoggedIn = query.viewer?.__typename === 'Viewer';

  const isMobile = useIsMobileWindowWidth();

  return (
    <StandardNavbarContainer>
      <NavbarLeftContent />
      <NavbarCenterContent />

      {/* Strictly here to keep spacing consistent */}
      <NavbarRightContent>
        {isLoggedIn ? null : (
          <HStack gap={8} align="center">
            <SignInButton buttonLocation="Basic Navbar" />
            {/* Don't show Sign Up btn on mobile bc it doesnt fit alongside Sign In, and onboarding isn't mobile optimized yet */}
            {!isMobile && <SignUpButton buttonLocation="Basic Navbar" />}
          </HStack>
        )}
      </NavbarRightContent>
    </StandardNavbarContainer>
  );
}
