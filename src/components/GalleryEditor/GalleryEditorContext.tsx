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
import { GalleryNameAndDescriptionEditForm } from '~/components/GalleryEditor/GalleryNameAndDescriptionEditForm';
import { getInitialCollectionsFromServer } from '~/components/GalleryEditor/getInitialCollectionsFromServer';
import { useReportError } from '~/contexts/errorReporting/ErrorReportingContext';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { ErrorWithSentryMetadata } from '~/errors/ErrorWithSentryMetadata';
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
  name: string;
  description: string;
  collections: CollectionMap;
  setCollections: Dispatch<SetStateAction<CollectionMap>>;
  hiddenCollectionIds: Set<string>;

  hasSaved: boolean;
  hasUnsavedChanges: boolean;
  hasUnsavedChangesCollectionBeingEdited: boolean;
  validationErrors: string[];
  canSave: boolean;

  saveGallery: (caption: string | null) => void;
  activateCollection: (collectionId: string) => void;
  deleteCollection: (collectionId: string) => void;
  editCollectionNameAndNote: (collectionId: string) => void;
  editGalleryNameAndDescription: () => void;
  createCollection: () => void;
  toggleCollectionHidden: (collectionId: string) => void;
  collectionIdBeingEdited: string | null;
  moveCollectionToGallery: (collectionId: string) => void;
};

export const GalleryEditorContext = createContext<GalleryEditorContextType | undefined>(undefined);

