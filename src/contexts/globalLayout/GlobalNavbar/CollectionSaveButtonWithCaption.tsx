import { useCallback, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import colors from '~/components/core/colors';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeL } from '~/components/core/Text/Text';
import { TextAreaWithCharCount } from '~/components/core/TextArea/TextArea';
import transitions, {
  ANIMATED_COMPONENT_TRANSITION_MS,
  ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL,
} from '~/components/core/transitions';
import CloseIcon from '~/icons/CloseIcon';

type Props = {
  disabled?: boolean;
  hasUnsavedChange?: boolean;
  label?: string;
  onSave: (caption: string) => Promise<void>;
};

export function CollectionSaveButtonWithCaption({
  disabled,
  hasUnsavedChange,
  label = 'Save',
  onSave,
}: Props) {
  const [isPopupDisplayed, setIsPopupDisplayed] = useState(false);
  const [caption, setCaption] = useState('');
  const deactivateHoverCardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOpenCaption = useCallback(() => {
    if (deactivateHoverCardTimeoutRef.current) {
      clearTimeout(deactivateHoverCardTimeoutRef.current);
    }
    setIsPopupDisplayed(true);
  }, []);

  const handleCloseCaption = useCallback(() => {
    deactivateHoverCardTimeoutRef.current = setTimeout(
      () => setIsPopupDisplayed(false),
      ANIMATED_COMPONENT_TRANSITION_MS
    );
  }, []);

  const handleCaptionChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCaption(event.target.value);
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    await onSave(caption);
    handleCloseCaption();
    setIsLoading(false);
  }, [caption, handleCloseCaption, onSave]);

  const isSaveDisabled = useMemo(() => {
    return caption.length > 600;
  }, [caption]);

  const [isLoading, setIsLoading] = useState(false);

  return (
    <StyledConfirmationContainer>
      <StyledButton
        onClick={isPopupDisplayed ? handleCloseCaption : handleOpenCaption}
        disabled={disabled}
      >
        <HStack gap={4} align="center">
          {label}
          <StyledChevronSvg
            isActive={isPopupDisplayed}
            width="12"
            height="7"
            viewBox="0 0 12 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1.33337 1L6.00004 5.66667L10.6667 1" stroke="#FEFEFE" strokeMiterlimit="10" />
          </StyledChevronSvg>
        </HStack>
      </StyledButton>
      <StyledCardContainer gap={hasUnsavedChange ? 12 : 24} isActive={isPopupDisplayed}>
        {isPopupDisplayed && (
          <>
            <HStack justify="flex-end">
              <StyledCloseButton onClick={handleCloseCaption}>
                <CloseIcon isActive={true} />
              </StyledCloseButton>
            </HStack>
            {hasUnsavedChange ? (
              <>
                <StyledConfirmationContent gap={8}>
                  <BaseM>Share your update to the feed with an optional note.</BaseM>
                  <TextAreaWithCharCount
                    currentCharCount={caption.length}
                    maxCharCount={600}
                    onChange={handleCaptionChange}
                    hasPadding
                    placeholder="Add a note..."
                    textAreaHeight="50px"
                  />
                </StyledConfirmationContent>

                <Button onClick={handleSubmit} disabled={isSaveDisabled} pending={isLoading}>
                  Save
                </Button>
              </>
            ) : (
              <StyledNoChangesTitle>No changes made yet.</StyledNoChangesTitle>
            )}
          </>
        )}
      </StyledCardContainer>
    </StyledConfirmationContainer>
  );
}

const StyledConfirmationContainer = styled(VStack)`
  position: relative;
`;

const StyledButton = styled(Button)`
  /* padding: 16px; */
  padding: 8px 12px;
`;

const StyledChevronSvg = styled.svg<{ isActive: boolean }>`
  transform: ${({ isActive }) => (isActive ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

const StyledCardContainer = styled(VStack)<{ isActive: boolean }>`
  border: 1px solid ${colors.offBlack};
  padding: 12px 16px;
  width: 375px;
  display: grid;
  background-color: ${colors.white};

  position: absolute;
  right: 0;
  top: calc(100% + 8px);

  transition: ${transitions.cubic};
  transform: ${({ isActive }) =>
    `translateY(${isActive ? 0 : ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL}px)`};
  opacity: ${({ isActive }) => (isActive ? 1 : 0)};
`;

const StyledCloseButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
`;

const StyledConfirmationContent = styled(VStack)`
  padding: 12px 0;
`;

const StyledNoChangesTitle = styled(TitleDiatypeL)`
  text-align: center;
`;
