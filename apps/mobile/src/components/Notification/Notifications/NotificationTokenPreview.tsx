import clsx from 'clsx';
import { ResizeMode } from 'expo-av';
import { useCallback } from 'react';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { graphql, useFragment } from 'react-relay';

import { TokenFailureBoundary } from '~/components/Boundaries/TokenFailureBoundary/TokenFailureBoundary';
import { useTokenStateManagerContext } from '~/contexts/TokenStateManagerContext';
import { NotificationTokenPreviewFragment$key } from '~/generated/NotificationTokenPreviewFragment.graphql';
import { NotificationTokenPreviewWithBoundaryFragment$key } from '~/generated/NotificationTokenPreviewWithBoundaryFragment.graphql';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';

const sizes = {
  single: {
    width: 56,
    height: 56,
  },
  double: {
    width: 40,
    height: 40,
  },
};

type NotificationTokenPreviewWithBoundaryProps = {
  tokenRef: NotificationTokenPreviewWithBoundaryFragment$key;
  count: number;
};

export function NotificationTokenPreviewWithBoundary({
  tokenRef,
  count,
}: NotificationTokenPreviewWithBoundaryProps) {
  const token = useFragment(
    graphql`
      fragment NotificationTokenPreviewWithBoundaryFragment on Token {
        ...NotificationTokenPreviewFragment
        ...TokenFailureBoundaryFragment
      }
    `,
    tokenRef
  );

  return (
    <TokenFailureBoundary tokenRef={token} variant="tiny">
      <NotificationTokenPreview tokenRef={token} count={count} />
    </TokenFailureBoundary>
  );
}

type NotificationTokenPreviewProps = {
  tokenRef: NotificationTokenPreviewFragment$key;
  count: number;
};

function NotificationTokenPreview({ tokenRef, count }: NotificationTokenPreviewProps) {
  const token = useFragment(
    graphql`
      fragment NotificationTokenPreviewFragment on Token {
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
      new CouldNotRenderNftError('RawNftPreviewAsset', 'Failed to render', { id: token.dbid })
    );
  }, [markTokenAsFailed, token.dbid]);

  return (
    <View className="relative">
      {count > 1 ? (
        <ImagePreview tokenUrl={imageUrl} count={count} stacked onError={handleError} />
      ) : null}
      <ImagePreview tokenUrl={imageUrl} count={count} onError={handleError} />
    </View>
  );
}

type ImagePreviewProps = {
  tokenUrl: string;
  count: number;
  stacked?: boolean;
  onError: () => void;
};

function ImagePreview({ tokenUrl, count, stacked, onError }: ImagePreviewProps) {
  return (
    <FastImage
      style={{
        ...sizes[count > 1 ? 'double' : 'single'],
      }}
      className={clsx(
        count > 1 && 'border border-offWhite dark:border-shadow',
        stacked && 'absolute -bottom-1 -right-1'
      )}
      source={{ uri: tokenUrl }}
      resizeMode={ResizeMode.COVER}
      onError={onError}
    />
  );
}
