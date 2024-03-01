import { graphql, useFragment } from 'react-relay';

import { HStack } from '~/components/core/Spacer/Stack';
import { BasicNavbarFragment$key } from '~/generated/BasicNavbarFragment.graphql';

import { AuthButton } from '../AuthButton';
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

  return (
    <StandardNavbarContainer>
      <NavbarLeftContent />
      <NavbarCenterContent />

      {/* Strictly here to keep spacing consistent */}
      <NavbarRightContent>
        {isLoggedIn ? null : (
          <HStack gap={8} align="center">
            <AuthButton buttonLocation="Basic Navbar" />
          </HStack>
        )}
      </NavbarRightContent>
    </StandardNavbarContainer>
  );
}
