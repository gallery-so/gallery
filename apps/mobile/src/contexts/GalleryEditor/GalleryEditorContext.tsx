import { UniqueIdentifier } from '@mgcrea/react-native-dnd';
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
import { StagedRow, StagedSection, StagedSectionList } from './types';
import { arrayMove } from './util';

type GalleryEditorActions = {
  galleryName: string;
  setGalleryName: (name: string) => void;

  galleryDescription: string;
  setGalleryDescription: (description: string) => void;

  collections: StagedSectionList;

  incrementColumns: (rowId: string) => void;
  decrementColumns: (rowId: string) => void;

  activateSection: (sectionId: string) => void;
  sectionIdBeingEdited: string | null;

  activeRowId: string | null;
  activateRow: (sectionId: string, rowId: string) => void;

  moveRow: (
    collectionId: string,

    activeRowId: string,
    // activeCollectionId: string,
    overRowId: string
    // overCollectionId: string
  ) => void;

  updateSectionOrder: (sectionIds: UniqueIdentifier[]) => void;

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

  const [collections, setCollections] = useState<StagedSectionList>(() =>
    getInitialCollectionsFromServer(gallery)
  );

  const [sectionIdsOrder, setSectionIdsOrder] = useState<Set<string>>(
    new Set(collections.map((collection) => collection.dbid)) || new Set<string>()
  );

  const [sectionIdBeingEdited, setSectionIdBeingEdited] = useState<string | null>(null);

  const [deletedCollectionIds, setDeletedCollectionIds] = useState(() => {
    return new Set<string>();
  });

  const activateSection = useCallback((sectionId: string) => {
    setSectionIdBeingEdited(sectionId);
  }, []);

  const updateSection = useCallback(
    (collectionId: string, value: SetStateAction<StagedSection>) => {
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

  const updateRow = useCallback(
    (sectionId: string, value: SetStateAction<StagedRow>) => {
      if (!sectionIdBeingEdited) {
        return;
      }

      updateSection(sectionIdBeingEdited, (previousCollection) => {
        return {
          ...previousCollection,
          rows: previousCollection.rows.map((previousSection) => {
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
    [sectionIdBeingEdited, updateSection]
  );

  const sectionBeingEdited = useMemo(() => {
    return sectionIdBeingEdited
      ? collections.find((collection) => collection.dbid === sectionIdBeingEdited)
      : null;
  }, [sectionIdBeingEdited, collections]);

  // const setRows: Dispatch<SetStateAction<StagedRowList>> = useCallback(
  //   (value) => {
  //     if (!sectionIdBeingEdited) {
  //       return;
  //     }

  //     updateSection(sectionIdBeingEdited, (previousCollection) => {
  //       let nextSections;
  //       if (typeof value === 'function') {
  //         nextSections = value(previousCollection.rows);
  //       } else {
  //         nextSections = value;
  //       }

  //       return {
  //         ...previousCollection,
  //         sections: nextSections,
  //       };
  //     });
  //   },
  //   [sectionIdBeingEdited, updateSection]
  // );

  const setActiveRowId = useCallback(
    (rowId: string) => {
      if (!sectionIdBeingEdited) {
        return;
      }

      updateSection(sectionIdBeingEdited, (previousSection) => {
        return { ...previousSection, activeRowId: rowId };
      });
    },
    [sectionIdBeingEdited, updateSection]
  );

  const activateRow = useCallback(
    (sectionId: string, rowId: string) => {
      activateSection(sectionId);
      setActiveRowId(rowId);
    },
    [activateSection, setActiveRowId]
  );

  const activeRowId = useMemo(() => {
    if (!sectionIdBeingEdited) {
      return null;
    }

    return sectionBeingEdited?.activeRowId ?? null;
  }, [sectionBeingEdited?.activeRowId, sectionIdBeingEdited]);

  const incrementColumns = useCallback(
    (rowId: string) => {
      updateRow(rowId, (previousRow) => {
        return { ...previousRow, columns: previousRow.columns + 1 };
      });
    },
    [updateRow]
  );

  const decrementColumns = useCallback(
    (rowId: string) => {
      updateRow(rowId, (previousSection) => {
        return { ...previousSection, columns: previousSection.columns - 1 };
      });
    },
    [updateRow]
  );

  // TODO: Add support for moving rows between sections
  const moveRow = useCallback(
    (sectionId: string, activeRowId: string, overRowId: string) => {
      updateSection(sectionId, (previousSection) => {
        const activeRowIndex = previousSection.rows.findIndex((row) => row.id === activeRowId);
        const overRowIndex = previousSection.rows.findIndex((row) => row.id === overRowId);

        return {
          ...previousSection,
          rows: arrayMove(previousSection.rows, activeRowIndex, overRowIndex),
        };
      });
    },
    [updateSection]
  );

  const reportError = useReportError();
  const saveGallery = useCallback(async () => {
    const galleryId = gallery.dbid;

    if (!galleryId) {
      reportError('Tried to save a gallery without a gallery id');
      return;
    }

    const localCollectionToUpdatedCollection = (
      collection: StagedSection
    ): UpdateCollectionInput => {
      const tokens = Object.values(collection.rows).flatMap((row) =>
        row.items.filter((item) => item.kind === 'token')
      );

      const layout = generateLayoutFromCollection(collection.rows);

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
      collection: StagedSection
    ): CreateCollectionInGalleryInput => {
      const tokens = Object.values(collection.rows).flatMap((row) =>
        row.items.filter((item) => item.kind === 'token')
      );

      const layout = generateLayoutFromCollection(collection.rows);

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

    // Sort the updated collections based on the order of the sectionIdsOrder
    const order = Array.from(sectionIdsOrder);

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
        (collection) => collection.dbid === sectionIdBeingEdited
      );
      const newSectionIdBeingEdited = serverSourcedCollections[indexOfCollectionBeingEdited]?.dbid;

      setSectionIdBeingEdited(newSectionIdBeingEdited ?? null);
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
    sectionIdBeingEdited,
    collections,
    deletedCollectionIds,
    gallery.dbid,
    galleryName,
    galleryDescription,
    pushToast,
    reportError,
    save,
    sectionIdsOrder,
    track,
  ]);

  const handleUpdateSectionOrder = useCallback((sectionIds: UniqueIdentifier[]) => {
    setSectionIdsOrder(new Set(sectionIds.map(String)));
  }, []);

  const value = useMemo(
    () => ({
      galleryName,
      setGalleryName,

      galleryDescription,
      setGalleryDescription,

      collections,

      incrementColumns,
      decrementColumns,

      activateSection,
      sectionIdBeingEdited,

      activeRowId,
      activateRow,

      moveRow,

      saveGallery,

      updateSectionOrder: handleUpdateSectionOrder,
    }),
    [
      galleryName,
      galleryDescription,
      setGalleryName,
      setGalleryDescription,

      collections,

      incrementColumns,
      decrementColumns,

      activateSection,
      sectionIdBeingEdited,

      activeRowId,
      activateRow,

      moveRow,

      saveGallery,

      handleUpdateSectionOrder,
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
