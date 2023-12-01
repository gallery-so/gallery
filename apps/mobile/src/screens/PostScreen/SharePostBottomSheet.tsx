import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { ForwardedRef, forwardRef, ReactElement, useCallback, useRef, useMemo } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { Linking, View } from 'react-native';
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
import { contexts } from '~/shared/analytics/constants';
import { SharePostBottomSheetQuery } from '~/generated/SharePostBottomSheetQuery.graphql';
import { getPreviewImageUrlsInlineDangerously } from '~/shared/relay/getPreviewImageUrlsInlineDangerously';
import MiniPostOpenGraphPreview from './MiniPostOpenGraphPreview';

const SNAP_POINTS = ['CONTENT_HEIGHT'];

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {
  postId: string;
};

function SharePostBottomSheet(props: Props, ref: ForwardedRef<GalleryBottomSheetModalType>) {
  const navigation = useNavigation();
  const realPostId = props.postId;
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
              ...getPreviewImageUrlsInlineDangerouslyFragment
            }
          }
        }
      }
    `,
    { postId: realPostId }
  );

  const { post } = queryResponse;
  const { bottom } = useSafeAreaPadding();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  // const postId = 'jorjro';
  const postUrl = `https://gallery.so/post/${realPostId}`;
  const tokenName = 'allstarz';

  const handleShareButtonPress = useCallback(
    (baseComposePostUrl: string) => {
      const message = `I just posted ${tokenName} on gallery ${postUrl}`;
      const encodedMessage = encodeURIComponent(message);

      Linking.openURL(`${baseComposePostUrl}?text=${encodedMessage}`);
    },
    [tokenName, postUrl]
  );

  const handleCopyButtonPress = useCallback(() => {
    //Clipboard.setString(postUrl);
  }, [postUrl]);

  const profileImageUrl = useMemo(() => {
    if (!post || post?.__typename !== 'Post') {
      return null;
    }

    const { token, profileImage } = post.author.profileImage ?? {};

    if (profileImage && profileImage.previewURLs?.medium) {
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

  const shareButtonDetails = [
    {
      icon: <FarcasterIcon fill="white" />,
      title: 'WARPCAST',
      baseComposePostUrl: 'https://warpcast.com/~/compose',
    },
    {
      icon: <LensIcon color="black" fill="white" />,
      title: 'LENS',
      baseComposePostUrl: 'https://hey.xyz/',
    },
    {
      icon: <TwitterIcon fill="white" />,
      title: 'TWITTER',
      baseComposePostUrl: 'https://twitter.com/intent/tweet',
    },
  ];

  const imageUrl = result.urls.small ?? '';
  const username = post.author.username ?? '';
  const caption = post.caption ?? '';

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
            Successfuly posted {tokenName}
          </Typography>
          <MiniPostOpenGraphPreview
            imageUrl={imageUrl}
            username={username}
            profileImageUrl={profileImageUrl ?? ''}
            caption={caption}
          />
        </View>
        <View className="flex flex-row space-x-4 justify-between">
          {shareButtonDetails.map((btnDetails) => (
            <ShareButton
              title={btnDetails.title}
              icon={btnDetails.icon}
              onPress={() => handleShareButtonPress(btnDetails.baseComposePostUrl)}
            />
          ))}
        </View>

        <View className="flex flex-row">
          <View className="w-9/12">
            <FadedInput value={postUrl} onChange={noop} editable={false} />
          </View>
          <Button
            className="w-[81px] h-[32]px"
            onPress={handleCopyButtonPress}
            size="sm"
            variant="secondary"
            eventContext={contexts.Posts}
            eventName="Press Copy Post Url"
            eventElementId="Press Copy Post Url Button"
            text="COPY"
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
      icon={icon}
      text={title}
    />
  );
}

const ForwardedSharePostBottomSheet = forwardRef(SharePostBottomSheet);

export { ForwardedSharePostBottomSheet as SharePostBottomSheet };
