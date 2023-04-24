import styled, { css } from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import colors from '~/shared/theme/colors';
import IconContainer from '~/components/core/IconContainer';
import { HStack } from '~/components/core/Spacer/Stack';
import { BODY_FONT_FAMILY, Paragraph } from '~/components/core/Text/Text';
import OnboardingDialog from '~/components/GalleryEditor/GalleryOnboardingGuide/OnboardingDialog';
import { EditPencilIcon } from '~/icons/EditPencilIcon';

type GalleryTitleSectionProps = {
  onEdit: () => void;
  galleryName: string;
  dialogMessage: string;
  step: number;

  dialogOnClose: () => void;
  onNextStep: () => void;
};

export function GalleryTitleSection({
  onEdit,
  galleryName,
  dialogMessage,
  step,
  dialogOnClose,
  onNextStep,
}: GalleryTitleSectionProps) {
  return (
    <GalleryTitleContainer align="center" onClick={onEdit} gap={8}>
      <MainGalleryText hasGalleryName={Boolean(galleryName)}>
        {galleryName || 'Untitled gallery'}

        {step === 1 && (
          <OnboardingDialog
            step={1}
            text={dialogMessage}
            onNext={onNextStep}
            onClose={dialogOnClose}
            options={{
              placement: 'bottom',
              positionOffset: 20,
              blinkingPosition: {
                top: 6,
                left: -20,
              },
            }}
          />
        )}
      </MainGalleryText>

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

const MainGalleryText = styled(Paragraph)<{ hasGalleryName: boolean }>`
  font-family: ${BODY_FONT_FAMILY};
  font-style: normal;
  font-weight: 500;
  line-height: 21px;
  letter-spacing: -0.04em;
  white-space: nowrap;

  font-size: 16px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  position: relative;

  ${({ hasGalleryName }) =>
    !hasGalleryName &&
    css`
      font-style: italic;
      color: ${colors.metal};
      font-weight: 400;
    `}

  @media only screen and ${breakpoints.tablet} {
    font-size: 18px;
  }
`;
