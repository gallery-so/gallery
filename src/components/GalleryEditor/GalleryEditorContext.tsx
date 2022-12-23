import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { graphql, useFragment } from 'react-relay';
import rfdc from 'rfdc';

import { CollectionCreateOrEditForm } from '~/components/GalleryEditor/CollectionCreateOrEditForm';
import { getInitialCollectionsFromServer } from '~/components/GalleryEditor/getInitialCollectionsFromServer';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { GalleryEditorContextFragment$key } from '~/generated/GalleryEditorContextFragment.graphql';
import { generate12DigitId } from '~/utils/generate12DigitId';

const deepClone = rfdc();

export type GalleryEditorContextType = {
  collections: CollectionMap;
  setCollections: Dispatch<SetStateAction<CollectionMap>>;
  hiddenCollectionIds: Set<string>;

  activateCollection: (collectionId: string) => void;
  deleteCollection: (collectionId: string) => void;
  editCollectionNameAndNote: (collectionId: string) => void;
  createCollection: () => void;
  toggleCollectionHidden: (collectionId: string) => void;
  collectionIdBeingEdited: string | null;
};

export const GalleryEditorContext = createContext<GalleryEditorContextType | undefined>(undefined);

type GalleryEditorProviderProps = PropsWithChildren<{
  queryRef: GalleryEditorContextFragment$key;
}>;

export type StagedItem = { kind: 'whitespace'; id: string } | { kind: 'token'; id: string };

export type StagedSection = {
  columns: number;
  items: StagedItem[];
};

type CollectionState = {
  dbid: string;
  localOnly: boolean;

  liveDisplayTokenIds: Set<string>;

  name: string;
  collectorsNote: string;
  hidden: boolean;

  sections: StagedSectionMap;
  activeSectionId: string | null;
};

export type StagedSectionMap = Record<string, StagedSection>;
export type CollectionMap = Record<string, CollectionState>;

export function GalleryEditorProvider({ queryRef, children }: GalleryEditorProviderProps) {
  const query = useFragment(
    graphql`
      fragment GalleryEditorContextFragment on Query {
        galleryById(id: $galleryId) {
          ... on Gallery {
            collections {
              dbid
            }
          }
        }

        ...getInitialCollectionsFromServerFragment
      }
    `,
    queryRef
  );

  const [collectionIdBeingEdited, setCollectionIdBeingEdited] = useState<string | null>(() => {
    return query.galleryById?.collections?.[0]?.dbid ?? null;
  });

  const [deletedCollectionIds, setDeletedCollectionIds] = useState(() => {
    return new Set<string>();
  });

  const [collections, setCollections] = useState<CollectionMap>(() =>
    getInitialCollectionsFromServer(query)
  );

  const { showModal } = useModalActions();
  const createCollection = useCallback(() => {
    showModal({
      content: (
        <CollectionCreateOrEditForm
          mode="creating"
          onDone={({ name, collectorsNote }) => {
            const newCollectionId = generate12DigitId();

            setCollections((previous) => {
              const defaultSectionId = generate12DigitId();

              const newCollection: CollectionState = {
                dbid: newCollectionId,
                activeSectionId: defaultSectionId,
                liveDisplayTokenIds: new Set(),

                name: name ?? '',
                collectorsNote: collectorsNote ?? '',

                localOnly: true,
                hidden: false,

                sections: { [defaultSectionId]: { columns: 3, items: [] } },
              };

              return {
                [newCollectionId]: newCollection,
                ...previous,
              };
            });

            setCollectionIdBeingEdited(newCollectionId);
          }}
        />
      ),
      headerText: 'Name and describe your collection',
    });
  }, [showModal]);

  const toggleCollectionHidden = useCallback((collectionId: string) => {
    setCollections((previous) => {
      const cloned = deepClone(previous);

      cloned[collectionId].hidden = !cloned[collectionId].hidden;

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

  const activateCollection = useCallback((collectionId: string) => {
    setCollectionIdBeingEdited(collectionId);
  }, []);

  const deleteCollection = useCallback((collectionId: string) => {
    setDeletedCollectionIds((previous) => {
      const next = new Set(previous);

      next.add(collectionId);

      return next;
    });

    setCollections((previous) => {
      const next = { ...previous };

      delete next[collectionId];

      return next;
    });
  }, []);

  const editCollectionNameAndNote = useCallback(() => {
    if (!collectionIdBeingEdited) {
      return null;
    }

    const collection = collections[collectionIdBeingEdited];

    showModal({
      content: (
        <CollectionCreateOrEditForm
          name={collection.name}
          collectorsNote={collection.collectorsNote}
          onDone={({ name, collectorsNote }) => {
            if (!collectionIdBeingEdited) {
              return;
            }

            setCollections((previous) => {
              const next = { ...previous };

              next[collectionIdBeingEdited] = {
                ...next[collectionIdBeingEdited],
                name,
                collectorsNote,
              };

              return next;
            });
          }}
          mode={'editing'}
        />
      ),
    });
  }, [collectionIdBeingEdited, collections, showModal]);

  const value: GalleryEditorContextType = useMemo(() => {
    return {
      collections,
      hiddenCollectionIds,

      setCollections,
      deleteCollection,
      createCollection,
      activateCollection,
      toggleCollectionHidden,
      collectionIdBeingEdited,
      editCollectionNameAndNote,
    };
  }, [
    collections,
    hiddenCollectionIds,
    deleteCollection,
    createCollection,
    activateCollection,
    toggleCollectionHidden,
    collectionIdBeingEdited,
    editCollectionNameAndNote,
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
