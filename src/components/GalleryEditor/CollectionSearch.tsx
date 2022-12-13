import { ChangeEventHandler, useCallback, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import { VStack } from '~/components/core/Spacer/Stack';
import { BODY_FONT_FAMILY } from '~/components/core/Text/Text';
import { CollectionSearchResults } from '~/components/GalleryEditor/CollectionSearchResults';
import { CollectionSearchFragment$key } from '~/generated/CollectionSearchFragment.graphql';

type CollectionSearchProps = {
  queryRef: CollectionSearchFragment$key;
};

export function CollectionSearch({ queryRef }: CollectionSearchProps) {
  const query = useFragment(
    graphql`
      fragment CollectionSearchFragment on Query {
        galleryById(id: $galleryId) {
          ... on Gallery {
            collections {
              name
            }
          }
        }

        ...CollectionSearchResultsFragment
      }
    `,
    queryRef
  );

  const [searchQuery, setSearchQuery] = useState('');

  const handleInputChange = useCallback<ChangeEventHandler<HTMLInputElement>>((event) => {
    setSearchQuery(event.target.value);
  }, []);

  return (
    <VStack gap={8}>
      <CollectionSearchBoxContainer>
        <CollectionSearchInput
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="Search all collections"
        />
      </CollectionSearchBoxContainer>

      <CollectionSearchResults searchQuery={searchQuery} queryRef={query} />
    </VStack>
  );
}
const CollectionSearchBoxContainer = styled(VStack)`
  padding: 8px 4px;
`;

const CollectionSearchInput = styled.input`
  padding: 8px 12px;

  font-family: ${BODY_FONT_FAMILY};
  color: ${colors.offBlack};
  background-color: ${colors.offWhite};
  border: none;

  font-size: 14px;
  line-height: 20px;
  font-weight: 400;

  ::placeholder {
    color: ${colors.metal};
  }
`;
