import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { graphql, useFragment } from 'react-relay';
import rfdc from 'rfdc';

import { CollectionCreateOrEditForm } from '~/components/GalleryEditor/CollectionCreateOrEditForm';
import { getInitialCollectionsFromServer } from '~/components/GalleryEditor/getInitialCollectionsFromServer';
import { useReportError } from '~/contexts/errorReporting/ErrorReportingContext';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { GalleryEditorContextFragment$key } from '~/generated/GalleryEditorContextFragment.graphql';
import {
  CreateCollectionInGalleryInput,
  GalleryEditorContextSaveGalleryMutation,
  UpdateCollectionInput,
} from '~/generated/GalleryEditorContextSaveGalleryMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';
import { generateLayoutFromCollectionNew } from '~/utils/collectionLayout';
import { generate12DigitId } from '~/utils/generate12DigitId';

const deepClone = rfdc();

export type GalleryEditorContextType = {
  collections: CollectionMap;
  setCollections: Dispatch<SetStateAction<CollectionMap>>;
  hiddenCollectionIds: Set<string>;

  hasUnsavedChanges: boolean;
  validationErrors: string[];
  canSave: boolean;

  saveGallery: () => void;
  activateCollection: (collectionId: string) => void;
  deleteCollection: (collectionId: string) => void;
  editCollectionNameAndNote: () => void;
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

export type CollectionState = {
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
        galleryById(id: $galleryId) @required(action: THROW) {
          ... on Gallery {
            dbid
            name
            description
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

  const [save] = usePromisifiedMutation<GalleryEditorContextSaveGalleryMutation>(graphql`
    mutation GalleryEditorContextSaveGalleryMutation($input: UpdateGalleryInput!) {
      updateGallery(input: $input) {
        __typename
        ... on UpdateGalleryPayload {
          gallery {
            name
            description
            collections {
              # All of these are to ensure relevant components get their data refetched
              # eslint-disable-next-line relay/must-colocate-fragment-spreads
              ...NftGalleryFragment
              # eslint-disable-next-line relay/must-colocate-fragment-spreads
              ...CollectionRowFragment
              # eslint-disable-next-line relay/must-colocate-fragment-spreads
              ...CollectionRowDraggingFragment
              # eslint-disable-next-line relay/must-colocate-fragment-spreads
              ...CollectionRowSettingsFragment
              # eslint-disable-next-line relay/must-colocate-fragment-spreads
              ...CollectionRowWrapperFragment
              # eslint-disable-next-line relay/must-colocate-fragment-spreads
              ...DeleteCollectionConfirmationFragment
              # eslint-disable-next-line relay/must-colocate-fragment-spreads
              ...SortableCollectionRowFragment
              # eslint-disable-next-line relay/must-colocate-fragment-spreads
              ...UserGalleryCollectionFragment
              # eslint-disable-next-line relay/must-colocate-fragment-spreads
              ...CollectionGalleryHeaderFragment
            }
          }
        }
      }
    }
  `);

  const [name, setName] = useState(() => query.galleryById?.name ?? '');
  const [description, setDescription] = useState(() => query.galleryById?.description ?? '');

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
    const newCollectionId = generate12DigitId();

    setCollections((previous) => {
      const defaultSectionId = generate12DigitId();

      const newCollection: CollectionState = {
        dbid: newCollectionId,
        activeSectionId: defaultSectionId,
        liveDisplayTokenIds: new Set(),

        name: '',
        collectorsNote: '',

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
  }, []);

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
      headerText: 'Add a tile and description',
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

  const reportError = useReportError();
  const saveGallery = useCallback(async () => {
    const galleryId = query.galleryById.dbid;

    if (!galleryId) {
      reportError('Tried to save a gallery without a gallery id');
      return;
    }

    const localCollectionToUpdatedCollection = (
      collection: CollectionState
    ): UpdateCollectionInput => {
      const tokens = Object.values(collection.sections).flatMap((section) =>
        section.items.filter((item) => item.kind === 'token')
      );

      const layout = generateLayoutFromCollectionNew(collection.sections);

      return {
        collectorsNote: collection.collectorsNote,
        dbid: collection.dbid,
        hidden: collection.hidden,
        tokenSettings: tokens.map((token) => {
          return { tokenId: token.id, renderLive: collection.liveDisplayTokenIds.has(token.id) };
        }),
        layout,
        name: collection.name,
        tokens: tokens.map((token) => token.id),
      };
    };

    const localCollectionToCreatedCollection = (
      collection: CollectionState
    ): CreateCollectionInGalleryInput => {
      const tokens = Object.values(collection.sections).flatMap((section) =>
        section.items.filter((item) => item.kind === 'token')
      );

      const layout = generateLayoutFromCollectionNew(collection.sections);

      return {
        givenID: collection.dbid,
        hidden: collection.hidden,
        collectorsNote: collection.collectorsNote,
        tokenSettings: tokens.map((token) => {
          return { tokenId: token.id, renderLive: collection.liveDisplayTokenIds.has(token.id) };
        }),
        layout,
        name: collection.name,
        tokens: tokens.map((token) => token.id),
      };
    };

    const updatedCollections: UpdateCollectionInput[] = Object.values(collections)
      .filter((collection) => !collection.localOnly)
      .map(localCollectionToUpdatedCollection);

    const createdCollections: CreateCollectionInGalleryInput[] = Object.values(collections)
      .filter((collection) => collection.localOnly)
      .map(localCollectionToCreatedCollection);

    const deletedCollections = [...deletedCollectionIds];

    const order = [...Object.values(collections).map((collection) => collection.dbid)];

    try {
      await save({
        variables: {
          input: {
            galleryId: query.galleryById!.dbid!,

            name,
            description,
            caption: null,

            order,

            createdCollections,
            updatedCollections,
            deletedCollections,
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  }, [collections, deletedCollectionIds, description, name, query.galleryById, reportError, save]);

  const initialCollections = useRef(collections);
  const hasUnsavedChanges = useMemo(() => {
    function removeIdsFromCollections(collections: CollectionState[]): CollectionState[] {
      return collections.map((collection) => {
        return { ...collection, dbid: '' };
      });
    }

    const currentCollectionsWithoutIds = removeIdsFromCollections(Object.values(collections));
    const initialCollectionsWithoutIds = removeIdsFromCollections(
      Object.values(initialCollections.current)
    );

    return (
      JSON.stringify(currentCollectionsWithoutIds) !== JSON.stringify(initialCollectionsWithoutIds)
    );
  }, [collections]);

  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    for (const collection of Object.values(collections)) {
      const hasAnyItems = Object.values(collection.sections).some((section) => {
        return section.items.length > 0;
      });

      if (!hasAnyItems) {
        errors.push(`Collection #${collection.dbid} doesn't have any items`);
      }
    }

    return errors;
  }, [collections]);

  const canSave = useMemo(() => {
    return validationErrors.length === 0 && hasUnsavedChanges;
  }, [hasUnsavedChanges, validationErrors.length]);

  const value: GalleryEditorContextType = useMemo(() => {
    return {
      collections,
      hiddenCollectionIds,

      hasUnsavedChanges,
      validationErrors,
      canSave,

      saveGallery,
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
    hasUnsavedChanges,
    validationErrors,
    canSave,
    saveGallery,
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
