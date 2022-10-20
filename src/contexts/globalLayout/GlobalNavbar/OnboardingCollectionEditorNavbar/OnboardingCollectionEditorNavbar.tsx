import {
  useGlobalLayoutActions,
  useGlobalLayoutState,
} from 'contexts/globalLayout/GlobalLayoutContext';
import { useLayoutEffect } from 'react';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from 'contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import { Button } from 'components/core/Button/Button';
import { ONBOARDING_NEXT_BUTTON_TEXT_MAP } from 'components/Onboarding/constants';
import { BackButton } from 'contexts/globalLayout/GlobalNavbar/BackButton';
import { GalleryNameAndCollectionName } from 'contexts/globalLayout/GlobalNavbar/CollectionEditorNavbar/GalleryNameAndCollectionName';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { OnboardingCollectionEditorNavbarFragment$key } from '../../../../../__generated__/OnboardingCollectionEditorNavbarFragment.graphql';

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

  return (
    <StandardNavbarContainer>
      <NavbarLeftContent>
        <BackButton onClick={onBack} />
      </NavbarLeftContent>

      <NavbarCenterContent>
        <GalleryNameAndCollectionName
          galleryName={'My main gallery'}
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