type GalleryEditorProviderProps = PropsWithChildren<{
  queryRef: GalleryEditorContextFragment$key;
  initialCollectionId?: string | null;
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

export function GalleryEditorProvider({
  queryRef,
  initialCollectionId,
  children,
}: GalleryEditorProviderProps) {
  const query = useFragment(
    graphql`
      fragment GalleryEditorContextFragment on Query {
        galleryById(id: $galleryId) @required(action: THROW) {
          ... on Gallery {
            dbid
            name
            description
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

  const [hasSaved, setHasSaved] = useState(false);

  const [name, setName] = useState(() => query.galleryById?.name ?? '');
  const [description, setDescription] = useState(() => query.galleryById?.description ?? '');

  const [deletedCollectionIds, setDeletedCollectionIds] = useState(() => {
    return new Set<string>();
  });

  const [collections, setCollections] = useState<CollectionMap>(() =>
    getInitialCollectionsFromServer(query)
  );

  const [collectionIdBeingEdited, setCollectionIdBeingEdited] = useState<string | null>(() => {
    return initialCollectionId ?? Object.values(collections)[0]?.dbid ?? null;
  });

  const { showModal } = useModalActions();
  const { pushToast } = useToastActions();
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
        ...previous,
        [newCollectionId]: newCollection,
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

  const deleteCollection = useCallback(
    (collectionId: string) => {
      setDeletedCollectionIds((previous) => {
        const next = new Set(previous);

        next.add(collectionId);

        return next;
      });

      const nextCollections = { ...collections };
      delete nextCollections[collectionId];

      setCollections(nextCollections);
      setCollectionIdBeingEdited(Object.keys(nextCollections)[0]);
    },
    [collections]
  );

  const editGalleryNameAndDescription = useCallback(() => {
    showModal({
      headerText: 'Add a gallery name and description',
      content: (
        <GalleryNameAndDescriptionEditForm
          onDone={(result) => {
            setName(result.name);
            setDescription(result.description);
          }}
          mode="editing"
          description={description}
          name={name}
        />
      ),
    });
  }, [description, name, showModal]);

  const editCollectionNameAndNote = useCallback(
    (collectionId: string) => {
      const collection = collections[collectionId];

      showModal({
        headerText: 'Add a title and description',
        content: (
          <CollectionCreateOrEditForm
            name={collection.name}
            collectorsNote={collection.collectorsNote}
            onDone={({ name, collectorsNote }) => {
              setCollections((previous) => {
                const next = { ...previous };

                next[collectionId] = {
                  ...next[collectionId],
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
    },
    [collections, showModal]
  );

  const reportError = useReportError();
  const saveGallery = useCallback(
    async (caption: string | null) => {
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
              galleryId,

              name,
              description,
              caption,

              order,

              createdCollections,
              updatedCollections,
              deletedCollections,
            },
          },
        });

        // Make sure we reset our "Has unsaved changes comparison point"
        setInitialName(name);
        setInitialDescription(description);
        setInitialCollections(collections);

        setHasSaved(true);
      } catch (error) {
        pushToast({
          autoClose: false,
          message: "Something went wrong while saving your gallery. We're looking into it.",
        });

        if (error instanceof Error) {
          reportError(error, { tags: { galleryId } });
        } else {
          reportError(
            new ErrorWithSentryMetadata('Something unexpected went wrong while saving a gallery', {
              galleryId,
            })
          );
        }
      }
    },
    [
      collections,
      deletedCollectionIds,
      description,
      name,
      pushToast,
      query.galleryById.dbid,
      reportError,
      save,
    ]
  );

  const [initialName, setInitialName] = useState(name);
  const [initialDescription, setInitialDescription] = useState(description);
  const [initialCollections, setInitialCollections] = useState(collections);
  const hasUnsavedChanges = useMemo(() => {
    // Need to convert the liveDisplayTokenIds Set into an Array because sets don't store data
    // as properties to be stringified: https://stackoverflow.com/a/31190928/5377437
    const currentCollectionsWithoutIds = Object.values(collections).map(
      convertCollectionToComparisonFriendlyObject
    );
    const initialCollectionsWithoutIds = Object.values(initialCollections).map(
      convertCollectionToComparisonFriendlyObject
    );

    const collectionsAreDifferent =
      JSON.stringify(currentCollectionsWithoutIds) !== JSON.stringify(initialCollectionsWithoutIds);

    const nameIsDifferent = name !== initialName;
    const descriptionIsDifferent = description !== initialDescription;

    return collectionsAreDifferent || nameIsDifferent || descriptionIsDifferent;
  }, [collections, description, initialCollections, initialDescription, initialName, name]);

  const hasUnsavedChangesCollectionBeingEdited = useMemo(() => {
    if (!collectionIdBeingEdited) {
      return false;
    }
    const currCollection = convertCollectionToComparisonFriendlyObject(
      collections[collectionIdBeingEdited]
    );
    const initialCollection = convertCollectionToComparisonFriendlyObject(
      initialCollections[collectionIdBeingEdited]
    );
    const collectionsAreDifferent =
      JSON.stringify(currCollection) !== JSON.stringify(initialCollection);

    return collectionsAreDifferent;
  }, [collectionIdBeingEdited, collections, initialCollections]);

  // At some point we will have validation errors built in
  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    return errors;
  }, []);

  const canSave = useMemo(() => {
    return validationErrors.length === 0 && hasUnsavedChanges;
  }, [hasUnsavedChanges, validationErrors.length]);

  const moveCollectionToGallery = useCallback(
    (collectionId: string) => {
      const nextInitialCollections = { ...initialCollections };
      delete nextInitialCollections[collectionId];
      setInitialCollections(nextInitialCollections);

      const nextCollections = { ...collections };
      delete nextCollections[collectionId];
      setCollections(nextCollections);
      setCollectionIdBeingEdited(Object.keys(nextCollections)[0]);
    },
    [collections, initialCollections]
  );

  const value: GalleryEditorContextType = useMemo(() => {
    return {
      name,
      description,
      collections,
      hiddenCollectionIds,

      hasSaved,
      hasUnsavedChanges,
      hasUnsavedChangesCollectionBeingEdited,
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
      editGalleryNameAndDescription,
      moveCollectionToGallery,
    };
  }, [
    name,
    description,
    collections,
    hiddenCollectionIds,
    hasSaved,
    hasUnsavedChanges,
    hasUnsavedChangesCollectionBeingEdited,
    validationErrors,
    canSave,
    saveGallery,
    deleteCollection,
    createCollection,
    activateCollection,
    toggleCollectionHidden,
    collectionIdBeingEdited,
    editCollectionNameAndNote,
    editGalleryNameAndDescription,
    moveCollectionToGallery,
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

function convertCollectionToComparisonFriendlyObject(collection?: CollectionState) {
  if (!collection) {
    return null;
  }
  return {
    ...collection,
    liveDisplayTokenIdsSize: [...collection.liveDisplayTokenIds].sort(),
  };
}
