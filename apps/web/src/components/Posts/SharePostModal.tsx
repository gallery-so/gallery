import { ReactNode, useMemo } from 'react';
import styled from 'styled-components';
import colors from '~/shared/theme/colors';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { useModalActions } from '~/contexts/modal/ModalContext';

import { HStack, VStack } from '../core/Spacer/Stack';
import { noop } from '~/shared/utils/noop';
import { BaseM } from '../core/Text/Text';
import FarcasterIcon from '~/icons/FarcasterIcon';
import LensIcon from '~/icons/LensIcon';
import Input from '~/components/core/Input/Input';
import { Button } from '../core/Button/Button';
import TwitterIcon from '~/icons/TwitterIcon';
import CopyToClipboard from '~/components/CopyToClipboard/CopyToClipboard';
import { MiniPostOpenGraphPreview } from './MiniPostOpenGraphPreview';
import { contexts } from '~/shared/analytics/constants';
import { getPreviewImageUrlsInlineDangerously } from '~/shared/relay/getPreviewImageUrlsInlineDangerously';
import { SharePostModalQuery } from '~/generated/SharePostModalQuery.graphql';

type Props = {
  postId: string;
};

export default function SharePostModal({ postId }: Props) {
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
    { postId: realPostId as string }
  );
  const { post } = queryResponse;

  console.log('postId passed to query', postId.substring(5));
  console.log('queryResponse', queryResponse);
  console.log('post', post);
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

  const { hideModal } = useModalActions();
  const postUrl = `https://gallery.so/post/${realPostId}`;
  console.log('postId', postId);
  const shareButtonsDetails = [
    {
      icon: <FarcasterIcon fillColor="white" />,
      title: 'WARPCAST',
    },
    {
      icon: <LensIcon fillColor="white" />,
      title: 'LENS',
    },
    {
      icon: <TwitterIcon fillColor="white" />,
      title: 'TWITTER',
    },
  ];

  const captionForNow = 'New PFP ( •̀ᴗ•́ ) ♡';
 // const username = 'fraser';
  const imageUrl = result.urls.large ?? '';
  const username = post.author.username ?? '';
  const caption = post.caption ?? '';
//  const imageUrl =
  //  'https://assets.gallery.so/https%3A%2F%2Fstorage.googleapis.com%2Fprod-token-content%2F0-1e-0xfdbff7861236e6f0b846383a74715e9c7e7b57dc-image?auto=format%2Ccompress&fit=max&glryts=1697111079&w=1024&s=beef9f99e6237bdfc9e8cd7a6ceb4a85';
  // const profileImageUrl =
  //'https://assets.gallery.so/https%3A%2F%2Fstorage.googleapis.com%2Fprod-token-content%2F0-1e-0xfdbff7861236e6f0b846383a74715e9c7e7b57dc-image?auto=format%2Ccompress&fit=max&glryts=1697111079&w=1024&s=beef9f99e6237bdfc9e8cd7a6ceb4a85';
  console.log('profileImageUrl', profileImageUrl);

  return (
    <StyledConfirmation>
      <VStack gap={16}>
        <HStack justify="space-between">
          <MiniPostOpenGraphPreview
            caption={captionForNow}
            username={username}
            imageUrl={imageUrl}
            profileImageUrl={profileImageUrl ?? ''}
          />
        </HStack>
        <HStack gap={8}>
          {shareButtonsDetails.map((btnData) => (
            <ShareButton title={btnData.title} icon={btnData.icon} />
          ))}
        </HStack>
        <StyledContainer gap={8}>
          <InputContainer>
            <Input onChange={noop} disabled={true} defaultValue={postUrl} placeholder="post link" />
          </InputContainer>
          <CopyToClipboard textToCopy={postUrl}>
            <Button aria-disabled={true} variant="secondary" eventContext={contexts.Posts}>
              COPY
            </Button>
          </CopyToClipboard>
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
};

function ShareButton({ title, icon }: ButtonProps) {
  return (
    <StyledButton>
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

const CopyButton = styled(Button)`
  pointer-events: none;
`;

const InputContainer = styled.div`
  width: 82%;
  height: 32px;
`;

const StyledContainer = styled(HStack)`
  margin-bottom: 24px;
`;
