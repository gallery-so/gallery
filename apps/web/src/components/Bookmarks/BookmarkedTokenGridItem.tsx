import { graphql, useFragment } from 'react-relay';
import { contexts } from 'shared/analytics/constants';
import styled from 'styled-components';

import ShimmerProvider from '~/contexts/shimmer/ShimmerContext';
import { BookmarkedTokenGridItemFragment$key } from '~/generated/BookmarkedTokenGridItemFragment.graphql';
import { useContainedDimensionsForToken } from '~/hooks/useContainedDimensionsForToken';

import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';
import NftPreview from '../NftPreview/NftPreview';

type Props = {
  tokenRef: BookmarkedTokenGridItemFragment$key;
};
const TOKEN_SIZE = 300;

export default function BookmarkedTokenGridItem({ tokenRef }: Props) {
  const token = useFragment(
    graphql`
      fragment BookmarkedTokenGridItemFragment on Token {
        definition {
          name
          media @required(action: THROW) {
            ... on Media {
              ...useContainedDimensionsForTokenFragment
            }
          }
        }
        ...NftPreviewFragment
      }
    `,
    tokenRef
  );

  const resultDimensions = useContainedDimensionsForToken({
    mediaRef: token.definition.media,
    tokenSize: TOKEN_SIZE,
  });

  return (
    <VStack gap={8} justify="flex-end">
      <div>
        <ShimmerProvider>
          <NftPreview tokenRef={token} eventContext={contexts.UserGallery} />
        </ShimmerProvider>
      </div>
      <div>
        <StyledItemName>{token?.definition?.name} </StyledItemName>
      </div>
    </VStack>
  );
}

const StyledItemName = styled(BaseM)`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;
