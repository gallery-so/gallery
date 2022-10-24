import { useFragment, useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { GalleryNavbar } from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavbar';
import { GetServerSideProps } from 'next';
import { galleriesQuery } from '../../__generated__/galleriesQuery.graphql';
import styled from 'styled-components';
import { useGlobalNavbarHeight } from 'contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';
import { EmptyState } from 'components/EmptyState/EmptyState';
import { ButtonLink } from 'components/core/Button/Button';
import { galleriesGalleryPageFragment$key } from '../../__generated__/galleriesGalleryPageFragment.graphql';
import { getEditGalleryUrl } from 'utils/getEditGalleryUrl';

type GalleryPageProps = {
  queryRef: galleriesGalleryPageFragment$key;
};

function GalleryPage({ queryRef }: GalleryPageProps) {
  const query = useFragment(
    graphql`
      fragment galleriesGalleryPageFragment on Query {
        ...getEditGalleryUrlFragment
      }
    `,
    queryRef
  );

  const editGalleryUrl = getEditGalleryUrl(query);

  const navbarHeight = useGlobalNavbarHeight();

  return (
    <GalleryPageWrapper navbarHeight={navbarHeight}>
      <EmptyState title={'Coming soon'} description="In the meantime, edit your primary gallery">
        {editGalleryUrl && <ButtonLink href={editGalleryUrl}>Edit Gallery</ButtonLink>}
      </EmptyState>
    </GalleryPageWrapper>
  );
}

const GalleryPageWrapper = styled.div<{ navbarHeight: number }>`
  padding-top: ${({ navbarHeight }) => navbarHeight}px;
  height: calc(100vh - ${({ navbarHeight }) => navbarHeight}px);

  display: flex;
  justify-content: center;
  align-items: center;
`;

type GalleriesProps = {
  username: string;
};

export default function Galleries({ username }: GalleriesProps) {
  const query = useLazyLoadQuery<galleriesQuery>(
    graphql`
      query galleriesQuery($username: String!) {
        ...galleriesGalleryPageFragment
        ...GalleryNavbarFragment
      }
    `,
    { username }
  );

  return (
    <GalleryRoute
      element={<GalleryPage queryRef={query} />}
      footer={false}
      navbar={<GalleryNavbar username={username} queryRef={query} />}
    />
  );
}

export const getServerSideProps: GetServerSideProps<GalleriesProps> = async ({ params }) => {
  const username = params?.username ? (params.username as string) : undefined;

  if (!username)
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };

  return {
    props: {
      username,
    },
  };
};
