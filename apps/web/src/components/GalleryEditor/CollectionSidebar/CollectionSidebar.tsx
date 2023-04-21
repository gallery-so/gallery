import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import IconContainer from '~/components/core/IconContainer';
import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleS } from '~/components/core/Text/Text';
import { CollectionSearch } from '~/components/GalleryEditor/CollectionSidebar/CollectionSearch';
import { CreateCollectionIcon } from '~/components/GalleryEditor/CollectionSidebar/CreateCollectionIcon';
import { useGalleryEditorContext } from '~/components/GalleryEditor/GalleryEditorContext';
import { NewTooltip } from '~/components/Tooltip/NewTooltip';
import { useTooltipHover } from '~/components/Tooltip/useTooltipHover';
import { CollectionSidebarQueryFragment$key } from '~/generated/CollectionSidebarQueryFragment.graphql';
import { PaintbrushIcon } from '~/icons/PaintbrushIcon';
import { QuestionMarkIcon } from '~/icons/QuestionMarkIcon';

import OnboardingDialog from '../GalleryOnboardingGuide/OnboardingDialog';
import { useOnboardingDialogContext } from '../GalleryOnboardingGuide/OnboardingDialogContext';

const NOTION_DOCS_URL =
  'https://gallery-so.notion.site/Creating-a-new-gallery-and-organizing-your-NFTs-b407a174a2ee44748bb9952abd803290';

function TitleSection() {
  const { createCollection } = useGalleryEditorContext();

  return (
    <TitleSectionWrapper align="center" justify="space-between">
      <TitleS>Collections</TitleS>
      <IconContainer
        variant="default"
        size="sm"
        icon={<CreateCollectionIcon />}
        onClick={createCollection}
      />
    </TitleSectionWrapper>
  );
}

type Props = {
  queryRef: CollectionSidebarQueryFragment$key;
};

export function CollectionSidebar({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment CollectionSidebarQueryFragment on Query {
        ...CollectionSearchQueryFragment
      }
    `,
    queryRef
  );

  const { isEmptyGallery } = useGalleryEditorContext();

  return (
    <CollectionSidebarWrapper gap={8}>
      <TitleSection />
      <CollectionSearch queryRef={query} />
      <StyledIconsContainer justify="space-between">
        <InteractiveLink href={NOTION_DOCS_URL}>
          <a>
            <HelpIconContainer />
          </a>
        </InteractiveLink>
        {isEmptyGallery && <PaintbrushIconContainer />}
      </StyledIconsContainer>
    </CollectionSidebarWrapper>
  );
}

function HelpIconContainer() {
  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover({
      placement: 'top-start',
    });

  return (
    <>
      <NewTooltip
        {...getFloatingProps()}
        style={floatingStyle}
        ref={floating}
        text="How to set up your gallery"
      />
      <StyledHelpIconContainer
        variant="blue"
        size="md"
        icon={<QuestionMarkIcon />}
        ref={reference}
        {...getReferenceProps()}
      />
    </>
  );
}

function PaintbrushIconContainer() {
  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover({
      placement: 'top-start',
    });

  const { setAutogeneratedGallery } = useGalleryEditorContext();
  const { step, dialogMessage, nextStep, handleClose } = useOnboardingDialogContext();

  return (
    <>
      <NewTooltip
        {...getFloatingProps()}
        style={{ ...floatingStyle, width: '162px', left: '50px' }}
        ref={floating}
        whiteSpace="pre-line"
        text={`Auto-generate a gallery based on your collections.\n\nFeel free to update it afterwards, and don't forget to save once you're done!`}
      />
      <StyledPaintbrushIconContainer
        onClick={setAutogeneratedGallery}
        variant="blue"
        size="md"
        icon={<PaintbrushIcon />}
        ref={reference}
        {...getReferenceProps()}
      />
      {step === 7 && (
        <OnboardingDialog
          step={step}
          text={dialogMessage}
          onNext={nextStep}
          onClose={handleClose}
          options={{
            placement: 'left-start',
            positionOffset: 20,
            blinkingPosition: {
              right: 15,
              bottom: 12,
            },
          }}
        />
      )}
    </>
  );
}

const SIDEBAR_WIDTH = 250;

const CollectionSidebarWrapper = styled(VStack)`
  position: relative;
  min-width: ${SIDEBAR_WIDTH}px;
  max-width: ${SIDEBAR_WIDTH}px;

  overflow-y: auto;
  max-height: 100%;
  height: 100%;

  padding: 16px 0 48px;

  border-right: 1px solid ${colors.porcelain};
`;

const TitleSectionWrapper = styled(HStack)`
  padding: 0 16px;
`;

const StyledIconsContainer = styled(HStack)`
  position: fixed;
  bottom: 16px;
  left: 16px;
  width: ${SIDEBAR_WIDTH}px;
  padding-right: 32px;
`;

const StyledHelpIconContainer = styled(IconContainer)`
  background-color: ${colors.offBlack};
  cursor: pointer;

  &:hover {
    background-color: ${colors.offBlack};
  }
`;

const StyledPaintbrushIconContainer = styled(IconContainer)`
  background-color: ${colors.activeBlue};
  cursor: pointer;

  &:hover {
    background-color: ${colors.activeBlue};
  }
`;
