import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Route } from 'nextjs-routes';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';

import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
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

  return (
    <>
      <InteractiveLink to={collectionRoute}>
        <StyledDecoratedCloseIcon />
      </InteractiveLink>
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
            previewPath: `/opengraph/nft/${tokenId}`,
          })
        : null,
    },
  };
};
