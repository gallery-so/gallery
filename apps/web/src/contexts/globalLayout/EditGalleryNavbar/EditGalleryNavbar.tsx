import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import colors from '~/components/core/colors';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleXS } from '~/components/core/Text/Text';
import { GalleryTitleSection } from '~/contexts/globalLayout/EditGalleryNavbar/GalleryTitleSection';
import { CollectionSaveButtonWithCaption } from '~/contexts/globalLayout/GlobalNavbar/CollectionSaveButtonWithCaption';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from '~/contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import { useGuardEditorUnsavedChanges } from '~/hooks/useGuardEditorUnsavedChanges';
import { useSaveHotkey } from '~/hooks/useSaveHotkey';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import { AllGalleriesIcon } from '~/icons/AllGalleriesIcon';

type Props = {
  canSave: boolean;
  hasSaved: boolean;
  hasUnsavedChanges: boolean;
  galleryName: string;
  username: string;
  dialogMessage: string;
  step: number;

  onNextStep: () => void;
  dialogOnClose: () => void;

  isSaving: boolean;

  onEdit: () => void;

  onBack: () => void;
  onSave: () => Promise<void>;
  onDone: (caption: string, redirect?: boolean) => Promise<void>;
};

type DoneAction =
  | 'no-changes'
  | 'can-save'
  | 'has-unsaved-changes-with-validation-errors'
  | 'saved';

export function EditGalleryNavbar({
  canSave,
  onDone,
  onSave,
  onBack,
  onEdit,
  hasSaved,
  hasUnsavedChanges,

  isSaving,
  dialogMessage,
  step,
  onNextStep,
  dialogOnClose,

  username,
  galleryName,
}: Props) {
  const { push } = useRouter();
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const handleAllGalleriesClick = useGuardEditorUnsavedChanges(() => {
    // if the user has saved changes, we will automatically publish the gallery with no caption
    if (doneAction === 'saved') {
      onDone('');
    }

    push({ pathname: '/[username]/galleries', query: { username } });
  }, hasUnsavedChanges);

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

  // Flash the "Saved" state if the user has nothing to save
  // and the hit "Cmd+S" anyway
  const [showSaved, setShowSaved] = useState(true);
  useSaveHotkey(() => {
    if (doneAction === 'saved') {
      setShowSaved(false);

      setTimeout(() => {
        setShowSaved(true);
      }, 500);
    }
  });

  const handleDone = useCallback(
    (caption: string) => {
      onDone(caption, true);
    },
    [onDone]
  );

  const doneButton = useMemo(() => {
    if (doneAction === 'no-changes') {
      return <DoneButton onClick={onBack}>Done</DoneButton>;
    } else if (doneAction === 'saved') {
      return (
        <>
          <SavedText show={showSaved} color={colors.metal}>
            Saved
          </SavedText>

          <CollectionSaveButtonWithCaption onSave={handleDone} label="Done" />
        </>
      );
    } else if (
      doneAction === 'has-unsaved-changes-with-validation-errors' ||
      doneAction === 'can-save'
    ) {
      return (
        <>
          <BaseM color={colors.metal}>Unsaved changes</BaseM>
          <DoneButton onClick={onSave} pending={isSaving}>
            Save
          </DoneButton>
        </>
      );
    }
  }, [doneAction, isSaving, onBack, handleDone, onSave, showSaved]);

  return (
    <Wrapper>
      <StandardNavbarContainer>
        <NavbarLeftContent>
          {isMobile ? (
            <GalleryTitleSection
              galleryName={galleryName}
              onEdit={onEdit}
              step={step}
              dialogMessage={dialogMessage}
              onNextStep={onNextStep}
              dialogOnClose={dialogOnClose}
            />
          ) : (
            <AllGalleriesWrapper onClick={handleAllGalleriesClick} gap={4}>
              <AllGalleriesIcon />
              <TitleXS color={colors.shadow}>ALL GALLERIES</TitleXS>
            </AllGalleriesWrapper>
          )}
        </NavbarLeftContent>

        <NavbarCenterContent>
          {!isMobile && (
            <GalleryTitleSection
              galleryName={galleryName}
              onEdit={onEdit}
              step={step}
              dialogMessage={dialogMessage}
              onNextStep={onNextStep}
              dialogOnClose={dialogOnClose}
            />
          )}
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

const AllGalleriesWrapper = styled(HStack)`
  cursor: pointer;
  padding: 8px;

  :hover {
    background-color: ${colors.faint};

    ${TitleXS} {
      color: ${colors.offBlack};
    }
  }
`;

const SavedText = styled(BaseM)<{ show: boolean }>`
  transition: opacity 300ms ease-in-out;
  opacity: ${({ show }) => (show ? '1' : '0')};
`;

const DoneButton = styled(Button)`
  padding: 8px 12px;
  min-width: 60px;
`;

const Wrapper = styled.div`
  border-bottom: 1px solid ${colors.porcelain};

  @media only screen and ${breakpoints.tablet} {
    border: none;
  }
`;
