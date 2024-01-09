import { Suspense, useCallback, useMemo, useState } from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import { MAX_POST_LENGTH } from 'shared/utils/getRemainingCharacterCount';
import styled from 'styled-components';

import ErrorText from '~/components/core/Text/ErrorText';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { usePostComposerContext } from '~/contexts/postComposer/PostComposerContext';
import { PostComposerQuery } from '~/generated/PostComposerQuery.graphql';
import { PostComposerTokenFragment$key } from '~/generated/PostComposerTokenFragment.graphql';
import useCreatePost from '~/hooks/api/posts/useCreatePost';
import AlertTriangleIcon from '~/icons/AlertTriangleIcon';
import { ChevronLeftIcon } from '~/icons/ChevronLeftIcon';
import { contexts } from '~/shared/analytics/constants';
import { GalleryElementTrackingProps, useTrack } from '~/shared/contexts/AnalyticsContext';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { useMentionableMessage } from '~/shared/hooks/useMentionableMessage';
import colors from '~/shared/theme/colors';
import { getMintUrlWithReferrer } from '~/shared/utils/getMintUrlWithReferrer';
import { useClearURLQueryParams } from '~/utils/useClearURLQueryParams';

import breakpoints from '../core/breakpoints';
import { Button } from '../core/Button/Button';
import IconContainer from '../core/IconContainer';
import { HStack, VStack } from '../core/Spacer/Stack';
import { TitleS } from '../core/Text/Text';
import { PostComposerMintLinkInput } from './PostComposerMintLinkInput';
import PostComposerNft from './PostComposerNft';
import { PostComposerTextArea } from './PostComposerTextArea';
import SharePostModal from './SharePostModal';

type Props = {
  tokenId: string;
  onBackClick?: () => void;
  eventFlow?: GalleryElementTrackingProps['eventFlow'];
};

