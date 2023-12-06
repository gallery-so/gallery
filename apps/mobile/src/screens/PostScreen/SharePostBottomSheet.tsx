import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import Clipboard from '@react-native-clipboard/clipboard';
import { useColorScheme } from 'nativewind';
import { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Linking, View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';
import CopyIcon from 'src/icons/CopyIcon';
import FarcasterIcon from 'src/icons/FarcasterIcon';
import LensIcon from 'src/icons/LensIcon';
import { TwitterIcon } from 'src/icons/TwitterIcon';
import { noop } from 'swr/_internal';

import { Button } from '~/components/Button';
import { FadedInput } from '~/components/FadedInput';
import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { Typography } from '~/components/Typography';
import { SharePostBottomSheetQuery } from '~/generated/SharePostBottomSheetQuery.graphql';
import { contexts } from '~/shared/analytics/constants';
import { getPreviewImageUrlsInlineDangerously } from '~/shared/relay/getPreviewImageUrlsInlineDangerously';
import colors from '~/shared/theme/colors';

import MiniPostOpenGraphPreview from './MiniPostOpenGraphPreview';

const SNAP_POINTS = ['CONTENT_HEIGHT'];

type Props = {
  postId: string;
  title?: string;
  creatorName?: string;
  onClose?: () => void;
};

export function SharePostBottomSheet({ title, creatorName, postId, onClose }: Props) {
  const queryResponse = useLazyLoadQuery<SharePostBottomSheetQuery>(
    graphql`
      query SharePostBottomSheetQuery($postId: DBID!) {
        post: postById(id: $postId) {
          ... on ErrPostNotFound {
            __typename
          }
          ... on Post {
            __typename
            author @required(action: THROW) {
              username
              profileImage {
                ... on TokenProfileImage {
                  token {
                    ...getPreviewImageUrlsInlineDangerouslyFragment
                  }
                }
                ... on EnsProfileImage {
                  __typename
                  profileImage {
                    __typename
                    previewURLs {
                      medium
                    }
                  }
                }
              }
            }
            caption
            tokens {
              name
              ...getPreviewImageUrlsInlineDangerouslyFragment
            }
          }
        }
      }
    `,
    { postId: postId }
  );

  const { post } = queryResponse;
  const { bottom } = useSafeAreaPadding();
  const [hasCopiedUrl, setHasCopiedUrl] = useState(false);

  const bottomSheetRef = useRef<GalleryBottomSheetModalType>(null);
  useEffect(() => bottomSheetRef.current?.present(), []);

  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  const closeSheet = useCallback(() => {
    if (onClose) {
      onClose();
    }
    bottomSheetRef.current?.dismiss();
  }, [onClose]);

  const postUrl = `https://gallery.so/post/${postId}`;

  const tokenName = useMemo(() => {
    if (post?.__typename === 'Post') {
      const token = post?.tokens?.[0];
      if (token) {
        return token.name;
      }
    }
    return 'this';
  }, [post]);

  const { colorScheme } = useColorScheme();

  const shareButtonDetails = useMemo(() => {
    const fill = colorScheme === 'dark' ? colors.black['800'] : '#FEFEFE';
    return [
      {
        icon: <FarcasterIcon fill={fill} />,
        title: 'WARPCAST',
        baseComposePostUrl: 'https://warpcast.com/~/compose',
      },
      {
        icon: <LensIcon width={22} height={22} fill={fill} />,
        title: 'LENS',
        baseComposePostUrl: 'https://hey.xyz/',
      },
      {
        icon: <TwitterIcon fill={fill} />,
        title: 'TWITTER',
        baseComposePostUrl: 'https://twitter.com/intent/tweet',
      },
    ];
  }, [colorScheme]);

  const handleShareButtonPress = useCallback(
    (baseComposePostUrl: string) => {
      const creatorInfo = creatorName ? ` by ${creatorName}` : '';
      const message = `I 🤍 ${tokenName}${creatorInfo}\n\n${postUrl}`;
      const encodedMessage = encodeURIComponent(message);

      Linking.openURL(`${baseComposePostUrl}?text=${encodedMessage}`);
    },
    [creatorName, tokenName, postUrl]
  );

  const handleCopyButtonPress = useCallback(() => {
    Clipboard.setString(postUrl);
    setHasCopiedUrl(true);
    setTimeout(() => {
      closeSheet();
    }, 800);
  }, [postUrl, closeSheet]);

  const profileImageUrl = useMemo(() => {
    if (post?.__typename !== 'Post') {
      return null;
    }

    const { token, profileImage } = post.author.profileImage ?? {};

    if (profileImage?.previewURLs?.medium) {
      return profileImage.previewURLs.medium;
    }

    if (token) {
      const result = getPreviewImageUrlsInlineDangerously({
        tokenRef: token,
      });
      if (result.type === 'valid') {
        return result.urls.large;
      }
      return null;
    }

    return null;
  }, [post]);

  if (post?.__typename !== 'Post') {
    return null;
  }

  const token = post.tokens?.[0];
  if (!token) {
    return null;
  }

  const result = getPreviewImageUrlsInlineDangerously({ tokenRef: token });
  if (result.type !== 'valid') {
    return null;
  }

  const imageUrl = result.urls.small ?? '';
  const username = post.author.username ?? '';
  const caption = post.caption ?? '';

  return (
    <GalleryBottomSheetModal
      ref={bottomSheetRef}
      snapPoints={animatedSnapPoints}
      handleHeight={animatedHandleHeight}
      contentHeight={animatedContentHeight}
    >
      <View
        onLayout={handleContentLayout}
        style={{ paddingBottom: bottom }}
        className="p-4 flex flex-col space-y-4"
      >
        <View className="flex flex-col space-y-4">
          <Typography
            className="text-lg text-black-900 dark:text-offWhite"
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
          >
            {title ? title : `Successfuly posted ${tokenName}`}
          </Typography>
          <View>
            <MiniPostOpenGraphPreview
              imageUrl={imageUrl}
              username={username}
              profileImageUrl={profileImageUrl ?? ''}
              caption={caption}
            />
          </View>
        </View>

        <View className="flex flex-row space-x-4 justify-between">
          {shareButtonDetails.map((btnDetails) => (
            <ShareButton
              key={btnDetails.title}
              title={btnDetails.title}
              icon={btnDetails.icon}
              onPress={() => handleShareButtonPress(btnDetails.baseComposePostUrl)}
            />
          ))}
        </View>

        <View className="flex flex-row">
          <View className="w-9/12 mr-2">
            <FadedInput
              textClassName="text-[#707070] h-[24px]"
              value={postUrl}
              onChange={noop}
              editable={false}
            />
          </View>
          <Button
            className="w-[81px] h-[32]px"
            onPress={handleCopyButtonPress}
            icon={
              hasCopiedUrl ? (
                <View className="ml-1.5">
                  <CopyIcon />
                </View>
              ) : null
            }
            size="sm"
            variant="secondary"
            eventContext={contexts.Posts}
            eventName="Press Copy Post Url"
            eventElementId="Press Copy Post Url Button"
            text={!hasCopiedUrl ? 'COPY' : undefined}
            containerClassName={hasCopiedUrl ? 'border border-[#141414]' : ''}
          />
        </View>
      </View>
    </GalleryBottomSheetModal>
  );
}

type ButtonProps = {
  title: string;
  icon: ReactElement;
  onPress: () => void;
};

function ShareButton({ title, icon, onPress }: ButtonProps) {
  return (
    <Button
      className="w-[114px]"
      onPress={onPress}
      size="sm"
      eventContext={contexts.Posts}
      eventName="Press Share Post"
      eventElementId="Press Share Post Button"
      properties={{ variant: title }}
      icon={icon}
      text={title}
    />
  );
}
