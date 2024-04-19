import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';
import { TextInput, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import colors from 'shared/theme/colors';

import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { useToastActions } from '~/contexts/ToastContext';
import { env } from '~/env/runtime';
import { CommunityMetadataFormBottomSheetFragment$key } from '~/generated/CommunityMetadataFormBottomSheetFragment.graphql';
import { CommunityMetadataFormBottomSheetQueryFragment$key } from '~/generated/CommunityMetadataFormBottomSheetQueryFragment.graphql';
import { contexts } from '~/shared/analytics/constants';

import { Button } from '../Button';
import { Typography } from '../Typography';

type Props = {
  communityRef: CommunityMetadataFormBottomSheetFragment$key;
  queryRef: CommunityMetadataFormBottomSheetQueryFragment$key;
};

export default function CommunityMetadataFormBottomSheet({ communityRef, queryRef }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityMetadataFormBottomSheetFragment on Community {
        dbid
      }
    `,
    communityRef
  );

  const query = useFragment(
    graphql`
      fragment CommunityMetadataFormBottomSheetQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }
      }
    `,
    queryRef
  );

  const { pushToast } = useToastActions();

  const userId = query.viewer?.user?.dbid;

  const [message, setMessage] = useState<string>('');
  const [status, setStatus] = useState<'SUBMITTING' | 'SUCCESS' | 'ERROR' | undefined>();
  const { hideBottomSheetModal } = useBottomSheetModalActions();

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
            userId,
            message,
          }),
        }
      );

      if (response.status === 200) {
        setStatus('SUCCESS');
        pushToast({
          message: 'Submitted successfully!',
        });
        hideBottomSheetModal();
      } else {
        setStatus('ERROR');
      }
    } catch (error) {
      setStatus('ERROR');
    }
  }, [community.dbid, hideBottomSheetModal, message, pushToast, userId]);

  const isButtonDisabled = useMemo(() => {
    return status === 'SUBMITTING' || !message;
  }, [message, status]);

  return (
    <View className="flex flex-col space-y-6">
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
  );
}
