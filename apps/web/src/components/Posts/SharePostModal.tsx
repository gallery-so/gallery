import { ReactNode, useCallback, useMemo } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';

import { ReadOnlyInput } from '~/components/core/Input/Input';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { SharePostModalQuery } from '~/generated/SharePostModalQuery.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import FarcasterIcon from '~/icons/FarcasterIcon';
import LensIcon from '~/icons/LensIcon';
import TwitterIcon from '~/icons/TwitterIcon';
import { contexts } from '~/shared/analytics/constants';
import { getPreviewImageUrlsInlineDangerously } from '~/shared/relay/getPreviewImageUrlsInlineDangerously';
import { noop } from '~/shared/utils/noop';
import { getBaseUrl } from '~/utils/getBaseUrl';

import breakpoints from '../core/breakpoints';
import { Button } from '../core/Button/Button';
import { HStack, VStack } from '../core/Spacer/Stack';
import { MiniPostOpenGraphPreview } from './MiniPostOpenGraphPreview';

type Props = {
  postId: string;
  tokenName?: string;
  creatorName?: string;
};

const shareButtonsDetails = [
  {
    icon: <FarcasterIcon fill="#FEFEFE" />,
    title: 'WARPCAST',
    baseComposePostUrl: 'https://warpcast.com/~/compose',
  },
  {
    icon: <LensIcon fill="#FEFEFE" />,
    title: 'LENS',
    baseComposePostUrl: 'https://hey.xyz/',
  },
  {
    icon: <TwitterIcon fill="#FEFEFE" />,
    title: 'TWITTER',
    baseComposePostUrl: 'https://twitter.com/intent/tweet',
  },
];

export default function SharePostModal({ postId, tokenName = 'this', creatorName }: Props) {
  const queryResponse = useLazyLoadQuery<SharePostModalQuery>(
    graphql`
      query SharePostModalQuery($postId: DBID!) {
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
    { postId: postId }
  );

  const { post } = queryResponse;
  const postUrl = `${getBaseUrl()}/post/${postId}`;

  const { pushToast } = useToastActions();

  const handleCopyToClipboard = useCallback(async () => {
    void navigator.clipboard.writeText(postUrl);
    pushToast({ message: 'Copied link to clipboard', autoClose: true });
  }, [postUrl, pushToast]);

  const handleShareButtonClick = useCallback(
    (baseComposePostUrl: string) => {
      const creatorInfo = creatorName ? ` by ${creatorName}` : '';
      const message = `I 🤍 ${tokenName}${creatorInfo}\n\n${postUrl}`;
      const encodedMessage = encodeURIComponent(message);

      window.open(`${baseComposePostUrl}?text=${encodedMessage}`, '_blank');
    },
    [creatorName, tokenName, postUrl]
  );

  // stripped down version of the pfp retrieving logic in ProfilePicture.tsx
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
    <StyledContainer>
      <VStack gap={16}>
        <HStack>
          <MiniPostOpenGraphPreview
            caption={caption}
            username={username}
            imageUrl={imageUrl}
            profileImageUrl={profileImageUrl ?? ''}
          />
        </HStack>
        <HStack gap={8}>
          {shareButtonsDetails.map((btnData) => (
            <ShareButton
              key={btnData.title}
              title={btnData.title}
              icon={btnData.icon}
              onClick={() => handleShareButtonClick(btnData.baseComposePostUrl)}
            />
          ))}
        </HStack>
        <StyledPostUrlContainer gap={8}>
          <InputContainer>
            <ReadOnlyInput
              onChange={noop}
              disabled={true}
              defaultValue={postUrl}
              placeholder="post link"
            />
          </InputContainer>
          <Button
            onClick={handleCopyToClipboard}
            variant="secondary"
            eventContext={contexts.Posts}
            eventName="Copy Post Url"
            eventElementId="Click Copy Post Url"
          >
            COPY
          </Button>
        </StyledPostUrlContainer>
      </VStack>
    </StyledContainer>
  );
}

const StyledContainer = styled.div`
  min-width: 324px;
  max-width: 100%;

  @media only screen and ${breakpoints.desktop} {
    min-width: 480px;
    font-size: 14px;
  }
`;

type ButtonProps = {
  title: string;
  icon: ReactNode;
  onClick: () => void;
};

function ShareButton({ title, icon, onClick }: ButtonProps) {
  const isMobile = useIsMobileWindowWidth();

  return (
    <StyledButton
      onClick={onClick}
      eventContext={contexts.Posts}
      eventName="Click Share"
      eventElementId="Click Share Button"
      properties={{ variant: title }}
    >
      <StyledInnerShareButton gap={!isMobile ? 8 : 6} align="center">
        {icon}
        {title}
      </StyledInnerShareButton>
    </StyledButton>
  );
}

const StyledButton = styled(Button)`
  flex-wrap: wrap;
  height: 32px;
  flex: 1;
  padding: 4px;
  font-size: 12px;

  @media only screen and ${breakpoints.desktop} {
    padding: 8px 24px;
  }
`;

const InputContainer = styled.div`
  width: 82%;
  height: 30px;
  font-size: 14px;
`;

const StyledPostUrlContainer = styled(HStack)`
  margin-bottom: 14px;
`;

const StyledInnerShareButton = styled(HStack)`
  font-size: 12px;
`;
