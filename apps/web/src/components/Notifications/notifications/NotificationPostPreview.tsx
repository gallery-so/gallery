import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { NftFailureBoundary } from '~/components/NftFailureFallback/NftFailureBoundary';
import { NotificationPostPreviewFragment$key } from '~/generated/NotificationPostPreviewFragment.graphql';
import { NotificationPostPreviewWithBoundaryFragment$key } from '~/generated/NotificationPostPreviewWithBoundaryFragment.graphql';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';

type NotificationPostPreviewProps = {
  tokenRef: NotificationPostPreviewFragment$key;
};

function NotificationPostPreview({ tokenRef }: NotificationPostPreviewProps) {
  const token = useFragment(
    graphql`
      fragment NotificationPostPreviewFragment on Token {
        ...useGetPreviewImagesSingleFragment
      }
    `,
    tokenRef
  );

  const imageUrl = useGetSinglePreviewImage({ tokenRef: token, size: 'small' }) ?? '';

  return <StyledPostPreview src={imageUrl} />;
}

const StyledPostPreview = styled.img`
  height: 100%;
  width: 56px;
  object-fit: cover;
`;

type NotificationPostPreviewWithBoundaryProps = {
  tokenRef: NotificationPostPreviewWithBoundaryFragment$key;
};

export function NotificationPostPreviewWithBoundary({
  tokenRef,
}: NotificationPostPreviewWithBoundaryProps) {
  const token = useFragment(
    graphql`
      fragment NotificationPostPreviewWithBoundaryFragment on Token {
        dbid
        ...NotificationPostPreviewFragment
      }
    `,
    tokenRef
  );
  return (
    <StyledContainer>
      <NftFailureBoundary tokenId={token.dbid} fallbackSize="tiny">
        <NotificationPostPreview tokenRef={token} />
      </NftFailureBoundary>
    </StyledContainer>
  );
}

const StyledContainer = styled.div`
  height: 56px;
  width: 56px;
`;
