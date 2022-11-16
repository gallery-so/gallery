import { useCallback, useMemo, useRef, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import colors from '~/components/core/colors';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import ErrorText from '~/components/core/Text/ErrorText';
import { BaseM, TitleDiatypeL } from '~/components/core/Text/Text';
import { TextAreaWithCharCount } from '~/components/core/TextArea/TextArea';
import transitions, {
  ANIMATED_COMPONENT_TRANSITION_MS,
  ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL,
} from '~/components/core/transitions';
import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { CollectionSaveButtonWithCaptionFragment$key } from '~/generated/CollectionSaveButtonWithCaptionFragment.graphql';
import CloseIcon from '~/icons/CloseIcon';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';

type Props = {
  disabled?: boolean;
  error?: string;
  hasUnsavedChange?: boolean;
  label?: string;
  onSave: (caption: string) => Promise<void>;
  queryRef: CollectionSaveButtonWithCaptionFragment$key;
};

export function CollectionSaveButtonWithCaption({
  disabled,
  error,
  hasUnsavedChange,
  label = 'Save',
  onSave,
  queryRef,
}: Props) {
  const query = useFragment(
    graphql`
      fragment CollectionSaveButtonWithCaptionFragment on Query {
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  // Pseudo-state for signaling animations. This gives us a chance
  // to display an animation prior to unmounting the component and its contents
  const [isActive, setIsActive] = useState(false);
  const [isPopupDisplayed, setIsPopupDisplayed] = useState(false);
  const track = useTrack();

  const [caption, setCaption] = useState('');
  const deactivateHoverCardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isWhiteRhinoEnabled = isFeatureEnabled(FeatureFlag.WHITE_RHINO, query);

  const handleCloseCaption = useCallback(() => {
    deactivateHoverCardTimeoutRef.current = setTimeout(
      () => setIsActive(false),
      ANIMATED_COMPONENT_TRANSITION_MS
    );
    setIsPopupDisplayed(false);
  }, []);

  const handleCaptionChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCaption(event.target.value);
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    if (!!caption) {
      track('Saved Collection With Caption');
    }
    await onSave(caption);
    handleCloseCaption();
    setIsLoading(false);
  }, [caption, handleCloseCaption, onSave, track]);

  const handleOpenCaption = useCallback(() => {
    // If feature flag off, skip caption and save immediately
    if (!isWhiteRhinoEnabled) {
      handleSubmit();
      return;
    }

    if (deactivateHoverCardTimeoutRef.current) {
      clearTimeout(deactivateHoverCardTimeoutRef.current);
    }
    setIsActive(true);
    setIsPopupDisplayed(true);
  }, [handleSubmit, isWhiteRhinoEnabled]);

  const isSaveDisabled = useMemo(() => {
    return caption.length > 600;
  }, [caption]);

  const [isLoading, setIsLoading] = useState(false);

  return (
    <StyledConfirmationContainer>
      <StyledButton
        onClick={isPopupDisplayed ? handleCloseCaption : handleOpenCaption}
        disabled={disabled}
        pending={isLoading && !isWhiteRhinoEnabled}
      >
        <HStack gap={4} align="center">
          {label}
          {isWhiteRhinoEnabled && (
            <StyledChevronSvg
              isActive={isPopupDisplayed}
              width="12"
              height="7"
              viewBox="0 0 12 7"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.33337 1L6.00004 5.66667L10.6667 1"
                stroke="#FEFEFE"
                strokeMiterlimit="10"
              />
            </StyledChevronSvg>
          )}
        </HStack>
      </StyledButton>
      <StyledCardContainer gap={hasUnsavedChange ? 12 : 24} isActive={isPopupDisplayed}>
        {isActive && (
          <>
            <HStack justify="flex-end">
              <StyledCloseButton onClick={handleCloseCaption}>
                <CloseIcon />
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
                    defaultValue={caption}
                    placeholder="Add a note..."
                    textAreaHeight="50px"
                  />
                </StyledConfirmationContent>

                <Button onClick={handleSubmit} disabled={isSaveDisabled} pending={isLoading}>
                  Save
                </Button>

                {error && <ErrorText message={error} />}
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
  color: ${colors.offBlack};
`;

const StyledConfirmationContent = styled(VStack)`
  padding: 12px 0;
`;

const StyledNoChangesTitle = styled(TitleDiatypeL)`
  text-align: center;
`;
