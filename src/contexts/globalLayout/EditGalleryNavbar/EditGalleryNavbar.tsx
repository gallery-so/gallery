import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import colors from '~/components/core/colors';
import { HStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeM } from '~/components/core/Text/Text';
import { GalleryTitleSection } from '~/contexts/globalLayout/EditGalleryNavbar/GalleryTitleSection';
import { BackButton } from '~/contexts/globalLayout/GlobalNavbar/BackButton';
import { CollectionSaveButtonWithCaption } from '~/contexts/globalLayout/GlobalNavbar/CollectionSaveButtonWithCaption';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from '~/contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';

type Props = {
  canSave: boolean;
  hasSaved: boolean;
  hasUnsavedChanges: boolean;
  galleryName: string;

  onEdit: () => void;

  onBack: () => void;
  onDone: (caption: string) => Promise<void>;
};

type DoneAction =
  | 'no-changes'
  | 'can-save'
  | 'has-unsaved-changes-with-validation-errors'
  | 'saved';

export function EditGalleryNavbar({
  canSave,
  onDone,
  onBack,
  onEdit,
  hasSaved,
  hasUnsavedChanges,
  galleryName,
}: Props) {
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const doneAction = useMemo<DoneAction>(() => {
    if (hasUnsavedChanges) {
      if (canSave) {
        return 'can-save';
      } else {
        return 'has-unsaved-changes-with-validation-errors';
      }
    }

    if (hasSaved) {
      return 'saved';
    }

    return 'no-changes';
  }, [canSave, hasSaved, hasUnsavedChanges]);

  const doneButton = useMemo(() => {
    if (doneAction === 'no-changes') {
      return <Button onClick={onBack}>Done</Button>;
    } else if (doneAction === 'saved') {
      return (
        <>
          <TitleDiatypeM color={colors.metal}>Saved</TitleDiatypeM>
          <Button onClick={onBack}>Done</Button>
        </>
      );
    } else if (
      doneAction === 'has-unsaved-changes-with-validation-errors' ||
      doneAction === 'can-save'
    ) {
      return (
        <>
          <TitleDiatypeM color={colors.metal}>Unsaved changes</TitleDiatypeM>

          <CollectionSaveButtonWithCaption
            hasUnsavedChange={hasUnsavedChanges}
            disabled={doneAction === 'has-unsaved-changes-with-validation-errors'}
            onSave={onDone}
          />
        </>
      );
    }
  }, [doneAction, hasUnsavedChanges, onBack, onDone]);

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
            {doneButton}
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
