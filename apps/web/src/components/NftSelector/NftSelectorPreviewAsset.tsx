import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { NftSelectorPreviewAssetFragment$key } from '~/generated/NftSelectorPreviewAssetFragment.graphql';
import { useNftRetry } from '~/hooks/useNftRetry';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';

import transitions from '../core/transitions';

type NftSelectorPreviewAssetProps = {
  tokenRef: NftSelectorPreviewAssetFragment$key;
  resizeToSquare?: boolean;
};

export function NftSelectorPreviewAsset({
  tokenRef,
  resizeToSquare = true,
}: NftSelectorPreviewAssetProps) {
  const token = useFragment(
    graphql`
      fragment NftSelectorPreviewAssetFragment on Token {
        dbid
        ...useGetPreviewImagesSingleFragment
      }
    `,
    tokenRef
  );

  const imageUrl = useGetSinglePreviewImage({ tokenRef: token, size: 'medium' }) ?? '';

  const { handleNftLoaded } = useNftRetry({ tokenId: token.dbid });
  if (resizeToSquare) {
    return (
      <StyledSquareImage isSelected={false} src={imageUrl} alt="token" onLoad={handleNftLoaded} />
    );
  } else {
    return <StyledImage isSelected={false} src={imageUrl} alt="token" onLoad={handleNftLoaded} />;
  }
}

type SelectedProps = {
  isSelected?: boolean;
};

const StyledImage = styled.img<SelectedProps>`
  max-height: 100%;
  max-width: 100%;
  transition: opacity ${transitions.cubic};
  opacity: ${({ isSelected }) => (isSelected ? 0.5 : 1)};

  object-fit: cover;
`;

const StyledSquareImage = styled.img<SelectedProps>`
  max-height: 100%;
  max-width: 100%;
  transition: opacity ${transitions.cubic};
  opacity: ${({ isSelected }) => (isSelected ? 0.5 : 1)};

  height: auto;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
`;
