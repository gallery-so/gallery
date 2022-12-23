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

import { CollectionCreateOrEditForm } from '~/components/GalleryEditor/CollectionCreateOrEditForm';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { GalleryEditorContextFragment$key } from '~/generated/GalleryEditorContextFragment.graphql';
import { generate12DigitId } from '~/utils/generate12DigitId';
import { removeNullValues } from '~/utils/removeNullValues';

export type GalleryEditorContextType = {
  collections: CollectionMap;
  hiddenCollectionIds: Set<string>;

  createCollection: () => void;
  updateCollectionNameAndNote: (collectionId: string, name: string, note: string) => void;
  toggleCollectionHidden: (collectionId: string) => void;
  collectionIdBeingEdited: string | null;
};

export const GalleryEditorContext = createContext<GalleryEditorContextType | undefined>(undefined);

type GalleryEditorProviderProps = PropsWithChildren<{
  queryRef: GalleryEditorContextFragment$key;
}>;

type CollectionState = {
  dbid: string;
  localOnly: boolean;
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
          __typename
          ... on Gallery {
            dbid @required(action: THROW)
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

  const gallery = query.galleryById;
  if (gallery.__typename !== 'Gallery') {
    throw new Error(
      `Expected gallery to be typename 'Gallery', but received '${gallery.__typename}'`
    );
  }

  const [collectionIdBeingEdited] = useState<string | null>(() => {
    return gallery?.collections?.[0]?.dbid ?? null;
  });

  const [collections, setCollections] = useState<CollectionMap>(() => {
    const collections: CollectionMap = {};

    const queryCollections = removeNullValues(gallery?.collections);

    for (const collection of queryCollections) {
      collections[collection.dbid] = {
        localOnly: false,
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
  const createCollection = useCallback(() => {
    showModal({
      content: (
        <CollectionCreateOrEditForm
          mode="creating"
          onDone={({ name, collectorsNote }) => {
            const dbid = generate12DigitId();

            setCollections((previous) => {
              const newCollection: CollectionState = {
                dbid,
                localOnly: true,
                hidden: false,
                name: name ?? '',
                collectorsNote: collectorsNote ?? '',
              };

              return {
                [dbid]: newCollection,
                ...previous,
              };
            });
          }}
        />
      ),
      headerText: 'Name and describe your collection',
    });
  }, [showModal]);

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

      createCollection,
      updateCollectionNameAndNote,
      toggleCollectionHidden,
      collectionIdBeingEdited,
    };
  }, [
    collections,
    hiddenCollectionIds,
    createCollection,
    updateCollectionNameAndNote,
    toggleCollectionHidden,
    collectionIdBeingEdited,
  ]);

  return <GalleryEditorContext.Provider value={value}>{children}</GalleryEditorContext.Provider>;
}

export function useGalleryEditorContext() {
  const value = useContext(GalleryEditorContext);

  if (!value) {
    throw new Error('Tried to use a GalleryEditorContext without a provider.');
  }

  return value;
}
