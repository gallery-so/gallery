import { ResizeMode } from 'expo-av';
import { useCallback } from 'react';
import FastImage from 'react-native-fast-image';
import { graphql, useFragment } from 'react-relay';

import { useTokenStateManagerContext } from '~/contexts/TokenStateManagerContext';
import { NotificationPostPreviewFragment$key } from '~/generated/NotificationPostPreviewFragment.graphql';
import { NotificationPostPreviewWithBoundaryFragment$key } from '~/generated/NotificationPostPreviewWithBoundaryFragment.graphql';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';

import { TokenFailureBoundary } from '../Boundaries/TokenFailureBoundary';

type NotificationPostPreviewProps = {
  tokenRef: NotificationPostPreviewFragment$key;
};

function NotificationPostPreview({ tokenRef }: NotificationPostPreviewProps) {
  const token = useFragment(
    graphql`
      fragment NotificationPostPreviewFragment on Token {
        dbid
        ...useGetPreviewImagesSingleFragment
      }
    `,
    tokenRef
  );

  const imageUrl = useGetSinglePreviewImage({ tokenRef: token, size: 'small' }) ?? '';

  const { markTokenAsFailed } = useTokenStateManagerContext();
  const handleError = useCallback(() => {
    markTokenAsFailed(
      token.dbid,
      new CouldNotRenderNftError('NftDetailAsset', 'Failed to render', { id: token.dbid })
    );
  }, [markTokenAsFailed, token.dbid]);

  return (
    <FastImage
      className="w-full h-full"
      source={{ uri: imageUrl }}
      resizeMode={ResizeMode.COVER}
      onError={handleError}
    />
  );
}

type NotificationPostPreviewWithBoundaryProps = {
  tokenRef: NotificationPostPreviewWithBoundaryFragment$key;
};

export function NotificationPostPreviewWithBoundary({
  tokenRef,
}: NotificationPostPreviewWithBoundaryProps) {
  const token = useFragment(
    graphql`
      fragment NotificationPostPreviewWithBoundaryFragment on Token {
        ...NotificationPostPreviewFragment
        ...TokenFailureBoundaryFragment
      }
    `,
    tokenRef
  );

  return (
    <TokenFailureBoundary tokenRef={token} variant="tiny">
      <NotificationPostPreview tokenRef={token} />
    </TokenFailureBoundary>
  );
}
