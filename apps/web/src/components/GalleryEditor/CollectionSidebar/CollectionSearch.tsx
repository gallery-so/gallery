import { useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { FadedInput } from '~/components/core/Input/FadedInput';
import { VStack } from '~/components/core/Spacer/Stack';
import { CollectionSearchResults } from '~/components/GalleryEditor/CollectionSidebar/CollectionSearchResults';
import { CollectionSearchQueryFragment$key } from '~/generated/CollectionSearchQueryFragment.graphql';

type Props = {
  queryRef: CollectionSearchQueryFragment$key;
};

export function CollectionSearch({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment CollectionSearchQueryFragment on Query {
        ...CollectionSearchResultsQueryFragment
      }
    `,
    queryRef
  );

  const [searchQuery, setSearchQuery] = useState('');

  return (
    <VStack gap={8}>
      <CollectionSearchBoxContainer>
        <FadedInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search all sections"
          size="md"
        />
      </CollectionSearchBoxContainer>

      <CollectionSearchResults searchQuery={searchQuery} queryRef={query} />
    </VStack>
  );
}
const CollectionSearchBoxContainer = styled(VStack)`
  box-sizing: border-box;
  padding: 8px 10px;
`;
