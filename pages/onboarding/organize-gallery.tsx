import { useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';

import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';

import { WizardContext } from 'react-albus';
import { useWizardId } from 'contexts/wizard/WizardDataProvider';
import { BaseM, BaseXL } from 'components/core/Text/Text';
import detectMobileDevice from 'utils/detectMobileDevice';
import { useToastActions } from 'contexts/toast/ToastContext';
import { useRouter } from 'next/router';
import { useCanGoBack } from 'contexts/navigation/GalleryNavigationProvider';
import { useCollectionWizardActions } from 'contexts/wizard/CollectionWizardContext';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import { OrganizeGalleryFragment$key } from '__generated__/OrganizeGalleryFragment.graphql';
import { OrganizeGalleryQuery } from '__generated__/OrganizeGalleryQuery.graphql';
import useKeyDown from 'hooks/useKeyDown';
import { GLOBAL_NAVBAR_HEIGHT } from 'contexts/globalLayout/GlobalNavbar/GlobalNavbar';
import { VStack } from 'components/core/Spacer/Stack';
import Header from 'flows/shared/steps/OrganizeGallery/Header';
import { getStepUrl } from 'flows/shared/components/WizardFooter/constants';
import CollectionDnd from 'flows/shared/steps/OrganizeGallery/CollectionDnd';

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

export default function LazyOrganizeGallery(props: WizardContext) {
  const query = useLazyLoadQuery<OrganizeGalleryQuery>(
    graphql`
      query organizeGalleryQuery {
        ...OrganizeGalleryFragment
      }
    `,
    {}
  );

  return <OrganizeGallery {...props} queryRef={query} />;
}

function OrganizeGallery({ queryRef }: { queryRef: OrganizeGalleryFragment$key }) {
  const query = useFragment(
    graphql`
      fragment organizeGalleryFragment on Query {
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

  if (!gallery) {
    throw new Error('User did not have a gallery.');
  }

  useNotOptimizedForMobileWarning();

  const isEmptyGallery = useMemo(
    () => gallery.collections.length === 0,
    [gallery.collections.length]
  );

  const { push, query: urlQuery } = useRouter();
  const handleAddCollection = useCallback(() => {
    push(getStepUrl('create'), { query: { ...urlQuery } });
  }, [push, urlQuery]);

  const handleEditCollection = useCallback(() => {
    // TODO(Terence): Heavily test this
    push(getStepUrl('organize-collection'), { query: { ...urlQuery } });
  }, [push, urlQuery]);

  return (
    <StyledOrganizeGallery align="center">
      <Content gap={24}>
        <Header onAddCollection={handleAddCollection} />
        {isEmptyGallery ? (
          <StyledEmptyGalleryMessage gap={8}>
            <BaseXL>Create your first collection</BaseXL>
            <BaseM>
              Organize your gallery with collections. Use them to group NFTs by creator, theme, or
              anything that feels right.
            </BaseM>
          </StyledEmptyGalleryMessage>
        ) : (
          <CollectionDnd onEditCollection={handleEditCollection} galleryRef={gallery} />
        )}
      </Content>
    </StyledOrganizeGallery>
  );
}

const StyledOrganizeGallery = styled(VStack)`
  padding-top: ${GLOBAL_NAVBAR_HEIGHT}px;
`;

const StyledEmptyGalleryMessage = styled(VStack)`
  text-align: center;
  max-width: 390px;
  margin: 240px auto 0;
`;

const Content = styled(VStack)`
  width: 100%;
  padding: 0 16px 120px 0;
  max-width: 777px;
`;
