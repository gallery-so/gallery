import { Route } from 'nextjs-routes';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { Button } from '~/components/core/Button/Button';
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

type OnboardingCollectionEditorNavbarProps = {
  queryRef: OnboardingCollectionEditorNavbarFragment$key;
  onBack: () => void;
  onNext: () => void;
  isCollectionValid: boolean;
};

export function OnboardingCollectionEditorNavbar({
  onBack,
  onNext,
  queryRef,
  isCollectionValid,
}: OnboardingCollectionEditorNavbarProps) {
  const query = useFragment(
    graphql`
      fragment OnboardingCollectionEditorNavbarFragment on Query {
        collectionById(id: $collectionId) {
          ... on Collection {
            name
          }
        }
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
        <Button disabled={!isCollectionValid} onClick={onNext}>
          {ONBOARDING_NEXT_BUTTON_TEXT_MAP['edit-collection']}
        </Button>
      </NavbarRightContent>
    </StandardNavbarContainer>
  );
}
