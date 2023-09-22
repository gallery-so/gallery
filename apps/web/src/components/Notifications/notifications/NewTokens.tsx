import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { NftFailureBoundary } from '~/components/NftFailureFallback/NftFailureBoundary';
import { PostComposerModal } from '~/components/Posts/PostComposerModal';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { NewTokensFragment$key } from '~/generated/NewTokensFragment.graphql';
import { NewTokensTokenPreviewFragment$key } from '~/generated/NewTokensTokenPreviewFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';
import colors from '~/shared/theme/colors';

type Props = {
  notificationRef: NewTokensFragment$key;
  onClose: () => void;
};

export function NewTokens({ notificationRef, onClose }: Props) {
  const notification = useFragment(
    graphql`
      fragment NewTokensFragment on NewTokensNotification {
        __typename
        count
        token {
          ... on Token {
            __typename
            dbid
            name
            ...NewTokensTokenPreviewFragment
          }
        }
      }
    `,
    notificationRef
  );

  const { token } = notification;
  const isMobile = useIsMobileWindowWidth();
  const track = useTrack();
  const { showModal } = useModalActions();

  if (token?.__typename !== 'Token') {
    throw new Error("We couldn't find that token. Something went wrong and we're looking into it.");
  }

  const quantity = notification.count ?? 1;

  const handleCreatePostClick = useCallback(() => {
    track('NFT Detail: Clicked Create Post');
    showModal({
      content: <PostComposerModal tokenId={token.dbid} />,
      headerVariant: 'thicc',
      isFullPage: isMobile,
    });
    onClose();
  }, [isMobile, onClose, showModal, token, track]);

  return (
    <StyledNotificationContent align="center" justify="space-between" gap={8}>
      <HStack align="center" gap={8}>
        <Container>
          <NftFailureBoundary tokenId={token.dbid} fallbackSize="tiny">
            <TokenPreview tokenRef={token} count={quantity} />
          </NftFailureBoundary>
        </Container>

        <VStack>
          <StyledTextWrapper align="center" as="span" wrap="wrap">
            <BaseM>Minted {quantity > 1 && `${quantity}x`}</BaseM>
            <BaseM as="span">
              <strong>{token?.name ? token.name : 'Unknown'}</strong>
            </BaseM>
          </StyledTextWrapper>
        </VStack>
      </HStack>

      <StyledPostButton variant="primary" onClick={handleCreatePostClick}>
        Post
      </StyledPostButton>
    </StyledNotificationContent>
  );
}

const Container = styled.div`
  height: 56px;
  width: 56px;
`;

type TokenPreviewProps = {
  tokenRef: NewTokensTokenPreviewFragment$key;
  count: number;
};

function TokenPreview({ tokenRef, count }: TokenPreviewProps) {
  const token = useFragment(
    graphql`
      fragment NewTokensTokenPreviewFragment on Token {
        ...useGetPreviewImagesSingleFragment
      }
    `,
    tokenRef
  );

  const imageUrl = useGetSinglePreviewImage({ tokenRef: token, size: 'small' }) ?? '';

  return (
    <StyledPostPreviewWrapper>
      {count > 1 && <StyledPostPreview src={imageUrl} count={count} stacked />}
      <StyledPostPreview count={count} src={imageUrl} />
    </StyledPostPreviewWrapper>
  );
}

const StyledNotificationContent = styled(HStack)`
  width: 100%;
`;

const StyledTextWrapper = styled(HStack)`
  display: inline;
`;

const StyledPostPreviewWrapper = styled.div`
  position: relative;
`;

const StyledPostPreview = styled.img<{ stacked?: boolean; count: number }>`
  height: 56px;
  width: 56px;

  ${({ count }) =>
    count > 1 &&
    `
    height: 40px;
    width: 40px;
    border: 1px solid ${colors.offWhite}; 

  `}

  ${({ stacked }) =>
    stacked
      ? `
        position: absolute;
        bottom: -5px;
        right: -5px;  `
      : `
        z-index: 2;
        position: inherit;
  `}
`;

const StyledPostButton = styled(Button)`
  padding: 2px 8px;
  width: 92px;
  height: 24px;
  font-weight: 600;
  text-transform: capitalize;
  border-radius: 2px;
`;
