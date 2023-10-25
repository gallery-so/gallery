import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { ForwardedRef, forwardRef, useCallback, useRef } from 'react';
import { Text, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { RefreshIcon } from 'src/icons/RefreshIcon';

import { useSyncTokensActions } from '~/contexts/SyncTokensContext';
import { useToastActions } from '~/contexts/ToastContext';
import { CommunityPostBottomSheetFragment$key } from '~/generated/CommunityPostBottomSheetFragment.graphql';
import { contexts } from '~/shared/analytics/constants';

import { Button } from '../Button';
import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '../GalleryBottomSheet/GalleryBottomSheetModal';
import { useSafeAreaPadding } from '../SafeAreaViewWithPadding';
import { Typography } from '../Typography';

const SNAP_POINTS = ['CONTENT_HEIGHT'];

type Props = {
  communityRef: CommunityPostBottomSheetFragment$key;
  onRefresh: () => void;
};

function CommunityPostBottomSheet(
  { communityRef, onRefresh }: Props,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
  const community = useFragment(
    graphql`
      fragment CommunityPostBottomSheetFragment on Community {
        name
        chain
      }
    `,
    communityRef
  );

  const { bottom } = useSafeAreaPadding();
  const { isSyncing, syncTokens } = useSyncTokensActions();
  const { pushToast } = useToastActions();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  const closeBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const handleSync = useCallback(async () => {
    if (!community.chain) return;

    await syncTokens(community.chain);

    closeBottomSheet();

    onRefresh();
    pushToast({
      message: 'Successfully refreshed your collection',
    });
  }, [closeBottomSheet, community.chain, onRefresh, pushToast, syncTokens]);

  return (
    <GalleryBottomSheetModal
      ref={(value) => {
        bottomSheetRef.current = value;

        if (typeof ref === 'function') {
          ref(value);
        } else if (ref) {
          ref.current = value;
        }
      }}
      snapPoints={animatedSnapPoints}
      handleHeight={animatedHandleHeight}
      contentHeight={animatedContentHeight}
    >
      <View
        onLayout={handleContentLayout}
        style={{ paddingBottom: bottom }}
        className="p-4 flex flex-col space-y-6"
      >
        <View className="flex flex-col space-y-4">
          <Typography
            className="text-lg text-black-900 dark:text-offWhite"
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
          >
            Ownership required
          </Typography>
          <Text>
            <Typography
              className="text-md text-black-900 dark:text-offWhite"
              font={{ family: 'ABCDiatype', weight: 'Regular' }}
            >
              Only {community.name} owners can post about {community.name}. If you own this item but
              it's not displaying try
            </Typography>{' '}
            <Typography
              className="text-md text-black-900 dark:text-offWhite"
              font={{ family: 'ABCDiatype', weight: 'Bold' }}
            >
              refreshing your collection.
            </Typography>
          </Text>
          <Button
            text="Ok"
            onPress={closeBottomSheet}
            eventElementId={null}
            eventName={null}
            eventContext={null}
          />
          <Button
            text="Refresh collection"
            variant="secondary"
            loading={isSyncing}
            onPress={handleSync}
            icon={<RefreshIcon />}
            eventElementId="Refresh Tokens From Community Screen Button"
            eventName="Refresh Tokens From Community Screen"
            eventContext={contexts.Posts}
          />
        </View>
      </View>
    </GalleryBottomSheetModal>
  );
}

const ForwardedCommunityPostBottomSheet = forwardRef(CommunityPostBottomSheet);

export { ForwardedCommunityPostBottomSheet as CommunityPostBottomSheet };
