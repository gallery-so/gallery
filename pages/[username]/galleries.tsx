import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { GalleryNavbar } from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavbar';
import { GetServerSideProps } from 'next';
import { galleriesQuery } from '../../__generated__/galleriesQuery.graphql';
import styled from 'styled-components';
import { useGlobalNavbarHeight } from 'contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';

function GalleryPage() {
  const navbarHeight = useGlobalNavbarHeight();

  return (
    <GalleryPageWrapper navbarHeight={navbarHeight}>
      <div>Hello, World</div>
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
        ...GalleryNavbarFragment
      }
    `,
    { username }
  );

  return (
    <GalleryRoute
      element={<GalleryPage />}
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
