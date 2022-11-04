import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import colors from '~/components/core/colors';
import Input from '~/components/core/Input/Input';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeL } from '~/components/core/Text/Text';
import { ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL } from '~/components/core/transitions';
import CloseIcon from '~/icons/CloseIcon';

type Props = {
  disabled?: boolean;
  hasUnsavedChange?: boolean;
  onSave: (caption: string) => void;
};

export function CollectionConfirmationNavbar({ disabled, hasUnsavedChange, onSave }: Props) {
  const [isShowPopup, setIsShowPopup] = useState(false);
  const [caption, setCaption] = useState('');

  const charactersLeft = useMemo(() => 600 - caption.length, [caption]);

  const toggleSaveButton = () => {
    setIsShowPopup(!isShowPopup);
  };

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCaption(e.target.value);
    },
    [setCaption]
  );

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
      {isShowPopup && (
        <StyledCardContainer gap={12} isActive={isShowPopup}>
          <HStack justify="flex-end">
            <CloseIcon isActive={true} />
          </HStack>
          {hasUnsavedChange ? (
            <>
              <StyledConfirmationContent gap={8}>
                <BaseM>Share your update to the feed with an optional note.</BaseM>
                <StyledInputContainer>
                  <StyledInput placeholder="Add a note..." onChange={handleInputChange} />
                  <StyledCharacterCounter error={charactersLeft < 1}>
                    <BaseM>{charactersLeft}</BaseM>
                  </StyledCharacterCounter>
                </StyledInputContainer>
              </StyledConfirmationContent>

              <Button onClick={handleSubmit} disabled={isDisabledonSave}>
                Save
              </Button>
            </>
          ) : (
            <StyledNoChangesTitle>No changes made yet.</StyledNoChangesTitle>
          )}
        </StyledCardContainer>
      )}
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

  transform: ${({ isActive }) =>
    `translateY(${isActive ? 0 : ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL}px)`};
  opacity: ${({ isActive }) => (isActive ? 1 : 0)};
`;

const StyledConfirmationContent = styled(VStack)`
  padding: 12px 0;
`;

const StyledInputContainer = styled.div`
  position: relative;
`;
const StyledInput = styled(Input)`
  padding-right: 40px;
  font-family: 'ABC Diatype', Helvetica, Arial, sans-serif;
`;

const StyledNoChangesTitle = styled(TitleDiatypeL)`
  text-align: center;
`;

const StyledCharacterCounter = styled(VStack)<{ error: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  color: ${colors.white};

  padding: 8px;

  ${BaseM} {
    color: ${({ error }) => (error ? colors.error : colors.metal)};
  }
`;