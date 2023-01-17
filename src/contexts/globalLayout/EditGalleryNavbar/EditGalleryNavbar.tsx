import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import colors from '~/components/core/colors';
import IconContainer from '~/components/core/IconContainer';
import { HStack } from '~/components/core/Spacer/Stack';
import { BODY_FONT_FAMILY, Paragraph, TitleDiatypeM } from '~/components/core/Text/Text';
import { BackButton } from '~/contexts/globalLayout/GlobalNavbar/BackButton';
import { CollectionSaveButtonWithCaption } from '~/contexts/globalLayout/GlobalNavbar/CollectionSaveButtonWithCaption';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from '~/contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import { EditPencilIcon } from '~/icons/EditPencilIcon';

type Props = {
  canSave: boolean;
  hasUnsavedChanges: boolean;
  galleryName: string;

  onEdit: () => void;

  onBack: () => void;
  onDone: (caption: string) => Promise<void>;
};

type GalleryTitleSectionProps = {
  onEdit: () => void;
  galleryName: string;
};

function GalleryTitleSection({ onEdit, galleryName }: GalleryTitleSectionProps) {
  return (
    <GalleryTitleContainer align="center" onClick={onEdit} gap={8}>
      <MainGalleryText>{galleryName || 'Untitled'}</MainGalleryText>

      <EditIconContainer>
        <IconContainer size="sm" variant="stacked" icon={<EditPencilIcon />} />
      </EditIconContainer>
    </GalleryTitleContainer>
  );
}

const EditIconContainer = styled.div`
  opacity: 0;

  transition: opacity 150ms ease-in-out;
`;

const GalleryTitleContainer = styled(HStack)`
  padding: 4px 8px;
  cursor: pointer;

  :hover {
    background-color: ${colors.faint};

    ${EditIconContainer} {
      opacity: 1;
    }
  }
`;

export function EditGalleryNavbar({
  canSave,
  onDone,
  onBack,
  onEdit,
  hasUnsavedChanges,
  galleryName,
}: Props) {
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  return (
    <Wrapper>
      <StandardNavbarContainer>
        <NavbarLeftContent>
          {isMobile ? (
            <GalleryTitleSection galleryName={galleryName} onEdit={onEdit} />
          ) : (
            <BackButton onClick={onBack} />
          )}
        </NavbarLeftContent>

        <NavbarCenterContent>
          {!isMobile && <GalleryTitleSection galleryName={galleryName} onEdit={onEdit} />}
        </NavbarCenterContent>

        <NavbarRightContent>
          <HStack align="center" gap={12}>
            {hasUnsavedChanges && (
              <TitleDiatypeM color={colors.metal}>Unsaved Changes</TitleDiatypeM>
            )}

            <CollectionSaveButtonWithCaption
              hasUnsavedChange={hasUnsavedChanges}
              disabled={!canSave}
              onSave={onDone}
            />
          </HStack>
        </NavbarRightContent>
      </StandardNavbarContainer>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  border-bottom: 1px solid ${colors.porcelain};

  @media only screen and ${breakpoints.tablet} {
    border: none;
  }
`;

export const MainGalleryText = styled(Paragraph)`
  font-family: ${BODY_FONT_FAMILY};
  font-style: normal;
  font-weight: 500;
  line-height: 21px;
  letter-spacing: -0.04em;
  white-space: nowrap;

  font-size: 16px;

  @media only screen and ${breakpoints.tablet} {
    font-size: 18px;
  }
`;
