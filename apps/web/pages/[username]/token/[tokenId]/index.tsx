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
import TokenDetailPageScene from '~/scenes/TokenDetailPage/TokenDetailPage';
import { openGraphMetaTags } from '~/utils/openGraphMetaTags';

type TokenDetailPageProps = MetaTagProps & {
  tokenId: string;
  username: string;
};

// A variant of the NFT Detail Page that does not need collection information.
// We use this for enabling the Detail Page for tokens that are not part of a collection.
// It uses the Token type, instead of the CollectionToken type.
export default function TokenDetailPage({ username, tokenId }: TokenDetailPageProps) {
  const { push } = useRouter();

  // the default "back" behavior from the NFT Detail Page is a redirect to the User Profile
  const userRoute: Route = useMemo(
    () => ({
      pathname: '/[username]',
      query: { username },
    }),
    [username]
  );

  const handleReturnToUserPage = useCallback(() => {
    push(userRoute);
  }, [userRoute, push]);

  useKeyDown('Escape', handleReturnToUserPage);

  if (!tokenId) {
    return <GalleryRedirect to={{ pathname: `/[username]`, query: { username } }} />;
  }

  return (
    <>
      <InteractiveLink to={userRoute}>
        <StyledDecoratedCloseIcon />
      </InteractiveLink>
      <GalleryRoute
        element={<TokenDetailPageScene tokenId={tokenId} />}
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

export const getServerSideProps: GetServerSideProps<TokenDetailPageProps> = async ({ params }) => {
  const username = params?.username ? (params.username as string) : '';
  const tokenId = params?.tokenId ? (params.tokenId as string) : '';

  return {
    props: {
      username,
      tokenId,
      metaTags: tokenId
        ? openGraphMetaTags({
            title: `${username} | Gallery`,
            previewPath: `/opengraph/nft/${tokenId}`,
          })
        : null,
    },
  };
};
