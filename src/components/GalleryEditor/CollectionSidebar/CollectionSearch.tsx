import { useState } from 'react';
import styled from 'styled-components';

import { FadedInput } from '~/components/core/Input/FadedInput';
import { VStack } from '~/components/core/Spacer/Stack';
import { CollectionSearchResults } from '~/components/GalleryEditor/CollectionSidebar/CollectionSearchResults';

export function CollectionSearch() {
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

      <CollectionSearchResults searchQuery={searchQuery} />
    </VStack>
  );
}
const CollectionSearchBoxContainer = styled(VStack)`
  box-sizing: border-box;
  padding: 8px 10px;
`;
