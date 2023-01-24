import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useFragment, useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { GalleryEditor } from '~/components/GalleryEditor/GalleryEditor';
import {
  GalleryEditorProvider,
  useGalleryEditorContext,
} from '~/components/GalleryEditor/GalleryEditorContext';
import { OrganizeGallery } from '~/components/ManageGallery/OrganizeGallery/OrganizeGallery';
import useConfirmationMessageBeforeClose from '~/components/ManageGallery/useConfirmationMessageBeforeClose';
import FullPageStep from '~/components/Onboarding/FullPageStep';
import { EditGalleryNavbar } from '~/contexts/globalLayout/EditGalleryNavbar/EditGalleryNavbar';
import { GalleryEditNavbar } from '~/contexts/globalLayout/GlobalNavbar/GalleryEditNavbar/GalleryEditNavbar';
import { useCanGoBack } from '~/contexts/navigation/GalleryNavigationProvider';
import { editGalleryPageNewInnerFragment$key } from '~/generated/editGalleryPageNewInnerFragment.graphql';
import { editGalleryPageNewQuery } from '~/generated/editGalleryPageNewQuery.graphql';
import { editGalleryPageOldQuery } from '~/generated/editGalleryPageOldQuery.graphql';
import { editGalleryPageQuery } from '~/generated/editGalleryPageQuery.graphql';
import GalleryRedirect from '~/scenes/_Router/GalleryRedirect';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';

type NewEditGalleryPageInnerProps = {
  queryRef: editGalleryPageNewInnerFragment$key;
};

function NewEditGalleryPageInner({ queryRef }: NewEditGalleryPageInnerProps) {
  const query = useFragment(
    graphql`
      fragment editGalleryPageNewInnerFragment on Query {
        ...GalleryEditorFragment

        viewer {
          ... on Viewer {
            __typename
            user {
              username
            }
          }
        }
      }
    `,
    queryRef
  );

  const canGoBack = useCanGoBack();
  const { replace, back } = useRouter();
  const { saveGallery, canSave, hasUnsavedChanges, editGalleryNameAndDescription, name } =
    useGalleryEditorContext();

  useConfirmationMessageBeforeClose(hasUnsavedChanges);

  const handleBack = useCallback(() => {
    if (canGoBack) {
      back();
    } else if (query.viewer?.__typename === 'Viewer' && query.viewer.user?.username) {
      replace({
        pathname: '/[username]/galleries',
        query: { username: query.viewer.user.username },
      });
    } else {
      replace({ pathname: '/activity' });
    }
  }, [back, canGoBack, query.viewer, replace]);

  const handleDone = useCallback(
    async (caption: string) => {
      await saveGallery(caption);
    },
    [saveGallery]
  );

  const handleEdit = useCallback(() => {
    editGalleryNameAndDescription();
  }, [editGalleryNameAndDescription]);

  return (
    <FullPageStep
      withBorder
      navbar={
        <EditGalleryNavbar
          onEdit={handleEdit}
          galleryName={name}
          canSave={canSave}
          hasUnsavedChanges={hasUnsavedChanges}
          onBack={handleBack}
          onDone={handleDone}
        />
      }
    >
      <GalleryEditor queryRef={query} />
    </FullPageStep>
  );
}

type Props = {
  galleryId: string;
  initialCollectionId: string | null;
};

function NewEditGalleryPage({ galleryId, initialCollectionId }: Props) {
  const query = useLazyLoadQuery<editGalleryPageNewQuery>(
    graphql`
      query editGalleryPageNewQuery($galleryId: DBID!) {
        viewer {
          ... on Viewer {
            __typename
          }
        }

        ...GalleryEditorContextFragment
        ...editGalleryPageNewInnerFragment
      }
    `,
    { galleryId }
  );

  const isLoggedIn = query.viewer?.__typename === 'Viewer';

  if (!isLoggedIn) {
    return <GalleryRedirect to={{ pathname: '/auth' }} />;
  }

  return (
    <GalleryEditorProvider initialCollectionId={initialCollectionId} queryRef={query}>
      <NewEditGalleryPageInner queryRef={query} />
    </GalleryEditorProvider>
  );
}

type OldEditGalleryPageProps = {
  galleryId: string;
};

function OldEditGalleryPage({ galleryId }: OldEditGalleryPageProps) {
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
    {},
    {
      fetchPolicy: 'network-only',
    }
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
      push({ pathname: '/activity' });
    }
  }, [push, query.viewer?.user?.username]);

  return (
    <FullPageStep navbar={<GalleryEditNavbar onDone={handleDone} />}>
      <Wrapper>
        <OrganizeGallery
          onAddCollection={handleAddCollection}
          onEditCollection={handleEditCollection}
          queryRef={query}
          galleryId={galleryId}
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

export default function EditGalleryPage({ galleryId, initialCollectionId }: Props) {
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
    <NewEditGalleryPage initialCollectionId={initialCollectionId} galleryId={galleryId} />
  ) : (
    <OldEditGalleryPage galleryId={galleryId} />
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params, query }) => {
  if (typeof params?.galleryId === 'string') {
    return {
      props: {
        galleryId: params.galleryId,
        initialCollectionId: typeof query?.collectionId === 'string' ? query.collectionId : null,
      },
    };
  }

  return { redirect: { permanent: false, destination: '/' } };
};
