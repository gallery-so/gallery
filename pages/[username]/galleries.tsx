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
import { useMemo } from 'react';
import { Route } from 'nextjs-routes';

type GalleryPageProps = {
  queryRef: galleriesGalleryPageFragment$key;
};

function GalleryPage({ queryRef }: GalleryPageProps) {
  const query = useFragment(
    graphql`
      fragment galleriesGalleryPageFragment on Query {
        userByUsername(username: $username) {
          ... on GalleryUser {
            dbid
            username
          }
        }
        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }
        ...getEditGalleryUrlFragment
      }
    `,
    queryRef
  );

  const editGalleryUrl = getEditGalleryUrl(query);

  const navbarHeight = useGlobalNavbarHeight();

  const innerContent = useMemo(() => {
    const isUserTheLoggedInUser =
      query.viewer?.user?.dbid && query.userByUsername?.dbid === query.viewer?.user?.dbid;

    if (isUserTheLoggedInUser) {
      return (
        <EmptyState title={'Coming soon'} description="In the meantime, edit your primary gallery">
          {editGalleryUrl && <ButtonLink href={editGalleryUrl}>Edit Gallery</ButtonLink>}
        </EmptyState>
      );
    } else if (query.userByUsername?.username) {
      const viewGalleryRoute: Route = {
        pathname: '/[username]',
        query: { username: query.userByUsername.username },
      };

      return (
        <EmptyState title={'Coming soon'} description="In the meantime, view their primary gallery">
          <ButtonLink href={viewGalleryRoute}>View Gallery</ButtonLink>
        </EmptyState>
      );
    } else {
      // Something went wrong and we couldn't get the user's username
      // Show something sane instead
      return (
        <EmptyState title={'Coming soon'} description="In the meantime, view your feed">
          <ButtonLink href={{ pathname: '/home' }}>View Feed</ButtonLink>
        </EmptyState>
      );
    }
  }, [
    editGalleryUrl,
    query.userByUsername?.dbid,
    query.userByUsername?.username,
    query.viewer?.user?.dbid,
  ]);

  return <GalleryPageWrapper navbarHeight={navbarHeight}>{innerContent}</GalleryPageWrapper>;
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
