import { Route } from 'nextjs-routes';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { ONBOARDING_NEXT_BUTTON_TEXT_MAP } from '~/components/Onboarding/constants';
import { BackButton } from '~/contexts/globalLayout/GlobalNavbar/BackButton';
import { GalleryNameAndCollectionName } from '~/contexts/globalLayout/GlobalNavbar/CollectionEditorNavbar/GalleryNameAndCollectionName';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from '~/contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import { OnboardingCollectionEditorNavbarFragment$key } from '~/generated/OnboardingCollectionEditorNavbarFragment.graphql';

import { CollectionSaveButtonWithCaption } from '../CollectionSaveButtonWithCaption';

type OnboardingCollectionEditorNavbarProps = {
  queryRef: OnboardingCollectionEditorNavbarFragment$key;
  onBack: () => void;
  onNext: (caption: string) => Promise<void>;
  isCollectionValid: boolean;
  hasUnsavedChange: boolean;
};

export function OnboardingCollectionEditorNavbar({
  onBack,
  onNext,
  queryRef,
  isCollectionValid,
  hasUnsavedChange,
}: OnboardingCollectionEditorNavbarProps) {
  const query = useFragment(
    graphql`
      fragment OnboardingCollectionEditorNavbarFragment on Query {
        collectionById(id: $collectionId) {
          ... on Collection {
            name
          }
        }
        ...CollectionSaveButtonWithCaptionFragment
      }
    `,
    queryRef
  );

  const editGalleryRoute: Route = { pathname: '/onboarding/organize-gallery' };

  return (
    <StandardNavbarContainer>
      <NavbarLeftContent>
        <BackButton onClick={onBack} />
      </NavbarLeftContent>

      <NavbarCenterContent>
        <GalleryNameAndCollectionName
          editGalleryRoute={editGalleryRoute}
          galleryName={'My gallery'}
          collectionName={query.collectionById?.name ?? ''}
          rightText="Editing"
        />
      </NavbarCenterContent>

      <NavbarRightContent>
        <CollectionSaveButtonWithCaption
          disabled={!isCollectionValid}
          label={ONBOARDING_NEXT_BUTTON_TEXT_MAP['edit-collection']}
          onSave={onNext}
          hasUnsavedChange={hasUnsavedChange}
          queryRef={query}
        />
      </NavbarRightContent>
    </StandardNavbarContainer>
  );
}
