import { useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';

import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';

import { WizardContext } from 'react-albus';
import { BaseM, BaseXL } from 'components/core/Text/Text';
import detectMobileDevice from 'utils/detectMobileDevice';
import { useToastActions } from 'contexts/toast/ToastContext';
import { useRouter } from 'next/router';
import { useCanGoBack } from 'contexts/navigation/GalleryNavigationProvider';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import useKeyDown from 'hooks/useKeyDown';
import { GLOBAL_NAVBAR_HEIGHT } from 'contexts/globalLayout/GlobalNavbar/GlobalNavbar';
import { VStack } from 'components/core/Spacer/Stack';
import Header from 'flows/shared/steps/OrganizeGallery/Header';
import { getStepUrl } from 'flows/shared/components/WizardFooter/constants';
import CollectionDnd from 'flows/shared/steps/OrganizeGallery/CollectionDnd';
import { organizeGalleryQuery } from '../../__generated__/OrganizeGalleryQuery.graphql';
import { organizeGalleryFragment$key } from '../../__generated__/OrganizeGalleryFragment.graphql';
import FullPageCenteredStep from 'flows/shared/components/FullPageCenteredStep/FullPageCenteredStep';
import { OnboardingFooter } from 'flows/shared/components/WizardFooter/OnboardingFooter';

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

function OrganizeGallery({ queryRef }: { queryRef: organizeGalleryFragment$key }) {
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

  const { push, query: urlQuery, back } = useRouter();
  const handleAddCollection = useCallback(() => {
    push({
      pathname: getStepUrl('create'),
      query: { ...urlQuery },
    });
  }, [push, urlQuery]);

  const handleEditCollection = useCallback(() => {
    // TODO(Terence): Heavily test this
    // We need to make sure the flow of going back and forth between steps works.
    push({
      pathname: getStepUrl('organize-collection'),
      query: { ...urlQuery },
    });
  }, [push, urlQuery]);

  const handleNext = useCallback(() => {
    return push({ pathname: getStepUrl('congratulations'), query: { ...urlQuery } });
  }, [push, urlQuery]);

  return (
    <FullPageCenteredStep withFooter>
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

      <OnboardingFooter
        step={'organize-gallery'}
        onNext={handleNext}
        isNextEnabled={true}
        onPrevious={back}
      />
    </FullPageCenteredStep>
  );
}

export default function LazyOrganizeGallery(props: WizardContext) {
  const query = useLazyLoadQuery<organizeGalleryQuery>(
    graphql`
      query organizeGalleryQuery {
        ...organizeGalleryFragment
      }
    `,
    {}
  );

  return <OrganizeGallery {...props} queryRef={query} />;
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
