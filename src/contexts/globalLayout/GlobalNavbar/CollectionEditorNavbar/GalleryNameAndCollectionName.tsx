import { useRouter } from 'next/router';
import { Route } from 'nextjs-routes';
import { useCallback } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import colors from '~/components/core/colors';
import { HStack } from '~/components/core/Spacer/Stack';
import { BODY_FONT_FAMILY, Paragraph } from '~/components/core/Text/Text';
import {
  EditingText,
  MainGalleryText,
} from '~/contexts/globalLayout/GlobalNavbar/GalleryEditNavbar/GalleryEditNavbar';
import { useModalActions } from '~/contexts/modal/ModalContext';
import GenericActionModal from '~/scenes/Modals/GenericActionModal';

type Props = {
  editGalleryRoute: Route;
  galleryName: string;
  collectionName: string;
  rightText: string;
};

export function GalleryNameAndCollectionName({
  galleryName,
  collectionName,
  rightText,
  editGalleryRoute,
}: Props) {
  const { showModal } = useModalActions();
  const router = useRouter();

  const handleToGalleryCollection = useCallback(() => {
    showModal({
      content: (
        <GenericActionModal
          buttonText="Leave"
          action={() => {
            router.push(editGalleryRoute);
          }}
        />
      ),
      headerText: 'Would you like to stop editing?',
    });
  }, [editGalleryRoute, router, showModal]);

  return (
    <HStack gap={8} align="baseline">
      <StyledMainGalleryText as="button" onClick={handleToGalleryCollection}>
        {galleryName}
      </StyledMainGalleryText>

      <CollectionName>/</CollectionName>

      <CollectionName>{collectionName}</CollectionName>

      <EditingText>{rightText}</EditingText>
    </HStack>
  );
}

const StyledMainGalleryText = styled(MainGalleryText)`
  color: ${colors.metal};

  appearance: none;
  background: none;
  border: none;
  cursor: pointer;
`;

const CollectionName = styled(Paragraph)`
  font-family: ${BODY_FONT_FAMILY};
  font-style: normal;
  font-weight: 500;
  line-height: 21px;
  letter-spacing: -0.04em;
  
  white-space: nowrap;
  
  color ${colors.offBlack}

  font-size: 16px;
  @media only screen and ${breakpoints.tablet} {
    font-size: 18px;
  }
`;
