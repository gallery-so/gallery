import Clipboard from '@react-native-clipboard/clipboard';
import { useColorScheme } from 'nativewind';
import { ReactElement, useCallback, useMemo, useState } from 'react';
import { Linking, View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';
import CopyIcon from 'src/icons/CopyIcon';
import FarcasterIcon from 'src/icons/FarcasterIcon';
import LensIcon from 'src/icons/LensIcon';
import { TwitterIcon } from 'src/icons/TwitterIcon';
import { noop } from 'swr/_internal';

import { Button } from '~/components/Button';
import { FadedInput } from '~/components/FadedInput';
import { Typography } from '~/components/Typography';
import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { useTokenStateManagerContext } from '~/contexts/TokenStateManagerContext';
import { SharePostBottomSheetQuery } from '~/generated/SharePostBottomSheetQuery.graphql';
import { contexts } from '~/shared/analytics/constants';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import { getPreviewImageUrlsInlineDangerously } from '~/shared/relay/getPreviewImageUrlsInlineDangerously';
import colors from '~/shared/theme/colors';

import MiniPostOpenGraphPreview from './MiniPostOpenGraphPreview';

type Props = {
  postId: string;
  title?: string;
  creatorName?: string;
};

export default function SharePostBottomSheet({ title, creatorName, postId }: Props) {
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
              definition {
                name
              }
              dbid
              ...getPreviewImageUrlsInlineDangerouslyFragment
            }
          }
        }
      }
    `,
    { postId: postId }
  );

  const { post } = queryResponse;

  const [hasCopiedUrl, setHasCopiedUrl] = useState(false);

  const postUrl = `https://gallery.so/post/${postId}`;

  const tokenName = useMemo(() => {
    if (post?.__typename === 'Post') {
      const token = post?.tokens?.[0];
      if (token) {
        return token.definition.name;
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

  const copyButtonBorderStyle = useMemo(
    () => ({
      inactive: colorScheme === 'dark' ? 'border border-metal' : '',
      active: colorScheme === 'dark' ? 'border border-metal' : 'border border-black-800',
    }),
    [colorScheme]
  );

  const handleShareButtonPress = useCallback(
    (baseComposePostUrl: string) => {
      const creatorInfo = creatorName ? ` by ${creatorName}` : '';
      const message = `I 🤍 ${tokenName}${creatorInfo}\n\n${postUrl}`;
      const encodedMessage = encodeURIComponent(message);

      Linking.openURL(`${baseComposePostUrl}?text=${encodedMessage}`);
    },
    [creatorName, tokenName, postUrl]
  );

  const { markTokenAsFailed } = useTokenStateManagerContext();

  const handleError = useCallback(() => {
    if (post?.__typename !== 'Post') {
      return;
    }

    const token = post.tokens?.[0];
    if (!token) {
      return null;
    }

    markTokenAsFailed(
      token?.dbid ?? '',
      new CouldNotRenderNftError('RawNftPreviewAsset', 'Failed to render', { id: token.dbid })
    );
  }, [markTokenAsFailed, post]);

  const { hideBottomSheetModal } = useBottomSheetModalActions();

  const handleCopyButtonPress = useCallback(() => {
    Clipboard.setString(postUrl);
    setHasCopiedUrl(true);
    setTimeout(() => {
      hideBottomSheetModal();
      setHasCopiedUrl(false);
    }, 800);
  }, [hideBottomSheetModal, postUrl]);

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

  const imageUrl = result?.type === 'valid' ? result?.urls?.small : '';
  const username = post.author.username ?? '';
  const caption = post.caption ?? '';

  return (
    <View className=" flex flex-col space-y-4">
      <View className="flex flex-col space-y-4">
        <Typography
          className="text-lg text-black-900 dark:text-offWhite"
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
        >
          {title ? title : `Successfully posted ${tokenName}`}
        </Typography>
        <View>
          <MiniPostOpenGraphPreview
            imageUrl={imageUrl ?? ''}
            username={username}
            profileImageUrl={profileImageUrl ?? ''}
            caption={caption}
            onError={handleError}
          />
        </View>
      </View>

      <View className="flex flex-row justify-between">
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
            textClassName="text-metal h-6"
            value={postUrl}
            onChange={noop}
            editable={false}
          />
        </View>
        <Button
          className="w-[81px]"
          onPress={handleCopyButtonPress}
          headerElement={
            hasCopiedUrl ? (
              <View className="ml-2">
                <CopyIcon stroke={colorScheme === 'dark' ? colors.white : colors.black[800]} />
              </View>
            ) : null
          }
          size="sm"
          variant="secondary"
          eventContext={contexts.Posts}
          eventName="Press Copy Post Url"
          eventElementId="Press Copy Post Url Button"
          text={!hasCopiedUrl ? 'COPY' : undefined}
          containerClassName={
            hasCopiedUrl ? copyButtonBorderStyle.active : copyButtonBorderStyle.inactive
          }
        />
      </View>
    </View>
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
      headerElement={icon}
      text={title}
    />
  );
}
