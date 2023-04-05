import { useNavigation } from '@react-navigation/native';
import { ResizeMode } from 'expo-av';
import { useCallback, useState } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';
import { Priority } from 'react-native-fast-image';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NftPreviewAsset } from '~/components/NftPreview/NftPreviewAsset';
import { NftPreviewContextMenuPopup } from '~/components/NftPreview/NftPreviewContextMenuPopup';
import { NftPreviewFragment$key } from '~/generated/NftPreviewFragment.graphql';
import { RootStackNavigatorProp } from '~/navigation/types';
import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';

import { GallerySkeleton } from '../GallerySkeleton';

type ImageState = { kind: 'loading' } | { kind: 'loaded'; dimensions: Dimensions | null };

type NftPreviewProps = {
  priority?: Priority;

  tokenRef: NftPreviewFragment$key;
  tokenUrl: string | null;
  resizeMode: ResizeMode;
};

function NftPreviewInner({ tokenRef, tokenUrl, resizeMode, priority }: NftPreviewProps) {
  const token = useFragment(
    graphql`
      fragment NftPreviewFragment on Token {
        dbid
        ...NftPreviewContextMenuPopupFragment
      }
    `,
    tokenRef
  );

  const [imageState, setImageState] = useState<ImageState>({ kind: 'loading' });

  if (!tokenUrl) {
    throw new CouldNotRenderNftError('NftPreview', 'tokenUrl missing');
  }

  const navigation = useNavigation<RootStackNavigatorProp>();
  const handlePress = useCallback(() => {
    navigation.push('NftDetail', {
      tokenId: token.dbid,
    });
  }, [navigation, token.dbid]);

  const handleLoad = useCallback((dimensions: Dimensions | null) => {
    setImageState({ kind: 'loaded', dimensions });
  }, []);

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <NftPreviewContextMenuPopup
        tokenRef={token}
        fallbackTokenUrl={tokenUrl}
        imageDimensions={imageState.kind === 'loaded' ? imageState.dimensions : null}
      >
        <View className="relative h-full w-full">
          <NftPreviewAsset
            tokenUrl={tokenUrl}
            priority={priority}
            resizeMode={resizeMode}
            onLoad={handleLoad}
          />
          {imageState.kind === 'loading' ? (
            <View className="absolute inset-0">
              <GallerySkeleton>
                <SkeletonPlaceholder.Item width="100%" height="100%" />
              </GallerySkeleton>
            </View>
          ) : null}
        </View>
      </NftPreviewContextMenuPopup>
    </TouchableWithoutFeedback>
  );
}

export function NftPreview({ tokenRef, tokenUrl, resizeMode, priority }: NftPreviewProps) {
  return (
    <ReportingErrorBoundary fallback={null}>
      <NftPreviewInner
        tokenRef={tokenRef}
        tokenUrl={tokenUrl}
        resizeMode={resizeMode}
        priority={priority}
      />
    </ReportingErrorBoundary>
  );
}
