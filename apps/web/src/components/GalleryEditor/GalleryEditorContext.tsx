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
import { v4 as uuid } from 'uuid';

import { CollectionCreateOrEditForm } from '~/components/GalleryEditor/CollectionCreateOrEditForm';
import { GalleryNameAndDescriptionEditForm } from '~/components/GalleryEditor/GalleryNameAndDescriptionEditForm';
import {
  createEmptyCollection,
  getInitialCollectionsFromServer,
} from '~/components/GalleryEditor/getInitialCollectionsFromServer';
import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { useReportError } from '~/contexts/errorReporting/ErrorReportingContext';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { ErrorWithSentryMetadata } from '~/errors/ErrorWithSentryMetadata';
import { GalleryEditorContextFragment$key } from '~/generated/GalleryEditorContextFragment.graphql';
import { GalleryEditorContextPublishGalleryMutation } from '~/generated/GalleryEditorContextPublishGalleryMutation.graphql';
import {
  CreateCollectionInGalleryInput,
  GalleryEditorContextSaveGalleryMutation,
  UpdateCollectionInput,
} from '~/generated/GalleryEditorContextSaveGalleryMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';
import { generateLayoutFromCollection } from '~/utils/collectionLayout';
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
  validationErrors: string[];
  canSave: boolean;

  saveGallery: () => void;
  activateCollection: (collectionId: string) => void;
  deleteCollection: (collectionId: string) => void;
  editCollectionNameAndNote: (collectionId: string) => void;
  editGalleryNameAndDescription: () => void;
  createCollection: () => void;
  toggleCollectionHidden: (collectionId: string) => void;
  collectionIdBeingEdited: string | null;
  moveCollectionToGallery: (collectionId: string) => void;
  doesCollectionHaveUnsavedChanges: (collectionId: string) => boolean;
  publishGallery: (caption: string | null) => void;
};

export const GalleryEditorContext = createContext<GalleryEditorContextType | undefined>(undefined);

type GalleryEditorProviderProps = PropsWithChildren<{
  queryRef: GalleryEditorContextFragment$key;
  initialCollectionId?: string | null;
}>;

export type StagedItem = { kind: 'whitespace'; id: string } | { kind: 'token'; id: string };

