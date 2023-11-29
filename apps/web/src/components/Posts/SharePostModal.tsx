import { ReactNode, useCallback, useMemo } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';

import Input from '~/components/core/Input/Input';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { SharePostModalQuery } from '~/generated/SharePostModalQuery.graphql';
import FarcasterIcon from '~/icons/FarcasterIcon';
import LensIcon from '~/icons/LensIcon';
import TwitterIcon from '~/icons/TwitterIcon';
import { contexts } from '~/shared/analytics/constants';
import { getPreviewImageUrlsInlineDangerously } from '~/shared/relay/getPreviewImageUrlsInlineDangerously';
import { noop } from '~/shared/utils/noop';

import { Button } from '../core/Button/Button';
import { HStack, VStack } from '../core/Spacer/Stack';
import { MiniPostOpenGraphPreview } from './MiniPostOpenGraphPreview';

type Props = {
  postId: string;
  tokenName?: string;
};

export default function SharePostModal({ postId, tokenName = 'this' }: Props) {
  const realPostId = postId.substring(5);
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
    { postId: realPostId }
  );

  const { post } = queryResponse;
  const postUrl = `https://gallery.so/post/${realPostId}`;

  console.log('post', post);
  const { pushToast } = useToastActions();

  const handleCopyToClipboard = useCallback(async () => {
    void navigator.clipboard.writeText(postUrl);
    pushToast({ message: 'Copied link to clipboard', autoClose: true });
  }, [postUrl, pushToast]);

  const handleShareButtonClick = useCallback(
    (baseComposePostUrl: string) => {
      const message = `I just posted ${tokenName} on gallery ${postUrl}`;
      const encodedMessage = encodeURIComponent(message);

      window.open(`${baseComposePostUrl}?text=${encodedMessage}`, '_blank');
    },
    [tokenName, postUrl]
  );

  // stripped down version of the pfp retrieving logic in ProfilePicture.tsx
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
        return result.urls.small;
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

  const shareButtonsDetails = [
    {
      icon: <FarcasterIcon fillColor="white" />,
      title: 'WARPCAST',
      baseComposePostUrl: 'https://warpcast.com/~/compose',
    },
    {
      icon: <LensIcon fillColor="white" />,
      title: 'LENS',
      baseComposePostUrl: 'https://hey.xyz/',
    },
    {
      icon: <TwitterIcon fillColor="white" />,
      title: 'TWITTER',
      baseComposePostUrl: 'https://twitter.com/intent/tweet',
    },
  ];

  return (
    <StyledConfirmation>
      <VStack gap={16}>
        <HStack justify="space-between">
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
        <StyledContainer gap={8}>
          <InputContainer>
            <Input onChange={noop} disabled={true} defaultValue={postUrl} placeholder="post link" />
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
        </StyledContainer>
      </VStack>
    </StyledConfirmation>
  );
}

const StyledConfirmation = styled.div`
  min-width: 480px;
  max-width: 100%;
`;

type ButtonProps = {
  title: string;
  icon: ReactNode;
  onClick: () => void;
};

function ShareButton({ title, icon, onClick }: ButtonProps) {
  return (
    <StyledButton
      onClick={onClick}
      eventContext={contexts.Posts}
      eventName="Click Share"
      eventElementId="Click Share Button"
    >
      <HStack gap={8} align="center">
        {icon}
        {title}
      </HStack>
    </StyledButton>
  );
}

const StyledButton = styled(Button)`
  gap: 12px;
  flex-wrap: wrap;
  height: 32px;
  flex: 1;
`;

const InputContainer = styled.div`
  width: 82%;
  height: 32px;
`;

const StyledContainer = styled(HStack)`
  margin-bottom: 24px;
`;
