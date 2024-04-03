import { createContext, SetStateAction, useCallback, useContext, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import { useTrack } from 'shared/contexts/AnalyticsContext';
import { useReportError } from 'shared/contexts/ErrorReportingContext';
import { ErrorWithSentryMetadata } from 'shared/errors/ErrorWithSentryMetadata';
import { usePromisifiedMutation } from 'shared/relay/usePromisifiedMutation';

import { GalleryEditorContextFragment$key } from '~/generated/GalleryEditorContextFragment.graphql';
import {
  CreateCollectionInGalleryInput,
  GalleryEditorContextSaveGalleryMutation,
  UpdateCollectionInput,
} from '~/generated/GalleryEditorContextSaveGalleryMutation.graphql';

import { useToastActions } from '../ToastContext';
import { generateLayoutFromCollection } from './collectionLayout';
import { getInitialCollectionsFromServer } from './getInitialCollectionsFromServer';
import { StagedCollection, StagedCollectionList, StagedSection, StagedSectionList } from './types';

type GalleryEditorActions = {
  galleryName: string;
  setGalleryName: (name: string) => void;

  galleryDescription: string;
  setGalleryDescription: (description: string) => void;

  collections: StagedCollectionList;

  updateCollectionOrder: (activeCollectionId: string, overCollectionId: string) => void;

  incrementColumns: (sectionId: string) => void;
  decrementColumns: (sectionId: string) => void;

  activateCollection: (collectionId: string) => void;
  collectionIdBeingEdited: string | null;

  activeSectionId: string | null;
  activateSection: (sectionId: string) => void;

  moveRow: (
    collectionId: string,

    activeRowId: string,
    // activeCollectionId: string,
    overRowId: string
    // overCollectionId: string
  ) => void;

  saveGallery: () => void;
};

const GalleryEditorActionsContext = createContext<GalleryEditorActions | undefined>(undefined);

export const useGalleryEditorActions = (): GalleryEditorActions => {
  const context = useContext(GalleryEditorActionsContext);
  if (!context) {
    throw new Error('Attempted to use GalleryEditorActionsContext without a provider!');
  }

  return context;
};

type Props = { children: React.ReactNode; queryRef: GalleryEditorContextFragment$key };

const GalleryEditorProvider = ({ children, queryRef }: Props) => {
  const query = useFragment(
    graphql`
      fragment GalleryEditorContextFragment on Query {
        galleryById(id: $galleryId) @required(action: THROW) {
          ... on Gallery {
            __typename
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
            # collections {
            #   # All of these are to ensure relevant components get their data refetched
            #   # eslint-disable-next-line relay/must-colocate-fragment-spreads
            #   ...NftGalleryFragment
            #   # eslint-disable-next-line relay/must-colocate-fragment-spreads
            #   ...UserGalleryCollectionFragment
            #   # eslint-disable-next-line relay/must-colocate-fragment-spreads
            #   ...CollectionGalleryHeaderFragment
            #   # eslint-disable-next-line relay/must-colocate-fragment-spreads
            #   ...CollectionLinkFragment
            #   # eslint-disable-next-line relay/must-colocate-fragment-spreads
            #   ...FeaturedCollectorCardCollectionFragment
            # }

            ...getInitialCollectionsFromServerFragment
          }
        }
      }
    }
  `);

  if (query.galleryById?.__typename !== 'Gallery') {
    throw new Error(
      `Expected gallery to have typename \`Gallery\`, but received ${query.galleryById?.__typename}`
    );
  }
  const gallery = query.galleryById;
  const track = useTrack();
  const { pushToast } = useToastActions();

  const [galleryName, setGalleryName] = useState(gallery.name ?? '');
  const [galleryDescription, setGalleryDescription] = useState(gallery.description ?? '');

  const [collections, setCollections] = useState<StagedCollectionList>(() =>
    getInitialCollectionsFromServer(gallery)
  );

  const [collectionIdBeingEdited, setCollectionIdBeingEdited] = useState<string | null>(null);

  const [deletedCollectionIds, setDeletedCollectionIds] = useState(() => {
    return new Set<string>();
  });

  const activateCollection = useCallback((collectionId: string) => {
    setCollectionIdBeingEdited(collectionId);
  }, []);

  const updateCollection = useCallback(
    (collectionId: string, value: SetStateAction<StagedCollection>) => {
      setCollections((previousCollections) => {
        return previousCollections.map((previousCollection) => {
          if (previousCollection.dbid === collectionId) {
            if (typeof value === 'function') {
              return value(previousCollection);
            } else {
              return value;
            }
          }

          return previousCollection;
        });
      });
    },
    [setCollections]
  );

  const handleUpdateCollectionOrder = useCallback(
    (activeCollectionId: string, overCollectionId: string) => {
      const activeCollectionIndex = collections.findIndex(
        (collection) => collection.dbid === activeCollectionId
      );
      const overCollectionIndex = collections.findIndex(
        (collection) => collection.dbid === overCollectionId
      );

      const newCollections = [...collections];
      const [removed] = newCollections.splice(activeCollectionIndex, 1);
      if (removed) {
        newCollections.splice(overCollectionIndex, 0, removed);
      }
      setCollections(newCollections);
    },
    [collections, setCollections]
  );

  const collectionBeingEdited = useMemo(() => {
    return collectionIdBeingEdited
      ? collections.find((collection) => collection.dbid === collectionIdBeingEdited)
      : null;
  }, [collectionIdBeingEdited, collections]);

  const setSections: (collectionId: string, value: SetStateAction<StagedSectionList>) => void =
    useCallback(
      (collectionId: string, value) => {
        if (!collectionId) {
          return;
        }

        updateCollection(collectionId, (previousCollection) => {
          let nextSections;
          if (typeof value === 'function') {
            nextSections = value(previousCollection.sections);
          } else {
            nextSections = value;
          }

          return {
            ...previousCollection,
            sections: nextSections,
          };
        });
      },
      [updateCollection]
    );

  const setActiveSectionId = useCallback(
    (sectionId: string) => {
      if (!collectionIdBeingEdited) {
        return;
      }

      updateCollection(collectionIdBeingEdited, (previousColleciton) => {
        return { ...previousColleciton, activeSectionId: sectionId };
      });
    },
    [collectionIdBeingEdited, updateCollection]
  );

  const activateSection = useCallback(
    (sectionId: string) => {
      setActiveSectionId(sectionId);
    },
    [setActiveSectionId]
  );

  const activeSectionId: string | null = useMemo(() => {
    if (!collectionIdBeingEdited) {
      return null;
    }

    return collectionBeingEdited?.activeSectionId ?? null;
  }, [collectionBeingEdited?.activeSectionId, collectionIdBeingEdited]);

  const updateSection = useCallback(
    (sectionId: string, value: SetStateAction<StagedSection>) => {
      if (!collectionIdBeingEdited) {
        return;
      }
      updateCollection(collectionIdBeingEdited, (previousCollection) => {
        return {
          ...previousCollection,
          sections: previousCollection.sections.map((previousSection) => {
            if (previousSection.id === sectionId) {
              if (typeof value === 'function') {
                return value(previousSection);
              } else {
                return value;
              }
            }

            return previousSection;
          }),
        };
      });
    },
    [collectionIdBeingEdited, updateCollection]
  );

  const incrementColumns = useCallback(
    (sectionId: string) => {
      updateSection(sectionId, (previousSection) => {
        return { ...previousSection, columns: previousSection.columns + 1 };
      });
    },
    [updateSection]
  );

  const decrementColumns = useCallback(
    (sectionId: string) => {
      updateSection(sectionId, (previousSection) => {
        return { ...previousSection, columns: previousSection.columns - 1 };
      });
    },
    [updateSection]
  );

  // TODO: Add support for moving rows between sections
  const moveRow = useCallback(
    (collectionId: string, activeRowId: string, overRowId: string) => {
      setSections(collectionId, (previousSections) => {
        const activeRowIndex = previousSections.findIndex((section) => section.id === activeRowId);
        const overRowIndex = previousSections.findIndex((section) => section.id === overRowId);
        return arrayMove(previousSections, activeRowIndex, overRowIndex);
      });
    },
    [setSections]
  );

  const reportError = useReportError();
  const saveGallery = useCallback(async () => {
    const galleryId = gallery.dbid;

    if (!galleryId) {
      reportError('Tried to save a gallery without a gallery id');
      return;
    }

    const localCollectionToUpdatedCollection = (
      collection: StagedCollection
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
          return {
            tokenId: token.id,
            renderLive: collection.liveDisplayTokenIds.has(token.id),
            highDefinition: collection.highDefinitionTokenIds.has(token.id),
          };
        }),
        layout,
        name: collection.name,
        tokens: tokens.map((token) => token.id),
      };
    };

    const localCollectionToCreatedCollection = (
      collection: StagedCollection
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
          return {
            tokenId: token.id,
            renderLive: collection.liveDisplayTokenIds.has(token.id),
            highDefinition: collection.highDefinitionTokenIds.has(token.id),
          };
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

      name: galleryName,
      description: galleryDescription,
      caption: null,

      order,

      createdCollections,
      updatedCollections,
      deletedCollections,

      // editId: editSessionID,
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
      // setInitialName(name);
      // setInitialDescription(description);
      // setInitialCollections(serverSourcedCollections);

      // Make sure the UI is reflecting what the server tells us happened.
      setCollections(serverSourcedCollections);

      // Reset the deleted collection ids since we just deleted them
      setDeletedCollectionIds(new Set());

      const indexOfCollectionBeingEdited = collections.findIndex(
        (collection) => collection.dbid === collectionIdBeingEdited
      );
      const newCollectionIdBeingEdited =
        serverSourcedCollections[indexOfCollectionBeingEdited]?.dbid;

      setCollectionIdBeingEdited(newCollectionIdBeingEdited ?? null);
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
    gallery.dbid,
    galleryName,
    galleryDescription,
    pushToast,
    reportError,
    save,
    track,
  ]);

  const value = useMemo(
    () => ({
      galleryName,
      setGalleryName,

      galleryDescription,
      setGalleryDescription,

      collections,

      updateCollectionOrder: handleUpdateCollectionOrder,

      incrementColumns,
      decrementColumns,

      activateCollection,
      collectionIdBeingEdited,

      activeSectionId,
      activateSection,

      moveRow,

      saveGallery,
    }),
    [
      galleryName,
      galleryDescription,
      handleUpdateCollectionOrder,
      setGalleryName,
      setGalleryDescription,

      collections,

      incrementColumns,
      decrementColumns,

      activateCollection,
      collectionIdBeingEdited,

      activeSectionId,
      activateSection,

      moveRow,

      saveGallery,
    ]
  );

  return (
    <GalleryEditorActionsContext.Provider value={value}>
      {children}
    </GalleryEditorActionsContext.Provider>
  );
};

GalleryEditorProvider.displayName = 'GalleryEditorProvider';

export default GalleryEditorProvider;

// https://github.com/clauderic/dnd-kit/blob/694dcc2f62e5269541fc941fa6c9af46ccd682ad/packages/sortable/src/utilities/arrayMove.ts
/**
 * Move an array item to a different position. Returns a new array with the item moved to the new position.
 */
export function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const newArray = array.slice();
  const element = newArray.splice(from, 1)[0];

  if (element === undefined) {
    throw new Error(`No element found at index ${from}`);
  }

  newArray.splice(to < 0 ? newArray.length + to : to, 0, element);
  return newArray;
}