export type StagedSection = {
  id: string;
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

export type StagedSectionMap = StagedSection[];
export type CollectionMap = CollectionState[];

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

            ...getInitialCollectionsFromServerFragment
          }
        }
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
              ...UserGalleryCollectionFragment
              # eslint-disable-next-line relay/must-colocate-fragment-spreads
              ...CollectionGalleryHeaderFragment
              # eslint-disable-next-line relay/must-colocate-fragment-spreads
              ...CollectionLinkFragment
              # eslint-disable-next-line relay/must-colocate-fragment-spreads
              ...FeaturedCollectorCardCollectionFragment
            }

            ...getInitialCollectionsFromServerFragment
          }
        }
      }
    }
  `);

  const [publish] = usePromisifiedMutation<GalleryEditorContextPublishGalleryMutation>(graphql`
    mutation GalleryEditorContextPublishGalleryMutation($input: PublishGalleryInput!) {
      publishGallery(input: $input) {
        __typename
        ... on PublishGalleryPayload {
          __typename
          gallery {
            __typename
          }
        }
      }
    }
  `);

  const track = useTrack();

  const [editSessionID, setEditSessionID] = useState(uuid());
  const [hasSaved, setHasSaved] = useState(false);

  const [name, setName] = useState(() => query.galleryById?.name ?? '');
  const [description, setDescription] = useState(() => query.galleryById?.description ?? '');

  const [deletedCollectionIds, setDeletedCollectionIds] = useState(() => {
    return new Set<string>();
  });

  const [collections, setCollections] = useState<CollectionMap>(() =>
    getInitialCollectionsFromServer(query.galleryById)
  );

  const [collectionIdBeingEdited, setCollectionIdBeingEdited] = useState<string | null>(() => {
    return initialCollectionId ?? collections[0]?.dbid ?? null;
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

        sections: [{ id: generate12DigitId(), columns: 3, items: [] }],
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

      const collection = cloned.find((collection) => collection.dbid === collectionId);
      if (collection) {
        collection.hidden = !collection.hidden;
      }

      return cloned;
    });
  }, []);

  const hiddenCollectionIds = useMemo(() => {
    return new Set(
      collections.filter((collection) => collection.hidden).map((collection) => collection.dbid)
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

      const nextCollections = collections.filter((collection) => collection.dbid === collectionId);

      let nextCollectionIdBeingEdited = nextCollections[0]?.dbid;
      if (!nextCollectionIdBeingEdited) {
        const emptyCollection = createEmptyCollection();
        nextCollectionIdBeingEdited = emptyCollection.dbid;
        nextCollections.push(emptyCollection);
      }

      setCollections(nextCollections);
      setCollectionIdBeingEdited(nextCollectionIdBeingEdited);
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
      const collection = collections.find((collection) => collection.dbid === collectionId);

      if (!collection) {
        return;
      }

      showModal({
        headerText: 'Add a title and description',
        content: (
          <CollectionCreateOrEditForm
            name={collection.name}
            collectorsNote={collection.collectorsNote}
            onDone={({ name, collectorsNote }) => {
              setCollections((previous) => {
                const next = previous.map((collection) => {
                  if (collection.dbid === collectionId) {
                    return { ...collection, name, collectorsNote };
                  }

                  return collection;
                });

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

      const layout = generateLayoutFromCollection(collection.sections);

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

      const layout = generateLayoutFromCollection(collection.sections);

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

    const updatedCollections: UpdateCollectionInput[] = collections
      .filter((collection) => !collection.localOnly)
      .map(localCollectionToUpdatedCollection);

    const createdCollections: CreateCollectionInGalleryInput[] = collections
      .filter((collection) => collection.localOnly)
      .map(localCollectionToCreatedCollection);

    const deletedCollections = [...deletedCollectionIds];

    const order = [...collections.map((collection) => collection.dbid)];

    const payload = {
      galleryId,

      name,
      description,
      caption: null,

      order,

      createdCollections,
      updatedCollections,
      deletedCollections,

      editId: editSessionID,
    };

    track('Save Gallery', payload);

    try {
      const { updateGallery } = await save({
        variables: {
          input: payload,
        },
      });

      if (updateGallery?.__typename !== 'UpdateGalleryPayload' || !updateGallery.gallery) {
        throw new ErrorWithSentryMetadata(
          'Update gallery response did not have the expected typename',
          { __typename: updateGallery?.__typename }
        );
      }

      const serverSourcedCollections = getInitialCollectionsFromServer(updateGallery.gallery);

      // Make sure we reset our "Has unsaved changes comparison point"
      setInitialName(name);
      setInitialDescription(description);
      setInitialCollections(serverSourcedCollections);

      // Make sure the UI is reflecting what the server tells us happened.
      setCollections(serverSourcedCollections);

      // Reset the deleted collection ids since we just deleted them
      setDeletedCollectionIds(new Set());

      // TODO(Terence): Ensure the same collection is still activated
      // const newCollectionIdBeingEdited = collectionIdBeingEdited
      //   ? serverSourcedCollections[
      //       collections.indexOf(collectionIdBeingEdited)
      //     ]
      //   : null;
      //
      // setCollectionIdBeingEdited(newCollectionIdBeingEdited ?? null);

      // Flash a "Saved" message next to the "Done" button
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
  }, [
    collectionIdBeingEdited,
    collections,
    deletedCollectionIds,
    description,
    editSessionID,
    name,
    pushToast,
    query.galleryById.dbid,
    reportError,
    save,
    track,
  ]);

  const publishGallery = useCallback(
    async (_caption: string | null) => {
      const galleryId = query.galleryById.dbid;
      const caption = _caption?.trim() ? _caption : null;

      if (!galleryId) {
        reportError('Tried to publish a gallery without a gallery id');
        return;
      }

      const payload = {
        galleryId,
        caption,
        editId: editSessionID,
      };

      track('Publish Gallery', payload);

      try {
        const { publishGallery } = await publish({
          variables: {
            input: payload,
          },
        });

        if (publishGallery?.__typename !== 'PublishGalleryPayload' || !publishGallery.gallery) {
          throw new ErrorWithSentryMetadata(
            'Publish gallery response did not have the expected typename',
            { __typename: publishGallery?.__typename }
          );
        }

        // Make sure we reset our "Has unsaved changes comparison point"
        setEditSessionID(uuid());
        setHasSaved(false);
      } catch (error) {
        pushToast({
          autoClose: false,
          message: "Something went wrong while publishing your gallery. We're looking into it.",
        });

        if (error instanceof Error) {
          reportError(error, { tags: { galleryId } });
        } else {
          reportError(
            new ErrorWithSentryMetadata(
              'Something unexpected went wrong while publishing your gallery',
              {
                galleryId,
              }
            )
          );
        }
      }
    },
    [editSessionID, publish, pushToast, query.galleryById.dbid, reportError, track]
  );

  const [initialName, setInitialName] = useState(name);
  const [initialDescription, setInitialDescription] = useState(description);
  const [initialCollections, setInitialCollections] = useState(collections);

  const hasUnsavedChanges = useMemo(() => {
    // Need to convert the liveDisplayTokenIds Set into an Array because sets don't store data
    // as properties to be stringified: https://stackoverflow.com/a/31190928/5377437
    const currentCollectionsWithoutIds = collections.map(
      convertCollectionToComparisonFriendlyObject
    );
    const initialCollectionsWithoutIds = initialCollections.map(
      convertCollectionToComparisonFriendlyObject
    );

    const collectionsAreDifferent =
      JSON.stringify(currentCollectionsWithoutIds) !== JSON.stringify(initialCollectionsWithoutIds);

    const nameIsDifferent = name !== initialName;
    const descriptionIsDifferent = description !== initialDescription;

    return collectionsAreDifferent || nameIsDifferent || descriptionIsDifferent;
  }, [collections, description, initialCollections, initialDescription, initialName, name]);

  const doesCollectionHaveUnsavedChanges = useCallback(
    (collectionId: string) => {
      const currentCollection = collections.find((collection) => collection.dbid === collectionId);
      const initialCollection = initialCollections.find(
        (collection) => collection.dbid === collectionId
      );

      if (!currentCollection || !initialCollection) {
        return false;
      }

      const comparisonFriendlyCurrentCollection =
        convertCollectionToComparisonFriendlyObject(currentCollection);
      const comparisonFriendlyInitialCollection =
        convertCollectionToComparisonFriendlyObject(initialCollection);

      const collectionsAreDifferent =
        JSON.stringify(comparisonFriendlyCurrentCollection) !==
        JSON.stringify(comparisonFriendlyInitialCollection);

      return collectionsAreDifferent;
    },
    [collections, initialCollections]
  );

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
      const nextCollections = collections.filter((collection) => collection.dbid === collectionId);
      const nextInitialCollections = initialCollections.filter(
        (collection) => collection.dbid === collectionId
      );

      let nextCollectionIdBeingEdited = nextCollections[0]?.dbid;
      if (!nextCollectionIdBeingEdited) {
        const emptyCollection = createEmptyCollection();
        nextCollectionIdBeingEdited = emptyCollection.dbid;
        nextCollections.push(emptyCollection);
      }

      setCollections(nextCollections);
      setInitialCollections(nextInitialCollections);
      setCollectionIdBeingEdited(nextCollectionIdBeingEdited);
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
      validationErrors,
      canSave,

      saveGallery,
      setCollections,
      deleteCollection,
      createCollection,
      activateCollection,
      toggleCollectionHidden,
      moveCollectionToGallery,
      collectionIdBeingEdited,
      editCollectionNameAndNote,
      editGalleryNameAndDescription,
      doesCollectionHaveUnsavedChanges,
      publishGallery,
    };
  }, [
    name,
    description,
    collections,
    hiddenCollectionIds,
    hasSaved,
    hasUnsavedChanges,
    validationErrors,
    canSave,
    saveGallery,
    deleteCollection,
    createCollection,
    activateCollection,
    toggleCollectionHidden,
    moveCollectionToGallery,
    collectionIdBeingEdited,
    editCollectionNameAndNote,
    editGalleryNameAndDescription,
    doesCollectionHaveUnsavedChanges,
    publishGallery,
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

type ComparisonFriendlyCollectionState = Omit<CollectionState, 'liveDisplayTokenIds'> & {
  liveDisplayTokenIds: string[];
};

function convertCollectionToComparisonFriendlyObject(
  collection: CollectionState
): ComparisonFriendlyCollectionState {
  return {
    ...collection,
    activeSectionId: null,
    liveDisplayTokenIds: [...collection.liveDisplayTokenIds].sort(),
  };
}
