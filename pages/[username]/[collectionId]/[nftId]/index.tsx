import NftDetailPageScene from 'scenes/NftDetailPage/NftDetailPage';
import { GetServerSideProps } from 'next';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import { MetaTagProps } from 'pages/_app';
import { openGraphMetaTags } from 'utils/openGraphMetaTags';
import { DecoratedCloseIcon } from 'src/icons/CloseIcon';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useKeyDown from 'hooks/useKeyDown';
import { useCallback } from 'react';

type NftDetailPageProps = MetaTagProps & {
  nftId: string;
  collectionId: string;
};

export default function NftDetailPage({ collectionId, nftId }: NftDetailPageProps) {
  const {
    query: { username },
    push,
  } = useRouter();

  // the default "back" behavior from the NFT Detail Page
  // is a redirect to the Collection Page
  const collectionRoute = `/${username}/${collectionId}`;

  const handleReturnToCollectionPage = useCallback(() => {
    push(collectionRoute);
  }, [collectionRoute, push]);

  useKeyDown('Escape', handleReturnToCollectionPage);

  if (!nftId) {
    // Something went horribly wrong
    return <GalleryRedirect to="/" />;
  }

  return (
    <>
      <Link href={collectionRoute}>
        <StyledDecoratedCloseIcon />
      </Link>
      <NftDetailPageScene collectionId={collectionId} nftId={nftId} />
    </>
  );
}

const StyledDecoratedCloseIcon = styled(DecoratedCloseIcon)`
  z-index: 2;
  position: absolute;
  right: 0;
  top: 0;
`;

export const getServerSideProps: GetServerSideProps<NftDetailPageProps> = async ({ params }) => {
  const username = params?.username ? (params.username as string) : undefined;
  const nftId = params?.nftId ? (params.nftId as string) : '';
  const collectionId = params?.collectionId ? (params.collectionId as string) : '';
  return {
    props: {
      nftId,
      collectionId,
      metaTags: nftId
        ? openGraphMetaTags({
            title: `${username} | Gallery`,
            previewPath: `/opengraph/nft/${nftId}`,
          })
        : null,
    },
  };
};
