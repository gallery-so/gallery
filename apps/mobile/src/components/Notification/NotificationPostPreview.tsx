import { ResizeMode } from 'expo-av';
import FastImage from 'react-native-fast-image';
import { graphql, useFragment } from 'react-relay';

import { NotificationPostPreviewFragment$key } from '~/generated/NotificationPostPreviewFragment.graphql';
import { NotificationPostPreviewWithBoundaryFragment$key } from '~/generated/NotificationPostPreviewWithBoundaryFragment.graphql';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';

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
    <FastImage
      style={{ width: 56, height: 56 }}
      source={{ uri: imageUrl }}
      resizeMode={ResizeMode.COVER}
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
      }
    `,
    tokenRef
  );

  // TODO 09-13-22 wrap this in proper suspense boundary
  return <NotificationPostPreview tokenRef={token} />;
}
