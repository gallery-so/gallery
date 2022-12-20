import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { GalleryEditor } from '~/components/GalleryEditor/GalleryEditor';
import { OrganizeGallery } from '~/components/ManageGallery/OrganizeGallery/OrganizeGallery';
import FullPageStep from '~/components/Onboarding/FullPageStep';
import { GalleryEditNavbar } from '~/contexts/globalLayout/GlobalNavbar/GalleryEditNavbar/GalleryEditNavbar';
import { MultiGalleryEditGalleryNavbar } from '~/contexts/globalLayout/MultiGalleryEditGalleryNavbar/MultiGalleryEditGalleryNavbar';
import { useCanGoBack } from '~/contexts/navigation/GalleryNavigationProvider';
import { editGalleryPageNewQuery } from '~/generated/editGalleryPageNewQuery.graphql';
import { editGalleryPageOldQuery } from '~/generated/editGalleryPageOldQuery.graphql';
import { editGalleryPageQuery } from '~/generated/editGalleryPageQuery.graphql';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';

type Props = {
  galleryId: string;
};

function NewEditGalleryPage({ galleryId }: Props) {
  const { back, replace } = useRouter();

  const query = useLazyLoadQuery<editGalleryPageNewQuery>(
    graphql`
      query editGalleryPageNewQuery($galleryId: DBID!) {
        viewer {
          ... on Viewer {
            user {
              username
            }
          }
        }

        ...GalleryEditorFragment
      }
    `,
    { galleryId }
  );

  const canGoBack = useCanGoBack();
  const handleBack = useCallback(() => {
    if (canGoBack) {
      back();
    } else if (query.viewer?.user?.username) {
      replace({
        pathname: '/[username]/galleries',
        query: { username: query.viewer.user.username },
      });
    } else {
      replace({ pathname: '/home' });
    }
  }, [back, canGoBack, query.viewer?.user?.username, replace]);

  const handleDone = useCallback(() => {
    console.log('Done');
  }, []);

  return (
    <FullPageStep
      navbar={<MultiGalleryEditGalleryNavbar onBack={handleBack} onDone={handleDone} />}
      withBorder
    >
      <GalleryEditor queryRef={query} />
    </FullPageStep>
  );
}

function OldEditGalleryPage() {
  const query = useLazyLoadQuery<editGalleryPageOldQuery>(
    graphql`
      query editGalleryPageOldQuery {
        ...OrganizeGalleryFragment
        viewer {
          ... on Viewer {
            user {
              username
            }
          }
        }
      }
    `,
    {}
  );

  const { push, query: urlQuery } = useRouter();

  const handleAddCollection = useCallback(() => {
    if (!urlQuery.galleryId) {
      return;
    }

    push({
      pathname: '/gallery/[galleryId]/collection/create',
      query: { galleryId: urlQuery.galleryId as string },
    });
  }, [push, urlQuery.galleryId]);

  const handleEditCollection = useCallback(
    (collectionId: string) => {
      if (!urlQuery.galleryId) {
        return;
      }

      push({
        pathname: '/gallery/[galleryId]/collection/[collectionId]/edit',
        query: { galleryId: urlQuery.galleryId as string, collectionId },
      });
    },
    [push, urlQuery.galleryId]
  );

  const handleDone = useCallback(() => {
    if (query.viewer?.user?.username) {
      push({ pathname: '/[username]', query: { username: query.viewer.user.username } });
    } else {
      push({ pathname: '/home' });
    }
  }, [push, query.viewer?.user?.username]);

  return (
    <FullPageStep navbar={<GalleryEditNavbar onDone={handleDone} />}>
      <Wrapper>
        <OrganizeGallery
          onAddCollection={handleAddCollection}
          onEditCollection={handleEditCollection}
          queryRef={query}
        />
      </Wrapper>
    </FullPageStep>
  );
}

const Wrapper = styled.div`
  margin-top: 16px;

  @media only screen and ${breakpoints.tablet} {
    margin-top: 24px;
  }
`;

export default function EditGalleryPage({ galleryId }: Props) {
  const query = useLazyLoadQuery<editGalleryPageQuery>(
    graphql`
      query editGalleryPageQuery {
        ...isFeatureEnabledFragment
      }
    `,
    {}
  );

  const isMultigalleryEnabled = isFeatureEnabled(FeatureFlag.MULTIGALLERY, query);

  return isMultigalleryEnabled ? (
    <NewEditGalleryPage galleryId={galleryId} />
  ) : (
    <OldEditGalleryPage />
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  return {
    props: {
      galleryId: params?.galleryId as string,
    },
  };
};
