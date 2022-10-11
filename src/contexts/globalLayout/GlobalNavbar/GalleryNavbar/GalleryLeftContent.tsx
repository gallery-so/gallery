import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { HStack } from 'components/core/Spacer/Stack';
import styled from 'styled-components';
import { Paragraph, TITLE_FONT_FAMILY } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import { GLogo } from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/GLogo';
import { NavDownArrow } from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/NavDownArrow';
import { GalleryLeftContentFragment$key } from '../../../../../__generated__/GalleryLeftContentFragment.graphql';

type Props = {
  queryRef: GalleryLeftContentFragment$key;
};

export default function GalleryLeftContent({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment GalleryLeftContentFragment on Query {
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
      <UsernameText>jess</UsernameText>
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

const UsernameText = styled(Paragraph)`
  font-family: ${TITLE_FONT_FAMILY};
  font-size: 18px;
  font-weight: 400;
  line-height: 21px;
`;
