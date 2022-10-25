import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { GalleryRightContentFragment$key } from '__generated__/GalleryRightContentFragment.graphql';
import styled from 'styled-components';
import { TitleXS } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import { useCallback } from 'react';
import { useBreakpoint } from 'hooks/useWindowSize';
import { size } from 'components/core/breakpoints';
import { HStack } from 'components/core/Spacer/Stack';
import { EditLink } from 'contexts/globalLayout/GlobalNavbar/CollectionNavbar/EditLink';
import LinkButton from 'scenes/UserGalleryPage/LinkButton';
import { useQrCode } from 'scenes/Modals/QRCodePopover';
import QRCodeButton from './QRCodeButton';
import { useModalActions } from 'contexts/modal/ModalContext';
import EditUserInfoModal from 'scenes/UserGalleryPage/EditUserInfoModal';

type GalleryRightContentProps = {
  username: string;
  queryRef: GalleryRightContentFragment$key;
};

export function GalleryRightContent({ queryRef, username }: GalleryRightContentProps) {
  const query = useFragment(
    graphql`
      fragment GalleryRightContentFragment on Query {
        ...EditUserInfoModalFragment

        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }

        userByUsername(username: $username) {
          ... on GalleryUser {
            dbid
          }
        }
      }
    `,
    queryRef
  );

  const styledQrCode = useQrCode();
  const breakpoint = useBreakpoint();
  const { showModal } = useModalActions();

  const handleEditClick = useCallback(() => {
    showModal({
      content: <EditUserInfoModal queryRef={query} />,
      headerText: 'Edit username and bio',
    });
  }, [query, showModal]);

  const shouldShowEditButton = Boolean(
    query.viewer?.user?.dbid && query.viewer?.user?.dbid === query.userByUsername?.dbid
  );

  if (breakpoint === size.mobile) {
    return (
      <HStack gap={8} align="center">
        <QRCodeButton username={username} styledQrCode={styledQrCode} />
        <LinkButton textToCopy={`https://gallery.so/${username}`} />
        {shouldShowEditButton && <EditLink role="button" onClick={handleEditClick} />}
      </HStack>
    );
  }

  if (shouldShowEditButton) {
    return (
      <EditButtonContainer onClick={handleEditClick}>
        <TitleXS>EDIT</TitleXS>
      </EditButtonContainer>
    );
  }

  return null;
}

const EditButtonContainer = styled.div.attrs({ role: 'button' })`
  padding: 8px;
  display: flex;
  justify-content: center;
  align-items: center;

  cursor: pointer;

  :hover {
    background-color: ${colors.faint};
  }
`;
