import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import colors from '~/components/core/colors';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeL } from '~/components/core/Text/Text';
import { TextAreaWithCharCount } from '~/components/core/TextArea/TextArea';
import transitions, {
  ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL,
} from '~/components/core/transitions';
import CloseIcon from '~/icons/CloseIcon';

type Props = {
  disabled?: boolean;
  hasUnsavedChange?: boolean;
  onSave: (caption: string) => void;
};

export function CollectionConfirmationNavbar({ disabled, hasUnsavedChange, onSave }: Props) {
  const [isShowPopup, setIsShowPopup] = useState(false);
  const [caption, setCaption] = useState('');

  const toggleSaveButton = () => {
    setIsShowPopup(!isShowPopup);
  };

  const handleCaptionChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCaption(event.target.value);
  }, []);

  const handleSubmit = useCallback(async () => {
    onSave(caption);
    setIsShowPopup(false);
  }, [caption, onSave]);

  const isDisabledonSave = useMemo(() => {
    return caption.length > 600;
  }, [caption]);

  return (
    <StyledConfirmationContainer>
      <Button onClick={toggleSaveButton} disabled={disabled}>
        <HStack gap={4} align="center">
          Save
          <StyledChevronSvg
            isActive={isShowPopup}
            width="12"
            height="7"
            viewBox="0 0 12 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1.33337 1L6.00004 5.66667L10.6667 1" stroke="#FEFEFE" strokeMiterlimit="10" />
          </StyledChevronSvg>
        </HStack>
      </Button>
      <StyledCardContainer gap={12} isActive={isShowPopup}>
        <HStack justify="flex-end">
          <StyledCloseButton onClick={toggleSaveButton}>
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

            <Button onClick={handleSubmit} disabled={isDisabledonSave}>
              Save
            </Button>
          </>
        ) : (
          <StyledNoChangesTitle>No changes made yet.</StyledNoChangesTitle>
        )}
      </StyledCardContainer>
    </StyledConfirmationContainer>
  );
}

const StyledConfirmationContainer = styled(VStack)`
  position: relative;
`;

const StyledChevronSvg = styled.svg<{ isActive: boolean }>`
  transform: ${({ isActive }) => (isActive ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform 0.2s ease-in-out;
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
