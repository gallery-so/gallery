import { Route } from 'nextjs-routes';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { BackButton } from '~/contexts/globalLayout/GlobalNavbar/BackButton';
import { GalleryNameAndCollectionName } from '~/contexts/globalLayout/GlobalNavbar/CollectionEditorNavbar/GalleryNameAndCollectionName';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from '~/contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import { CollectionEditorNavbarFragment$key } from '~/generated/CollectionEditorNavbarFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';

import { CollectionSaveButtonWithCaption } from '../CollectionSaveButtonWithCaption';

type Props = {
  galleryId: string;
  onDone: (caption: string) => Promise<void>;
  onCancel: () => void;
  isCollectionValid: boolean;
  hasUnsavedChange: boolean;
  queryRef: CollectionEditorNavbarFragment$key;
};

export function CollectionEditorNavbar({
  queryRef,
  hasUnsavedChange,
  isCollectionValid,
  onDone,
  onCancel,
  galleryId,
}: Props) {
  const query = useFragment(
    graphql`
      fragment CollectionEditorNavbarFragment on Query {
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

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const mainContent = useMemo(() => {
    const editGalleryRoute: Route = {
      pathname: '/gallery/[galleryId]/edit',
      query: { galleryId },
    };

    return (
      <GalleryNameAndCollectionName
        editGalleryRoute={editGalleryRoute}
        rightText="Editing"
        galleryName="My gallery"
        collectionName={query.collectionById?.name ?? ''}
      />
    );
  }, [galleryId, query.collectionById?.name]);

  return (
    <StandardNavbarContainer>
      <NavbarLeftContent>
        {isMobile ? mainContent : <BackButton onClick={onCancel} />}
      </NavbarLeftContent>

      <NavbarCenterContent>{!isMobile && mainContent}</NavbarCenterContent>

      <NavbarRightContent>
        <CollectionSaveButtonWithCaption
          disabled={!isCollectionValid}
          onSave={onDone}
          hasUnsavedChange={hasUnsavedChange}
          queryRef={query}
        />
      </NavbarRightContent>
    </StandardNavbarContainer>
  );
}
