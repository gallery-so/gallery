import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Route } from 'nextjs-routes';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';

import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import useKeyDown from '~/hooks/useKeyDown';
import { DecoratedCloseIcon } from '~/icons/CloseIcon';
import { MetaTagProps } from '~/pages/_app';
import GalleryRedirect from '~/scenes/_Router/GalleryRedirect';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import NftDetailPageScene from '~/scenes/NftDetailPage/NftDetailPage';
import { openGraphMetaTags } from '~/utils/openGraphMetaTags';

type NftDetailPageProps = MetaTagProps & {
  tokenId: string;
  collectionId: string;
  username: string;
};

export default function NftDetailPage({ username, collectionId, tokenId }: NftDetailPageProps) {
  const { push } = useRouter();

  // the default "back" behavior from the NFT Detail Page
  // is a redirect to the Collection Page
  const collectionRoute: Route = useMemo(
    () => ({
      pathname: '/[username]/[collectionId]',
      query: { username, collectionId },
    }),
    [username, collectionId]
  );

  const handleReturnToCollectionPage = useCallback(() => {
    push(collectionRoute);
  }, [collectionRoute, push]);

  useKeyDown('Escape', handleReturnToCollectionPage);

  if (!tokenId) {
    // Something went horribly wrong
    return <GalleryRedirect to={{ pathname: '/' }} />;
  }

  // Check if the url params match the legacy url format for Artblocks and Prohibition collection pages and if so redirect to the new collection page url.
  // We updated the Artblocks and Prohibition collection page urls in Feb 2024 to add "/community/".
  // Previously they were formatted like "/artblocks/0x123/123" which fits the nft detail page url pattern
  if ((username === 'artblocks' || username === 'prohibition') && collectionId.startsWith('0x')) {
    return (
      <GalleryRedirect
        to={{
          pathname: `/community/${username}/[contractAddress]/[projectId]`,
          query: { contractAddress: collectionId, projectId: tokenId },
        }}
      />
    );
  }

  return (
    <>
      <GalleryLink to={collectionRoute}>
        <StyledDecoratedCloseIcon />
      </GalleryLink>
      <GalleryRoute
        element={
          <NftDetailPageScene username={username} collectionId={collectionId} tokenId={tokenId} />
        }
        navbar={false}
        footer={false}
      />
    </>
  );
}

const StyledDecoratedCloseIcon = styled(DecoratedCloseIcon)`
  z-index: 3;
  position: absolute;
  right: 0;
  top: 0;
`;

export const getServerSideProps: GetServerSideProps<NftDetailPageProps> = async ({ params }) => {
  const username = params?.username ? (params.username as string) : '';
  const tokenId = params?.tokenId ? (params.tokenId as string) : '';
  const collectionId = params?.collectionId ? (params.collectionId as string) : '';

  return {
    props: {
      username,
      tokenId,
      collectionId,
      metaTags: tokenId
        ? openGraphMetaTags({
            title: `${username} | Gallery`,
            path: `/nft/${tokenId}`,
            isFcFrameCompatible: false,
          })
        : null,
    },
  };
};
