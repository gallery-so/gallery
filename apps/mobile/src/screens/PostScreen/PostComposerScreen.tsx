import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import clsx from 'clsx';
import { Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import { useNavigateToCommunityScreen } from 'src/hooks/useNavigateToCommunityScreen';

import { BackButton } from '~/components/BackButton';
import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { PostInput } from '~/components/Post/PostInput';
import { PostMintLinkInput } from '~/components/Post/PostMintLinkInput';
import { PostTokenPreview } from '~/components/Post/PostTokenPreview';
import { WarningPostBottomSheet } from '~/components/Post/WarningPostBottomSheet';
import { SearchResultsFallback } from '~/components/Search/SearchResultFallback';
import { SearchResults } from '~/components/Search/SearchResults';
import { Typography } from '~/components/Typography';
import { PostComposerScreenQuery } from '~/generated/PostComposerScreenQuery.graphql';
import { PostComposerScreenTokenFragment$key } from '~/generated/PostComposerScreenTokenFragment.graphql';
import {
  FeedTabNavigatorProp,
  MainTabStackNavigatorProp,
  PostStackNavigatorParamList,
} from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import { useMentionableMessage } from '~/shared/hooks/useMentionableMessage';
import { getMintUrlWithReferrer } from '~/shared/utils/getMintUrlWithReferrer';
import { noop } from '~/shared/utils/noop';

import { PostComposerNftFallback } from './PostComposerNftFallback';
import { usePost } from './usePost';

function PostComposerScreenInner() {
  const route = useRoute<RouteProp<PostStackNavigatorParamList, 'PostComposer'>>();
  const query = useLazyLoadQuery<PostComposerScreenQuery>(
    graphql`
      query PostComposerScreenQuery($tokenId: DBID!) {
        tokenById(id: $tokenId) {
          ... on Token {
            __typename
            dbid
            definition {
              name
              community {
                creator {
                  ... on GalleryUser {
                    username
                  }
                }
                ...useNavigateToCommunityScreenFragment
              }
              mintUrl
              chain
            }
            ...PostComposerScreenTokenFragment
            ...PostInputTokenFragment
            ...usePostTokenFragment
          }
        }
        viewer {
          ... on Viewer {
            user {
              primaryWallet {
                chainAddress {
                  address
                }
              }
            }
          }
        }
      }
    `,
    {
      tokenId: route.params.tokenId,
    }
  );

  const token = query.tokenById;

  if (token?.__typename !== 'Token') {
    throw new Error("We couldn't find that token. Something went wrong and we're looking into it.");
  }

  const ownerWalletAddress = query.viewer?.user?.primaryWallet?.chainAddress?.address ?? '';

  const mintURLWithRef = getMintUrlWithReferrer(
    token.definition.mintUrl ?? '',
    ownerWalletAddress
  ).url;

  const { post } = usePost({
    tokenRef: token,
  });

  const [isPosting, setIsPosting] = useState(false);

  const mainTabNavigation = useNavigation<MainTabStackNavigatorProp>();
  const feedTabNavigation = useNavigation<FeedTabNavigatorProp>();
  const navigation = useNavigation();

  const [isInvalidMintLink, setIsInvalidMintLink] = useState(false);
  const [mintURL, setMintURL] = useState<string>(mintURLWithRef ?? '');

  // only toggle the mint link on by default if it's on zora network. disable it by default on any other chain.
  // NOTE: on web, if a mint link is manually provided via params (e.g. share-on-gallery from another chain), it'll
  // enable the mint link. we'll need to do this here too once we support better deeplinks.
  const shouldEnableMintLinkByDefault = useMemo(() => {
    return token.definition.chain === 'Zora';
  }, [token.definition.chain]);

  const [includeMintLink, setIncludeMintLink] = useState(shouldEnableMintLinkByDefault);

  const {
    aliasKeyword,
    isSelectingMentions,
    selectMention,
    mentions,
    setMessage,
    message,
    resetMentions,
    handleSelectionChange,
  } = useMentionableMessage();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const handleBackPress = useCallback(() => {
    if (!message) {
      navigation.goBack();
      return;
    }
    Keyboard.dismiss();

    bottomSheetRef.current?.present();
  }, [message, navigation]);

  const navigateToCommunity = useNavigateToCommunityScreen();

  const handlePost = useCallback(async () => {
    const tokenId = token.dbid;

    if (!tokenId || isPosting) {
      return;
    }

    setIsPosting(true);

    const payload = {
      tokenId,
      caption: message,
      mentions,
      mintUrl: '',
    };

    if (includeMintLink) {
      payload.mintUrl = mintURL;
    }

    const response = await post(payload);

    if (response?.postTokens?.post?.__typename !== 'Post') {
      return null;
    }

    const createdPostId = response?.postTokens?.post?.dbid ?? '';
    const creatorName = token?.definition?.community?.creator?.username ?? '';

    mainTabNavigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainTabs',
          params: {
            screen: 'HomeTab',
            params: {
              screen: 'Home',
              params: {
                screen: 'For You',
                params: {
                  postId: createdPostId,
                  creatorName: creatorName,
                },
              },
            },
          },
        },
      ],
    });

    if (route.params.redirectTo === 'Community') {
      if (token.definition.community) {
        navigateToCommunity(token.definition.community, 'navigate');
      }
    } else {
      feedTabNavigation.navigate('Latest', {
        postId: createdPostId,
        creatorName: creatorName,
      });
    }

    setIsPosting(false);
    resetMentions();
  }, [
    token.dbid,
    token.definition.community,
    isPosting,
    message,
    mentions,
    includeMintLink,
    post,
    mainTabNavigation,
    route.params.redirectTo,
    resetMentions,
    mintURL,
    navigateToCommunity,
    feedTabNavigation,
  ]);

  const isPostButtonDisabled = useMemo(() => {
    return isPosting || isInvalidMintLink;
  }, [isInvalidMintLink, isPosting]);

  return (
    <View className="flex flex-col flex-grow space-y-8">
      <View className="px-4 relative flex-row items-center justify-between">
        <BackButton onPress={handleBackPress} />

        <View className="flex flex-row justify-center items-center" pointerEvents="none">
          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            New post
          </Typography>
        </View>

        <GalleryTouchableOpacity
          onPress={handlePost}
          eventElementId="Post Button"
          eventName="Post button clicked"
          eventContext={contexts.Posts}
          disabled={isPostButtonDisabled}
        >
          <Typography
            className={clsx('text-sm', {
              'text-activeBlue': !isPostButtonDisabled,
              'text-metal': isPostButtonDisabled,
            })}
            font={{
              family: 'ABCDiatype',
              weight: 'Bold',
            }}
          >
            POST
          </Typography>
        </GalleryTouchableOpacity>
      </View>

      <View className="px-4 flex flex-col flex-grow space-y-2">
        <PostInput
          value={message}
          onChange={setMessage}
          tokenRef={token}
          onSelectionChange={handleSelectionChange}
          mentions={mentions}
        />
        <PostMintLinkInput
          value={mintURL}
          defaultValue={mintURLWithRef}
          setValue={setMintURL}
          invalid={isInvalidMintLink}
          onSetInvalid={setIsInvalidMintLink}
          includeMintLink={includeMintLink}
          setIncludeMintLink={setIncludeMintLink}
        />
        <View className="py-4 flex-grow">
          {isSelectingMentions ? (
            <View className="flex-1">
              {aliasKeyword ? (
                <Suspense fallback={<SearchResultsFallback />}>
                  <SearchResults
                    keyword={aliasKeyword}
                    activeFilter="top"
                    onChangeFilter={noop}
                    blurInputFocus={noop}
                    onSelect={selectMention}
                    onlyShowTopResults
                    isMentionSearch
                  />
                </Suspense>
              ) : (
                <SearchResultsFallback />
              )}
            </View>
          ) : (
            <Suspense fallback={<PostComposerNftFallback />}>
              <PostTokenPreview />
            </Suspense>
          )}
        </View>
      </View>
      <WarningPostBottomSheet ref={bottomSheetRef} />
    </View>
  );
}

