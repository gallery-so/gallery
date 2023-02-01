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
import { QuestionMarkIcon } from '~/icons/QuestionMarkIcon';

// TODO: Replace with notion docs link
const NOTION_DOCS_URL =
  'ghttps://www.notion.so/gallery-so/Creating-a-new-gallery-and-organizing-your-NFTs-b407a174a2ee44748bb9952abd803290';

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

  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover({
      placement: 'top-start',
    });

  return (
    <CollectionSidebarWrapper gap={8}>
      <TitleSection />
      <CollectionSearch queryRef={query} />

      <NewTooltip
        {...getFloatingProps()}
        style={floatingStyle}
        ref={floating}
        text="How to set up your gallery"
      />
      <InteractiveLink href={NOTION_DOCS_URL}>
        <a>
          <StyledIconContainer
            variant="blue"
            size="md"
            icon={<QuestionMarkIcon />}
            ref={reference}
            {...getReferenceProps()}
          />
        </a>
      </InteractiveLink>
    </CollectionSidebarWrapper>
  );
}

const CollectionSidebarWrapper = styled(VStack)`
  position: relative;
  min-width: 250px;
  max-width: 250px;

  overflow-y: auto;
  max-height: 100%;
  height: 100%;

  padding-top: 16px;

  border-right: 1px solid ${colors.porcelain};
`;

const TitleSectionWrapper = styled(HStack)`
  padding: 0 16px;
`;

const StyledIconContainer = styled(IconContainer)`
  background-color: ${colors.offBlack};
  position: absolute;
  bottom: 16px;
  left: 16px;
  cursor: pointer;

  &:hover {
    background-color: ${colors.metal};
  }
`;
