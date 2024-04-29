import { useCallback, useMemo } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';

import IconContainer from '~/components/core/IconContainer';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM } from '~/components/core/Text/Text';
import { useCollectionEditorContext } from '~/contexts/collectionEditor/CollectionEditorContext';
import { ColumnAdjusterQuery } from '~/generated/ColumnAdjusterQuery.graphql';
import CircleMinusIcon from '~/icons/CircleMinusIcon';
import CirclePlusIcon from '~/icons/CirclePlusIcon';
import useMaxColumnsGalleryEditor from '~/shared/hooks/useMaxColumnsGalleryEditor';
import colors from '~/shared/theme/colors';

type Props = {
  sectionId: string;
};

function ColumnAdjuster({ sectionId }: Props) {
  const query = useLazyLoadQuery<ColumnAdjusterQuery>(
    graphql`
      query ColumnAdjusterQuery {
        viewer {
          ... on Viewer {
            __typename
            ...useMaxColumnsGalleryEditorFragment
          }
        }
      }
    `,
    {}
  );

  if (query.viewer?.__typename !== 'Viewer') {
    throw new Error('Expected viewer to be present');
  }

  const maxColumns = useMaxColumnsGalleryEditor(query.viewer);

  const { incrementColumns, decrementColumns, activeSectionId, sections } =
    useCollectionEditorContext();

  const columns = useMemo(() => {
    return sections.find((section) => section.id === sectionId)?.columns ?? 0;
  }, [sectionId, sections]);

  const handleIncrementClick = useCallback(() => {
    if (activeSectionId && columns < maxColumns) {
      incrementColumns(activeSectionId);
    }
  }, [activeSectionId, columns, incrementColumns, maxColumns]);

  const handleDecrementClick = useCallback(() => {
    if (activeSectionId && columns > 1) {
      decrementColumns(activeSectionId);
    }
  }, [activeSectionId, columns, decrementColumns]);

  return (
    <Container gap={10} align="center" justify="space-between">
      <TitleDiatypeM color={colors.white}>Columns</TitleDiatypeM>

      <HStack gap={8} align="center">
        <IconContainer
          size="xs"
          variant="blue"
          onClick={handleDecrementClick}
          disabled={columns <= 1}
          icon={<CircleMinusIcon />}
        />

        <BaseM color={colors.white}>{columns}</BaseM>

        <IconContainer
          size="xs"
          variant="blue"
          onClick={handleIncrementClick}
          disabled={columns >= maxColumns}
          icon={<CirclePlusIcon />}
        />
      </HStack>
    </Container>
  );
}

const Container = styled(HStack)`
  background: ${colors.activeBlue};
  padding: 2px 4px;

  border-radius: 2px;
`;

export default ColumnAdjuster;
