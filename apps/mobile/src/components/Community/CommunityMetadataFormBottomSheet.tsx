import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import clsx from 'clsx';
import { ForwardedRef, forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import colors from 'shared/theme/colors';

import { useToastActions } from '~/contexts/ToastContext';
import { env } from '~/env/runtime';
import { CommunityMetadataFormBottomSheetFragment$key } from '~/generated/CommunityMetadataFormBottomSheetFragment.graphql';
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
  communityRef: CommunityMetadataFormBottomSheetFragment$key;
};

function CommunityMetadataFormBottomSheet(
  { communityRef }: Props,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
  const community = useFragment(
    graphql`
      fragment CommunityMetadataFormBottomSheetFragment on Community {
        dbid
        name
      }
    `,
    communityRef
  );

  const { bottom } = useSafeAreaPadding();
  const { pushToast } = useToastActions();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  const [message, setMessage] = useState<string>('adasd');
  const [status, setStatus] = useState<'SUBMITTING' | 'SUCCESS' | 'ERROR' | undefined>();

  const handleSubmitPress = useCallback(async () => {
    setStatus('SUBMITTING');

    try {
      const response = await fetch(
        `https://formspree.io/f/${env.EXPO_PUBLIC_FORMSPEE_REQUEST_COLLECTION_ID}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            communityId: community.dbid,
            communityName: community.name,
            message,
          }),
        }
      );

      if (response.status === 200) {
        setStatus('SUCCESS');
        pushToast({
          message: 'Submitted successfully!',
        });
        bottomSheetRef.current?.dismiss();
      } else {
        setStatus('ERROR');
      }
    } catch (error) {
      setStatus('ERROR');
    }
  }, [community.dbid, community.name, message, pushToast]);

  const isButtonDisabled = useMemo(() => {
    return status === 'SUBMITTING' || !message;
  }, [message, status]);

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
        <View className="flex flex-col space-y-6">
          <Typography
            className="text-lg text-black-900 dark:text-offWhite"
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
          >
            Request changes
          </Typography>
          <Typography
            className="text-lg text-black-900 dark:text-offWhite"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            We're currently updating our editor for collection pages. Let us know what changes you’d
            like and we'll jump on them right away!
          </Typography>
        </View>

        <View className="space-y-8">
          <View className="space-y-2">
            <TextInput
              onChange={(e) => setMessage(e.nativeEvent.text)}
              placeholder="Update Title, Description and/or Profile Picture (include image link)"
              className={clsx('px-3 py-2 bg-offWhite h-32 leading-5 border border-transparent', {
                'border border-red': status === 'ERROR',
              })}
              placeholderTextColor={colors.metal}
              multiline
            />

            {status === 'ERROR' && (
              <Typography
                className="text-sm text-red pl-2 pb-2"
                font={{ family: 'ABCDiatype', weight: 'Regular' }}
              >
                Something went wrong! Please try again
              </Typography>
            )}
          </View>

          <Button
            onPress={handleSubmitPress}
            text="SUBMIT"
            eventElementId="Community Metadata Form Submit Button"
            eventName="Community Metadata Form Submit Press"
            eventContext={contexts.Community}
            disabled={isButtonDisabled}
          />
        </View>
      </View>
    </GalleryBottomSheetModal>
  );
}

const ForwardedCommunityMetadataFormBottomSheet = forwardRef(CommunityMetadataFormBottomSheet);

export { ForwardedCommunityMetadataFormBottomSheet as CommunityMetadataFormBottomSheet };
