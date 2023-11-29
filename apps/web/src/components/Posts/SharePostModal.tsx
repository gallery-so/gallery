import { ReactNode, useMemo, useCallback } from 'react';
import styled from 'styled-components';

import { HStack, VStack } from '../core/Spacer/Stack';
import { noop } from '~/shared/utils/noop';
import { BaseM } from '../core/Text/Text';
import FarcasterIcon from '~/icons/FarcasterIcon';
import LensIcon from '~/icons/LensIcon';
import Input from '~/components/core/Input/Input';
import { Button } from '../core/Button/Button';
import TwitterIcon from '~/icons/TwitterIcon';
import { MiniPostOpenGraphPreview } from './MiniPostOpenGraphPreview';
import { contexts } from '~/shared/analytics/constants';
import { getPreviewImageUrlsInlineDangerously } from '~/shared/relay/getPreviewImageUrlsInlineDangerously';
import useOpenGraphPost from '~/shared/hooks/useOpenGraphPost';
import { useToastActions } from '~/contexts/toast/ToastContext';

type Props = {
  postId: string;
};

export default function SharePostModal({ postId }: Props) {
  const realPostId = postId.substring(5);
  const post = useOpenGraphPost(realPostId);

  console.log('post', post);
  const { pushToast } = useToastActions();

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

  const postUrl = `https://gallery.so/post/${realPostId}`;

  const handleCopyToClipboard = useCallback(async () => {
    void navigator.clipboard.writeText(postUrl);
    pushToast({ message: 'Copied link to clipboard', autoClose: true });
  }, [postUrl, pushToast]);

  const handleShareButtonClick = (baseComposePostUrl: string) => {
    const encodedMessage = encodeURIComponent(message);

    window.open(`${baseComposePostUrl}?text=${encodedMessage}`, '_blank');
  };

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

  const captionForNow = 'New PFP ( •̀ᴗ•́ ) ♡';
  const imageUrl = result.urls.large ?? '';
  const username = post.author.username ?? '';
  const caption = post.caption ?? '';
  const message = `I just posted x on gallery. Check it out here: ${postUrl}`;

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
          <Button onClick={handleCopyToClipboard} variant="secondary" eventContext={contexts.Posts}>
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
  onClick?: () => void;
};

function ShareButton({ title, icon, onClick = noop }: ButtonProps) {
  return (
    <StyledButton onClick={onClick} eventContext={contexts.Posts} eventName="Share Button Clicked">
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
