import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { ProfileDropdownFragment$key } from '__generated__/ProfileDropdownFragment.graphql';
import { ReactNode } from 'react';
import { NavDownArrow } from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/NavDownArrow';
import { HStack } from 'components/core/Spacer/Stack';
import styled from 'styled-components';
import { GLogo } from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/GLogo';
import { Paragraph, TITLE_FONT_FAMILY } from 'components/core/Text/Text';
import colors from 'components/core/colors';

type ProfileDropdownProps = {
  queryRef: ProfileDropdownFragment$key;
  rightContent: ReactNode;
};

export function ProfileDropdown({ queryRef, rightContent }: ProfileDropdownProps) {
  const query = useFragment(
    graphql`
      fragment ProfileDropdownFragment on Query {
        viewer {
          ... on Viewer {
            user {
              username
            }
          }
        }
      }
    `,
    queryRef
  );

  return (
    <HStack gap={8} align="center">
      <HStack gap={4}>
        <NotificationsCircle />

        <HStack gap={2}>
          <GLogo />

          <NavDownArrow />
        </HStack>
      </HStack>
      <SlashText>/</SlashText>
      {rightContent}
    </HStack>
  );
}

const NotificationsCircle = styled.div`
  width: 4px;
  height: 4px;
  background-color: ${colors.hyperBlue};
  border-radius: 99999px;
`;

const SlashText = styled(Paragraph)`
  font-family: ${TITLE_FONT_FAMILY};
  font-size: 18px;
  font-weight: 300;
  line-height: 21px;
`;
