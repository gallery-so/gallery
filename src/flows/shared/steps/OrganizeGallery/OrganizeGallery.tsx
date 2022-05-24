import { useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';

import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';

import Spacer from 'components/core/Spacer/Spacer';
import { WizardContext } from 'react-albus';
import { useWizardId } from 'contexts/wizard/WizardDataProvider';
import { BaseM, BaseXL } from 'components/core/Text/Text';
import detectMobileDevice from 'utils/detectMobileDevice';
import { useToastActions } from 'contexts/toast/ToastContext';
import Header from './Header';
import CollectionDnd from './CollectionDnd';
import { useRouter } from 'next/router';
import { useCanGoBack } from 'contexts/navigation/GalleryNavigationProvider';
import { useCollectionWizardActions } from 'contexts/wizard/CollectionWizardContext';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import { OrganizeGalleryFragment$key } from '__generated__/OrganizeGalleryFragment.graphql';
import { OrganizeGalleryQuery } from '__generated__/OrganizeGalleryQuery.graphql';
import useKeyDown from 'hooks/useKeyDown';
import { GLOBAL_NAVBAR_HEIGHT } from 'contexts/globalLayout/GlobalNavbar/GlobalNavbar';

type ConfigProps = {
  wizardId: string;
  username: string;
  galleryId: string;
  next: WizardContext['next'];
};

function useNotOptimizedForMobileWarning() {
  const { pushToast } = useToastActions();

  useEffect(() => {
    if (detectMobileDevice()) {
      pushToast({
        message:
          "This page isn't optimized for mobile yet. Please use a computer to organize your Gallery.",
      });
    }
  }, [pushToast]);
}

function useWizardConfig({ wizardId, username, next }: ConfigProps) {
  const { setOnNext, setOnPrevious } = useWizardCallback();
  const canGoBack = useCanGoBack();

  const clearOnNext = useCallback(() => {
    setOnNext(undefined);
    setOnPrevious(undefined);
  }, [setOnNext, setOnPrevious]);

  const { replace, back, push } = useRouter();
  const returnToPrevious = useCallback(() => {
    if (canGoBack) {
      back();
    } else {
      void replace(`/${username}`);
    }

    clearOnNext();
  }, [canGoBack, clearOnNext, back, replace, username]);

  const track = useTrack();

  const saveGalleryAndReturnToProfile = useCallback(async () => {
    clearOnNext();
    // Save gallery changes (re-ordered collections)
    if (wizardId === 'onboarding') {
      track('Publish gallery');
      next();
      return;
    }

    void push(`/${username}`);
  }, [clearOnNext, next, push, username, wizardId, track]);

  useKeyDown('Escape', saveGalleryAndReturnToProfile);

  useEffect(() => {
    setOnNext(saveGalleryAndReturnToProfile);
    setOnPrevious(returnToPrevious);
  }, [setOnPrevious, setOnNext, saveGalleryAndReturnToProfile, returnToPrevious]);
}

export function LazyOrganizeGallery(props: WizardContext) {
  const query = useLazyLoadQuery<OrganizeGalleryQuery>(
    graphql`
      query OrganizeGalleryQuery {
        ...OrganizeGalleryFragment
      }
    `,
    {}
  );

  return <OrganizeGallery {...props} queryRef={query} />;
}

function OrganizeGallery({
  next,
  push,
  queryRef,
}: WizardContext & { queryRef: OrganizeGalleryFragment$key }) {
  const query = useFragment(
    graphql`
      fragment OrganizeGalleryFragment on Query {
        viewer @required(action: THROW) {
          ... on Viewer {
            user @required(action: THROW) {
              username @required(action: THROW)
            }
            viewerGalleries @required(action: THROW) {
              gallery @required(action: THROW) {
                dbid

                ...CollectionDndFragment

                collections @required(action: THROW) {
                  __typename
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const gallery = query.viewer.viewerGalleries?.[0]?.gallery;
  const username = query.viewer.user?.username ?? '';

  if (!gallery) {
    throw new Error('User did not have a gallery.');
  }

  const wizardId = useWizardId();

  useNotOptimizedForMobileWarning();

  const router = useRouter();
  const { setCollectionIdBeingEdited } = useCollectionWizardActions();
  const collectionId = (router.query.collectionId as string) || null;

  useEffect(() => {
    if (collectionId) {
      setCollectionIdBeingEdited(collectionId);
      push('organizeCollection');
    }
  }, [collectionId, push, setCollectionIdBeingEdited]);

  useWizardConfig({
    wizardId,
    username,
    galleryId: gallery.dbid,
    next,
  });

  const isEmptyGallery = useMemo(
    () => gallery.collections.length === 0,
    [gallery.collections.length]
  );
  
  return (
    <StyledOrganizeGallery>
      <Spacer height={GLOBAL_NAVBAR_HEIGHT} />
      <Content>
        <Header />
        <Spacer height={24} />
        {isEmptyGallery ? (
          <StyledEmptyGalleryMessage>
            <BaseXL>Create your first collection</BaseXL>
            <Spacer height={8} />
            <BaseM>
              Organize your gallery with collections. Use them to group NFTs by creator, theme, or
              anything that feels right.
            </BaseM>
          </StyledEmptyGalleryMessage>
        ) : (
          <CollectionDnd galleryRef={gallery} />
        )}
        <Spacer height={120} />
      </Content>
    </StyledOrganizeGallery>
  );
}

const StyledEmptyGalleryMessage = styled.div`
  text-align: center;
  max-width: 390px;
  margin: 240px auto 0;
`;

const StyledOrganizeGallery = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Content = styled.div`
  width: 777px;
`;

export default OrganizeGallery;
