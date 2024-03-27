import { createContext, SetStateAction, useCallback, useContext, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';

import { GalleryEditorContextFragment$key } from '~/generated/GalleryEditorContextFragment.graphql';

import { getInitialCollectionsFromServer } from './getInitialCollectionsFromServer';
import { StagedCollection, StagedCollectionList, StagedSection } from './types';

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
            name
            description
            ...getInitialCollectionsFromServerFragment
          }
        }
      }
    `,
    queryRef
  );

  if (query.galleryById?.__typename !== 'Gallery') {
    throw new Error(
      `Expected gallery to have typename \`Gallery\`, but received ${query.galleryById?.__typename}`
    );
  }
  const gallery = query.galleryById;

  const [galleryName, setGalleryName] = useState(gallery.name ?? '');
  const [galleryDescription, setGalleryDescription] = useState(gallery.description ?? '');

  const [collections, setCollections] = useState<StagedCollectionList>(() =>
    getInitialCollectionsFromServer(gallery)
  );

  const [collectionIdBeingEdited, setCollectionIdBeingEdited] = useState<string | null>(null);

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
