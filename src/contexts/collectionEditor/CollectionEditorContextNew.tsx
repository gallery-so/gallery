import { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import deepClone from 'fast-deepclone';
import { createContext, memo, ReactNode, useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';

import { useGalleryEditorContext } from '~/components/GalleryEditor/GalleryEditorContext';
import { ErrorWithSentryMetadata } from '~/errors/ErrorWithSentryMetadata';
import { CollectionEditorContextNewFragment$key } from '~/generated/CollectionEditorContextNewFragment.graphql';
import { generate12DigitId, parseCollectionLayoutGraphql } from '~/utils/collectionLayout';
import { removeNullValues } from '~/utils/removeNullValues';

const DEFAULT_COLUMN_SETTING = 3;

type StagedItem = { kind: 'whitespace'; id: string } | { kind: 'token'; id: string };

type StagedSection = {
  columns: number;
  items: StagedItem[];
};

type CollectionEditorContextType = {
  // State
  stagedTokenIds: Set<string>;
  liveDisplayTokenIds: Set<string>;

  sections: Record<string, StagedSection>;

  activeSectionId: string | null;

  // Actions
  toggleTokenStaged: (tokenId: string) => void;

  reorderTokensWithinSection: (event: DragEndEvent, sectionId: string) => void;

  addSection: () => void;
  reorderSection: (event: DragEndEvent) => void;
  deleteSection: (sectionId: string) => void;

  incrementColumns: (sectionId: string) => void;
  decrementColumns: (sectionId: string) => void;

  toggleTokenLiveDisplay: (tokenId: string) => void;

  activateSection: (sectionId: string) => void;
};

const CollectionEditorContext = createContext<CollectionEditorContextType | undefined>(undefined);

type Props = { children: ReactNode; queryRef: CollectionEditorContextNewFragment$key };

const CollectionEditorProvider = memo(({ children, queryRef }: Props) => {
  const query = useFragment(
    graphql`
      fragment CollectionEditorContextNewFragment on Query {
        galleryById(id: $galleryId) {
          ... on Gallery {
            collections {
              dbid
              layout @required(action: THROW) {
                ...collectionLayoutParseFragment
              }
              tokens @required(action: THROW) {
                tokenSettings {
                  renderLive
                }
                token @required(action: THROW) {
                  dbid
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const { collectionIdBeingEdited } = useGalleryEditorContext();

  if (!collectionIdBeingEdited) {
    throw new ErrorWithSentryMetadata(
      'Tried to render CollectionEditorContext without a collection id',
      {}
    );
  }

  const collectionBeingEdited = useMemo(() => {
    return query.galleryById?.collections?.find(
      (collection) => collection?.dbid === collectionIdBeingEdited
    );
  }, [collectionIdBeingEdited, query.galleryById?.collections]);

  if (!collectionBeingEdited) {
    throw new ErrorWithSentryMetadata('Could not find collection for id', {
      collectionIdBeingEdited,
    });
  }

  // All of the tokens in the collection we're editing
  const collectionTokens = useMemo(() => {
    return removeNullValues(
      query.galleryById?.collections
        ?.filter((collection) => collection?.dbid === collectionIdBeingEdited)
        .flatMap((collection) => collection?.tokens)
    );
  }, [collectionIdBeingEdited, query.galleryById?.collections]);

  const [liveDisplayTokenIds, setLiveDisplayTokenIds] = useState<Set<string>>(() => {
    const liveDisplayTokenIds = collectionTokens
      .filter((token) => token?.tokenSettings?.renderLive)
      .map((token) => token?.token?.dbid);

    return new Set(removeNullValues(liveDisplayTokenIds));
  });

  const [sections, setSections] = useState<Record<string, StagedSection>>(() => {
    const sections: Record<string, StagedSection> = {};

    const parsed = parseCollectionLayoutGraphql(collectionTokens, collectionBeingEdited.layout);
    for (const sectionId in parsed) {
      const parsedSection = parsed[sectionId];

      sections[sectionId] = {
        columns: parsedSection.columns,
        items: parsedSection.items.map((item) => {
          if ('whitespace' in item) {
            return { kind: 'whitespace', id: item.id };
          } else {
            return { kind: 'token', id: item.token.dbid };
          }
        }),
      };
    }

    return sections;
  });

  const [activeSectionId, setActiveSectionId] = useState<string | null>(() => {
    return Object.keys(sections)[0];
  });

  const reorderTokensWithinSection = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setSections((previous) => {
        if (!activeSectionId) {
          throw new ErrorWithSentryMetadata(
            'Tried to reorder tokens within section without a section id',
            {}
          );
        }

        const cloned = deepClone(previous);
        const section = cloned[activeSectionId];

        const oldIndex = section.items.findIndex((item) => item.id === active.id);
        const newIndex = section.items.findIndex((item) => item.id === over?.id);

        arrayMove(section.items, oldIndex, newIndex);

        return cloned;
      });
    },
    [activeSectionId]
  );

  const reorderSection = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setSections((previous) => {
      const previousOrder = Object.keys(previous); // get previous order as list of section ids

      const oldIndex = previousOrder.findIndex((id) => id === active.id);
      const newIndex = previousOrder.findIndex((id) => id === over?.id);
      const newOrder = arrayMove(previousOrder, oldIndex, newIndex);

      return newOrder.reduce((acc, sectionId) => {
        return { ...acc, [sectionId]: previous[sectionId] };
      }, {});
    });
  }, []);

  const addSection = useCallback(() => {
    const newSectionId = generate12DigitId();

    setSections((previous) => {
      const newSection: StagedSection = {
        columns: DEFAULT_COLUMN_SETTING,
        items: [],
      };

      return {
        ...previous,
        [newSectionId]: newSection,
      };
    });

    setActiveSectionId(newSectionId);
  }, []);

  const deleteSection = useCallback(
    (sectionId: string) => {
      const sectionTokenIds = sections[sectionId].items
        .filter((item) => item.kind === 'token')
        .map((token) => token.id);

      setLiveDisplayTokenIds((previous) => {
        const cloned = new Set(previous);
        sectionTokenIds.forEach(cloned.delete);
        return cloned;
      });

      // Remove the section
      const nextSections = { ...sections };
      delete nextSections[sectionId];
      setSections(nextSections);
      setActiveSectionId(Object.keys(nextSections)[0] ?? null);
    },
    [sections]
  );

  const incrementColumns = useCallback((sectionId: UniqueIdentifier) => {
    setSections((previous) => {
      return {
        ...previous,
        [sectionId]: {
          ...previous[sectionId],
          columns: previous[sectionId].columns + 1,
        },
      };
    });
  }, []);

  const decrementColumns = useCallback((sectionId: UniqueIdentifier) => {
    setSections((previous) => {
      return {
        ...previous,
        [sectionId]: {
          ...previous[sectionId],
          columns: previous[sectionId].columns - 1,
        },
      };
    });
  }, []);

  const toggleTokenLiveDisplay = useCallback((tokenId: string) => {
    setLiveDisplayTokenIds((previous) => {
      const cloned = new Set(previous);

      if (cloned.has(tokenId)) {
        cloned.delete(tokenId);
      } else {
        cloned.add(tokenId);
      }

      return cloned;
    });
  }, []);

  const stagedTokenIds = useMemo(() => {
    const stagedTokenIds = Object.values(sections)
      .flatMap((section) => section.items)
      .filter((item) => item.kind === 'token')
      .map((token) => token.id);

    return new Set(stagedTokenIds);
  }, [sections]);

  const removeTokenFromSections = useCallback((tokenId: string) => {
    setSections((previous) => {
      const cloned = deepClone(previous);

      Object.values(cloned).forEach((section) => {
        section.items = section.items.filter((item) => item.id !== tokenId);
      });

      return cloned;
    });
  }, []);

  const addTokenToActiveSection = useCallback(
    (tokenId: string) => {
      if (!activeSectionId) {
        // Maybe make a new section here for them?

        return;
      }

      setSections((previous) => {
        const cloned = deepClone(previous);

        cloned[activeSectionId].items.push({ kind: 'token', id: tokenId });

        return cloned;
      });
    },
    [activeSectionId]
  );

  const toggleTokenStaged = useCallback(
    (tokenId: string) => {
      if (stagedTokenIds.has(tokenId)) {
        removeTokenFromSections(tokenId);
      } else {
        addTokenToActiveSection(tokenId);
      }
    },
    [addTokenToActiveSection, removeTokenFromSections, stagedTokenIds]
  );

  const activateSection = useCallback((sectionId: string) => {
    setActiveSectionId(sectionId);
  }, []);

  const value = useMemo((): CollectionEditorContextType => {
    return {
      activateSection,
      activeSectionId,
      addSection,
      decrementColumns,
      deleteSection,
      incrementColumns,
      liveDisplayTokenIds,
      reorderSection,
      reorderTokensWithinSection,
      sections,
      stagedTokenIds,
      toggleTokenLiveDisplay,
      toggleTokenStaged,
    };
  }, [
    activateSection,
    activeSectionId,
    addSection,
    decrementColumns,
    deleteSection,
    incrementColumns,
    liveDisplayTokenIds,
    reorderSection,
    reorderTokensWithinSection,
    sections,
    stagedTokenIds,
    toggleTokenLiveDisplay,
    toggleTokenStaged,
  ]);

  return (
    <CollectionEditorContext.Provider value={value}>{children}</CollectionEditorContext.Provider>
  );
});

CollectionEditorProvider.displayName = 'CollectionEditorProvider';

export default CollectionEditorProvider;