export function PostComposerScreen() {
  const { top } = useSafeAreaInsets();

  return (
    <GalleryTouchableOpacity
      withoutFeedback
      onPress={Keyboard.dismiss}
      accessible={false}
      eventElementId={null}
      eventName={null}
      eventContext={null}
    >
      <View className="flex-1 bg-offWhite dark:bg-black-900" style={{ paddingTop: top }}>
        <Suspense fallback={null}>
          <PostComposerScreenInner />
        </Suspense>
      </View>
    </GalleryTouchableOpacity>
  );
}

type ToastMessageProps = {
  tokenRef: PostComposerScreenTokenFragment$key;
};
export function ToastMessage({ tokenRef }: ToastMessageProps) {
  const token = useFragment(
    graphql`
      fragment PostComposerScreenTokenFragment on Token {
        definition {
          name
        }
      }
    `,
    tokenRef
  );

  return (
    <View className="flex flex-row items-center gap-1">
      <Typography
        className="text-sm text-offBlack dark:text-offWhite"
        font={{ family: 'ABCDiatype', weight: 'Regular' }}
      >
        Successfully posted
      </Typography>
      <Typography
        className="text-sm text-offBlack dark:text-offWhite"
        font={{ family: 'ABCDiatype', weight: 'Bold' }}
      >
        {token.definition?.name}
      </Typography>
    </View>
  );
}
