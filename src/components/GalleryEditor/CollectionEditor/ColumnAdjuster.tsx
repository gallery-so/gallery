import { useCallback, useMemo } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import IconContainer from '~/components/core/Markdown/IconContainer';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM } from '~/components/core/Text/Text';
import { useCollectionEditorContextNew } from '~/contexts/collectionEditor/CollectionEditorContextNew';
import useMaxColumns from '~/contexts/collectionEditor/useMaxColumns';
import { ColumnAdjusterQuery } from '~/generated/ColumnAdjusterQuery.graphql';
import CircleMinusIcon from '~/icons/CircleMinusIcon';
import CirclePlusIcon from '~/icons/CirclePlusIcon';

function ColumnAdjuster() {
  const query = useLazyLoadQuery<ColumnAdjusterQuery>(
    graphql`
      query ColumnAdjusterQuery {
        viewer {
          ... on Viewer {
            __typename
            ...useMaxColumnsFragment
          }
        }
      }
    `,
    {}
  );

  if (query.viewer?.__typename !== 'Viewer') {
    throw new Error('Expected viewer to be present');
  }

  const maxColumns = useMaxColumns(query.viewer);

  const { incrementColumns, decrementColumns, activeSectionId, sections } =
    useCollectionEditorContextNew();

  const columns = useMemo(() => {
    if (activeSectionId) {
      return sections[activeSectionId]?.columns ?? 0;
    }

    return 0;
  }, [activeSectionId, sections]);

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
