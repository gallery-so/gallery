import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { HStack } from '~/components/core/Spacer/Stack';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  StandardNavbarContainer,
} from '~/contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import { CommunityNavbarFragment$key } from '~/generated/CommunityNavbarFragment.graphql';

import { AuthButton } from '../AuthButton';

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

  return (
    <StandardNavbarContainer>
      <NavbarLeftContent />

      <NavbarCenterContent />

      {query.viewer?.__typename === 'Viewer' ? null : (
        <HStack gap={8} align="center">
          <AuthButton buttonLocation="Collection Page Navbar" />
        </HStack>
      )}
    </StandardNavbarContainer>
  );
}
