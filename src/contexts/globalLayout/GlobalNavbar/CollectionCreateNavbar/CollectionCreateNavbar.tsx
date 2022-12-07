import { Route } from 'nextjs-routes';
import { graphql, useFragment } from 'react-relay';

import { BackButton } from '~/contexts/globalLayout/GlobalNavbar/BackButton';
import { GalleryNameAndCollectionName } from '~/contexts/globalLayout/GlobalNavbar/CollectionEditorNavbar/GalleryNameAndCollectionName';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from '~/contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import { CollectionCreateNavbarFragment$key } from '~/generated/CollectionCreateNavbarFragment.graphql';

import { CollectionSaveButtonWithCaption } from '../CollectionSaveButtonWithCaption';

type CollectionCreateNavbarProps = {
  onBack: () => void;
  onNext: (caption: string) => Promise<void>;
  galleryId: string;
  isCollectionValid: boolean;
  collectionName?: string;
  error?: string;
  queryRef: CollectionCreateNavbarFragment$key;
};

export function CollectionCreateNavbar({
  collectionName,
  galleryId,
  onBack,
  onNext,
  isCollectionValid,
  error,
  queryRef,
}: CollectionCreateNavbarProps) {
  const editGalleryRoute: Route = { pathname: '/gallery/[galleryId]/edit', query: { galleryId } };

  const query = useFragment(
    graphql`
      fragment CollectionCreateNavbarFragment on Query {
        ...CollectionSaveButtonWithCaptionFragment
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
          editGalleryRoute={editGalleryRoute}
          galleryName={'My gallery'}
          collectionName={collectionName || 'New Collection'}
          rightText="Creating"
        />
      </NavbarCenterContent>

      <NavbarRightContent>
        <CollectionSaveButtonWithCaption
          disabled={!isCollectionValid}
          onSave={onNext}
          hasUnsavedChange={true}
          error={error}
          queryRef={query}
        />
      </NavbarRightContent>
    </StandardNavbarContainer>
  );
}