export default function PostComposer({ onBackClick, tokenId, eventFlow }: Props) {
  const query = useLazyLoadQuery<PostComposerQuery>(
    graphql`
      query PostComposerQuery($tokenId: DBID!) {
        tokenById(id: $tokenId) {
          ... on Token {
            __typename
            ...PostComposerTokenFragment
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
    { tokenId }
  );

  const { mintPageUrl: mintPageUrlDetectedFromQueryParams, clearUrlParamsAndSelections } =
    usePostComposerContext();

  if (query.tokenById?.__typename !== 'Token') {
    throw new Error("We couldn't find that token. Something went wrong and we're looking into it.");
  }

  const token = useFragment<PostComposerTokenFragment$key>(
    graphql`
      fragment PostComposerTokenFragment on Token {
        dbid
        definition {
          name
          community {
            id
            creator {
              ... on GalleryUser {
                username
              }
            }
          }
          mintUrl
          chain
        }
        ...PostComposerNftFragment
        ...PostComposerTextAreaFragment
      }
    `,
    query.tokenById
  );

  const {
    isSelectingMentions,
    aliasKeyword,
    selectMention,
    mentions,
    setMessage,
    message,
    resetMentions,
    handleSelectionChange,
    closeMention,
  } = useMentionableMessage();

  const descriptionOverLengthLimit = message.length > MAX_POST_LENGTH;

  const ownerWalletAddress = query.viewer?.user?.primaryWallet?.chainAddress?.address ?? '';
  const mintUrlFromQueryOrToken =
    mintPageUrlDetectedFromQueryParams || (token.definition.mintUrl ?? '');
  const mintURLWithRef = getMintUrlWithReferrer(mintUrlFromQueryOrToken, ownerWalletAddress).url;

  const [isInvalidMintLink, setIsInvalidMintLink] = useState(false);
  const [mintURL, setMintURL] = useState<string>(mintURLWithRef ?? '');

  // only toggle the mint link on by default if it's provided manually in query params, OR it's on zora network.
  // on any other chain, disable it by default.
  const shouldEnableMintLinkByDefault = useMemo(() => {
    if (mintPageUrlDetectedFromQueryParams && mintURLWithRef) {
      return true;
    }
    return token.definition.chain === 'Zora';
  }, [mintPageUrlDetectedFromQueryParams, mintURLWithRef, token.definition.chain]);

  const [includeMintLink, setIncludeMintLink] = useState(shouldEnableMintLinkByDefault);

  useClearURLQueryParams('mint_page_url');

  const createPost = useCreatePost();

  const { showModal, hideModal } = useModalActions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const track = useTrack();
  const [generalError, setGeneralError] = useState('');
  const reportError = useReportError();

  const handlePostClick = useCallback(async () => {
    setIsSubmitting(true);
    track('Clicked Post in Post Composer', {
      context: contexts.Posts,
      flow: eventFlow,
      added_description: Boolean(message),
    });
    try {
      const payload = {
        tokens: [{ dbid: token.dbid, communityId: token.definition?.community?.id || '' }],
        caption: message,
        mentions,
        mintUrl: '',
      };

      if (includeMintLink) {
        payload.mintUrl = mintURL;
      }

      const responsePost = await createPost(payload);
      hideModal();
      showModal({
        headerText: `Successfully posted ${token.definition.name || 'item'}`,
        content: (
          <Suspense fallback={<SharePostModalFallback />}>
            <SharePostModal
              postId={responsePost?.dbid ?? ''}
              tokenName={token.definition.name ?? ''}
              creatorName={token.definition.community?.creator?.username ?? ''}
            />
          </Suspense>
        ),
        isFullPage: false,
      });
      resetMentions();
      clearUrlParamsAndSelections();
    } catch (error) {
      setIsSubmitting(false);
      if (error instanceof Error) {
        reportError(error);
      }
      setGeneralError('Post failed to upload, please try again');
    }
  }, [
    track,
    eventFlow,
    message,
    token.dbid,
    token.definition.community?.id,
    token.definition.community?.creator?.username,
    token.definition.name,
    mentions,
    includeMintLink,
    createPost,
    hideModal,
    showModal,
    resetMentions,
    clearUrlParamsAndSelections,
    mintURL,
    reportError,
  ]);

  const handleBackClick = useCallback(() => {
    onBackClick?.();
  }, [onBackClick]);

  return (
    <StyledPostComposer grow justify="space-between">
      <VStack gap={24}>
        <HStack align="center" gap={8}>
          {onBackClick && (
            <IconContainer
              onClick={handleBackClick}
              variant="default"
              size="sm"
              icon={<ChevronLeftIcon />}
            />
          )}
          <TitleS>New post</TitleS>
        </HStack>
        <ContentContainer>
          <PostComposerNft tokenRef={token} />
          <VStack grow gap={8}>
            <PostComposerTextArea
              tokenRef={token}
              isSelectingMentions={isSelectingMentions}
              aliasKeyword={aliasKeyword}
              selectMention={selectMention}
              setMessage={setMessage}
              message={message}
              handleSelectionChange={handleSelectionChange}
              closeMention={closeMention}
            />
            {mintURLWithRef && (
              <PostComposerMintLinkInput
                value={mintURL}
                defaultValue={mintURLWithRef}
                setValue={setMintURL}
                invalid={isInvalidMintLink}
                onSetInvalid={setIsInvalidMintLink}
                includeMintLink={includeMintLink}
                setIncludeMintLink={setIncludeMintLink}
              />
            )}
          </VStack>
        </ContentContainer>
      </VStack>
      <StyledHStack justify={generalError ? 'space-between' : 'flex-end'} align="flex-end">
        {generalError && (
          <StyledWrapper>
            <AlertTriangleIcon color={colors.red} />
            <StyledErrorText message={generalError} />
          </StyledWrapper>
        )}
        <Button
          // tracked in click handler
          eventElementId={null}
          eventName={null}
          eventContext={null}
          variant="primary"
          onClick={handlePostClick}
          disabled={isSubmitting || descriptionOverLengthLimit || isInvalidMintLink}
        >
          POST
        </Button>
      </StyledHStack>
    </StyledPostComposer>
  );
}

const StyledPostComposer = styled(VStack)`
  height: 100%;
  padding: 16px;

  @media only screen and ${breakpoints.tablet} {
    padding: 0;
  }
`;

const StyledHStack = styled(HStack)`
  padding-top: 16px;
`;

const ContentContainer = styled.div`
  display: flex;
  gap: 16px;
  flex-direction: column-reverse;

  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
  }
`;

const StyledErrorText = styled(ErrorText)`
  color: ${colors.red};
`;

const StyledWrapper = styled(HStack)`
  display: flex;
  height: 100%;
  gap: 4px;
  align-items: center;
`;

const SharePostModalFallback = styled.div`
  min-width: 480px;
  min-height: 307px;
  max-width: 100%;
`;
