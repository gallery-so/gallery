import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { graphql, useFragment } from 'react-relay';
import rfdc from 'rfdc';

const deepClone = rfdc();

import CollectionCreateOrEditForm from '~/components/ManageGallery/OrganizeCollection/CollectionCreateOrEditForm';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { GalleryEditorContextFragment$key } from '~/generated/GalleryEditorContextFragment.graphql';
import { removeNullValues } from '~/utils/removeNullValues';

export type GalleryEditorContextType = {
  collections: CollectionMap;
  toggleCollectionHidden: (collectionId: string) => void;
  hiddenCollectionIds: Set<string>;
  collectionIdBeingEdited: string | null;
};

export const GalleryEditorContext = createContext<GalleryEditorContextType | undefined>(undefined);

type GalleryEditorProviderProps = PropsWithChildren<{
  queryRef: GalleryEditorContextFragment$key;
}>;

type CollectionState = {
  dbid?: string;
  name: string;
  collectorsNote: string;
  hidden: boolean;
};

type CollectionMap = Record<string, CollectionState>;

export function GalleryEditorProvider({ queryRef, children }: GalleryEditorProviderProps) {
  const query = useFragment(
    graphql`
      fragment GalleryEditorContextFragment on Query {
        galleryById(id: $galleryId) @required(action: THROW) {
          ... on Gallery {
            dbid
            collections {
              dbid
              name
              collectorsNote
              hidden
            }
          }
        }
      }
    `,
    queryRef
  );

  const [collectionIdBeingEdited] = useState<string | null>(() => {
    return query.galleryById?.collections?.[0]?.dbid ?? null;
  });

  const [collections, setCollections] = useState<CollectionMap>(() => {
    const collections: CollectionMap = {};

    const queryCollections = removeNullValues(query.galleryById?.collections);

    for (const collection of queryCollections) {
      collections[collection.dbid] = {
        dbid: collection.dbid,
        name: collection.name ?? '',
        collectorsNote: collection.collectorsNote ?? '',
        hidden: collection.hidden ?? false,
      };
    }

    return collections;
  });

  const updateCollectionNameAndNote = useCallback(
    (collectionId: string, name: string, collectorsNote: string) => {
      setCollections((previous) => {
        const cloned = deepClone(previous);

        const previousCollection = cloned[collectionId];
        cloned[collectionId] = { ...previousCollection, name, collectorsNote };

        return cloned;
      });
    },
    []
  );

  const { showModal } = useModalActions();
  const cerateCollection = useCallback(() => {
    const galleryId = query.galleryById.dbid;

    showModal({
      content: (
        <CollectionCreateOrEditForm
          onNext={({ title, description }) => {
            setCollectionTitle(title ?? '');
            setCollectionDescription(description ?? '');
          }}
          galleryId={galleryId}
          stagedCollection={stagedCollectionState}
          tokenSettings={collectionMetadata.tokenSettings}
        />
      ),
      headerText: 'Name and describe your collection',
    });
  }, []);

  const toggleCollectionHidden = useCallback((collectionId: string) => {
    setCollections((previous) => {
      const cloned = deepClone(previous);

      const previousCollection = cloned[collectionId];
      cloned[collectionId] = { ...previousCollection, hidden: previousCollection.hidden };

      return cloned;
    });
  }, []);

  const hiddenCollectionIds = useMemo(() => {
    return new Set(
      Object.values(collections)
        .filter((collection) => collection.hidden)
        .map((collection) => collection.dbid)
    );
  }, [collections]);

  const value: GalleryEditorContextType = useMemo(() => {
    return {
      collections,
      hiddenCollectionIds,
      toggleCollectionHidden,
      collectionIdBeingEdited,
    };
  }, [collections, hiddenCollectionIds, toggleCollectionHidden, collectionIdBeingEdited]);

  return <GalleryEditorContext.Provider value={value}>{children}</GalleryEditorContext.Provider>;
}

export function useGalleryEditorContext() {
  const value = useContext(GalleryEditorContext);

  if (!value) {
    throw new Error('Tried to use a GalleryEditorContext without a provider.');
  }

  return value;
}
