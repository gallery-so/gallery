import { ChangeEventHandler, useCallback, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import { FadedInput } from '~/components/core/Input/FadedInput';
import { VStack } from '~/components/core/Spacer/Stack';
import { BODY_FONT_FAMILY } from '~/components/core/Text/Text';
import { CollectionSearchResults } from '~/components/GalleryEditor/CollectionSidebar/CollectionSearchResults';
import { CollectionSearchFragment$key } from '~/generated/CollectionSearchFragment.graphql';

type CollectionSearchProps = {
  queryRef: CollectionSearchFragment$key;
};

export function CollectionSearch({ queryRef }: CollectionSearchProps) {
  const query = useFragment(
    graphql`
      fragment CollectionSearchFragment on Query {
        ...CollectionSearchResultsFragment
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
          placeholder="Search all collections"
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
