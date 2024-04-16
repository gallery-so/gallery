import { createContext, SetStateAction, useCallback, useContext, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import { useTrack } from 'shared/contexts/AnalyticsContext';
import { useReportError } from 'shared/contexts/ErrorReportingContext';
import { ErrorWithSentryMetadata } from 'shared/errors/ErrorWithSentryMetadata';
import { removeNullValues } from 'shared/relay/removeNullValues';
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
import { StagedItem, StagedRow, StagedSection, StagedSectionList } from './types';
import { arrayMove } from './util';

type GalleryEditorActions = {
  galleryId: string;
  galleryName: string;
  setGalleryName: (name: string) => void;
  galleryDescription: string;
  setGalleryDescription: (description: string) => void;

  sections: StagedSectionList;
  activateSection: (sectionId: string) => void;
  sectionIdBeingEdited: string | null;

  moveSection: (activeSectionId: string, overSectionId: string) => void;
  moveSectionUp: () => void;
  moveSectionDown: () => void;

  activeRowId: string | null;
  activateRow: (sectionId: string, rowId: string) => void;
  clearActiveRow: () => void;
  moveRow: (activeRowId: string, overRowId: string) => void;

  incrementColumns: (rowId: string) => void;
  decrementColumns: (rowId: string) => void;

  toggleTokensStaged: (tokenIds: string[]) => void;

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
        viewer {
          ... on Viewer {
            user {
              tokens(ownershipFilter: [Creator, Holder]) {
                __typename
                dbid
                # eslint-disable-next-line relay/must-colocate-fragment-spreads
                ...GalleryEditorTokenPreviewFragment
              }
            }
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

  const galleryId = gallery.dbid;
  const [galleryName, setGalleryName] = useState(gallery.name ?? '');
  const [galleryDescription, setGalleryDescription] = useState(gallery.description ?? '');

  const nonNullAllTokens = useMemo(() => {
    return removeNullValues(query.viewer?.user?.tokens) ?? [];
  }, [query.viewer?.user?.tokens]);

  const [sections, setSections] = useState<StagedSectionList>(() =>
    getInitialCollectionsFromServer(gallery)
  );

  const [sectionIdBeingEdited, setSectionIdBeingEdited] = useState<string | null>(null);

  const [deletedCollectionIds, setDeletedCollectionIds] = useState(() => {
    return new Set<string>();
  });

  const activateSection = useCallback((sectionId: string) => {
    setSectionIdBeingEdited(sectionId);
  }, []);

  const updateSection = useCallback(
    (sectionId: string, value: SetStateAction<StagedSection>) => {
      setSections((previousSections) => {
        return previousSections.map((previousSection) => {
          if (previousSection.dbid === sectionId) {
            if (typeof value === 'function') {
              return value(previousSection);
            } else {
              return value;
            }
          }

          return previousSection;
        });
      });
    },
    [setSections]
  );

  const moveSection = useCallback(
    (activeSectionId: string, overSectionId: string) => {
      setSections((previousSections) => {
        const activeSectionIndex = previousSections.findIndex(
          (section) => section.dbid === activeSectionId
        );
        const overSectionIndex = previousSections.findIndex(
          (section) => section.dbid === overSectionId
        );

        return arrayMove(previousSections, activeSectionIndex, overSectionIndex);
      });
    },
    [setSections]
  );

  const moveSectionUp = useCallback(() => {
    if (!sectionIdBeingEdited) {
      return;
    }

    setSections((previousSections) => {
      const sectionIndex = previousSections.findIndex(
        (section) => section.dbid === sectionIdBeingEdited
      );

      if (sectionIndex === 0) {
        return previousSections;
      }

      return arrayMove(previousSections, sectionIndex, sectionIndex - 1);
    });
  }, [sectionIdBeingEdited, setSections]);

  const moveSectionDown = useCallback(() => {
    if (!sectionIdBeingEdited) {
      return;
    }

    setSections((previousSections) => {
      const sectionIndex = previousSections.findIndex(
        (section) => section.dbid === sectionIdBeingEdited
      );

      if (sectionIndex === previousSections.length - 1) {
        return previousSections;
      }

      return arrayMove(previousSections, sectionIndex, sectionIndex + 1);
    });
  }, [sectionIdBeingEdited, setSections]);

  const updateRow = useCallback(
    (sectionId: string, value: SetStateAction<StagedRow>) => {
      if (!sectionIdBeingEdited) {
        return;
      }

      updateSection(sectionIdBeingEdited, (previousSection) => {
        return {
          ...previousSection,
          rows: previousSection.rows.map((previousSection) => {
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
      ? sections.find((section) => section.dbid === sectionIdBeingEdited)
      : null;
  }, [sectionIdBeingEdited, sections]);

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

  const clearActiveRow = useCallback(() => {
    setSections((previousSections) => {
      return previousSections.map((previousSection) => {
        if (previousSection.dbid === sectionIdBeingEdited) {
          return { ...previousSection, activeRowId: null };
        }

        return previousSection;
      });
    });
  }, [sectionIdBeingEdited]);

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
    (activeRowId: string, overRowId: string) => {
      const activeSectionId = sections.find((section) =>
        section.rows.some((row) => row.id === activeRowId)
      )?.dbid;

      if (!activeSectionId) {
        return;
      }

      updateSection(activeSectionId, (previousSection) => {
        const activeRowIndex = previousSection.rows.findIndex((row) => row.id === activeRowId);
        const overRowIndex = previousSection.rows.findIndex((row) => row.id === overRowId);

        return {
          ...previousSection,
          rows: arrayMove(previousSection.rows, activeRowIndex, overRowIndex),
        };
      });
    },
    [sections, updateSection]
  );

  const toggleTokensStaged = useCallback(
    (tokenIds: string[]) => {
      if (!activeRowId) {
        // Make a new row for the user
        return;
      }

      const tokensToAdd: StagedItem[] = [];
      tokenIds.forEach((tokenId) => {
        const tokenRef = nonNullAllTokens.find((token) => token.dbid === tokenId);

        if (!tokenRef) {
          return;
        }

        tokensToAdd.push({
          id: tokenId,
          kind: 'token',
          tokenRef,
        });
      });

      updateRow(activeRowId, (previousRow) => {
        const newItems = [...previousRow.items, ...tokensToAdd];
        return { ...previousRow, items: newItems };
      });
    },
    [activeRowId, nonNullAllTokens, updateRow]
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

    const updatedCollections: UpdateCollectionInput[] = sections
      .filter((section) => !section.localOnly)
      .map(localCollectionToUpdatedCollection);

    const createdCollections: CreateCollectionInGalleryInput[] = sections
      .filter((section) => section.localOnly)
      .map(localCollectionToCreatedCollection);

    const deletedCollections = [...deletedCollectionIds];

    const order = sections.map((section) => section.dbid);

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
      setSections(serverSourcedCollections);

      // Reset the deleted collection ids since we just deleted them
      setDeletedCollectionIds(new Set());

      const indexOfCollectionBeingEdited = sections.findIndex(
        (section) => section.dbid === sectionIdBeingEdited
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
    sections,
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
      galleryId,
      galleryName,
      setGalleryName,

      galleryDescription,
      setGalleryDescription,

      sections,

      incrementColumns,
      decrementColumns,

      activateSection,
      sectionIdBeingEdited,

      moveSection,
      moveSectionUp,
      moveSectionDown,

      activeRowId,
      activateRow,
      clearActiveRow,

      moveRow,

      toggleTokensStaged,
      saveGallery,
    }),
    [
      galleryId,
      galleryName,
      galleryDescription,
      setGalleryName,
      setGalleryDescription,

      sections,

      incrementColumns,
      decrementColumns,

      activateSection,
      sectionIdBeingEdited,

      moveSection,
      moveSectionUp,
      moveSectionDown,

      activeRowId,
      activateRow,
      clearActiveRow,

      moveRow,
      toggleTokensStaged,
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
