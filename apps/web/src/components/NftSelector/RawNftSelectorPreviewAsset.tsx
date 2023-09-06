import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { RawNftSelectorPreviewAssetFragment$key } from '~/generated/RawNftSelectorPreviewAssetFragment.graphql';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';

import transitions from '../core/transitions';

type Props = {
  isSelected: boolean;
  src: string;
  onLoad: () => void;
};

export function RawNftSelectorPreviewAsset({ isSelected, src, onLoad }: Props) {
  return <StyledImage isSelected={isSelected} src={src} alt="token" onLoad={onLoad} />;
}

type NftSelectorPreviewAssetProps = {
  tokenRef: RawNftSelectorPreviewAssetFragment$key;
  onLoad: () => void;
};

export function NftSelectorPreviewAsset({ tokenRef, onLoad }: NftSelectorPreviewAssetProps) {
  const token = useFragment(
    graphql`
      fragment RawNftSelectorPreviewAssetFragment on Token {
        ...useGetPreviewImagesSingleFragment
      }
    `,
    tokenRef
  );

  const imageUrl = useGetSinglePreviewImage({ tokenRef: token, size: 'medium' });

  if (!imageUrl) {
    throw new CouldNotRenderNftError('NftSelectorPreviewAsset', 'could not find medium image url');
  }

  return <RawNftSelectorPreviewAsset isSelected={false} src={imageUrl} onLoad={onLoad} />;
}

type SelectedProps = {
  isSelected?: boolean;
};

const StyledImage = styled.img<SelectedProps>`
  max-height: 100%;
  max-width: 100%;
  transition: opacity ${transitions.cubic};
  opacity: ${({ isSelected }) => (isSelected ? 0.5 : 1)};

  height: auto;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
`;
