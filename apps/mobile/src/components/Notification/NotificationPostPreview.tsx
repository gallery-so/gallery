import { ResizeMode } from 'expo-av';
import FastImage from 'react-native-fast-image';
import { graphql, useFragment } from 'react-relay';

import { NotificationPostPreviewFragment$key } from '~/generated/NotificationPostPreviewFragment.graphql';
import { NotificationPostPreviewWithBoundaryFragment$key } from '~/generated/NotificationPostPreviewWithBoundaryFragment.graphql';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';

import { TokenFailureBoundary } from '../Boundaries/TokenFailureBoundary';

type NotificationPostPreviewProps = {
  tokenRef: NotificationPostPreviewFragment$key;
};

function NotificationPostPreview({ tokenRef }: NotificationPostPreviewProps) {
  const token = useFragment(
    graphql`
      fragment NotificationPostPreviewFragment on Token {
        ...useGetPreviewImagesSingleFragment
      }
    `,
    tokenRef
  );

  const imageUrl = useGetSinglePreviewImage({ tokenRef: token, size: 'small' }) ?? '';

  return (
    <FastImage className="w-full h-full" source={{ uri: imageUrl }} resizeMode={ResizeMode.COVER} />
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
    <TokenFailureBoundary tokenRef={token}>
      <NotificationPostPreview tokenRef={token} />
    </TokenFailureBoundary>
  );
}
