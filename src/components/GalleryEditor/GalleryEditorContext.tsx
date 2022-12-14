import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { graphql, useFragment } from 'react-relay';

import { GalleryEditorContextFragment$key } from '~/generated/GalleryEditorContextFragment.graphql';

export type GalleryEditorContextType = {
  toggleCollectionHidden: (collectionId: string) => void;
  hiddenCollectionIds: Set<string>;
};

export const GalleryEditorContext = createContext<GalleryEditorContextType | undefined>(undefined);

type GalleryEditorProviderProps = PropsWithChildren<{
  queryRef: GalleryEditorContextFragment$key;
}>;

export function GalleryEditorProvider({ queryRef, children }: GalleryEditorProviderProps) {
  const query = useFragment(
    graphql`
      fragment GalleryEditorContextFragment on Query {
        galleryById(id: $galleryId) {
          ... on Gallery {
            collections {
              dbid
              hidden
            }
          }
        }
      }
    `,
    queryRef
  );

  const [hiddenCollectionIds, setHiddenCollectionIds] = useState(() => {
    const initialHiddenIds = new Set<string>();

    for (const collection of query.galleryById?.collections ?? []) {
      if (collection?.hidden) {
        initialHiddenIds.add(collection.dbid);
      }
    }

    return initialHiddenIds;
  });

  const toggleCollectionHidden = useCallback((collectionId: string) => {
    setHiddenCollectionIds((previous) => {
      const next = new Set(previous);
      if (next.has(collectionId)) {
        next.delete(collectionId);
      } else {
        next.add(collectionId);
      }

      return next;
    });
  }, []);

  const value: GalleryEditorContextType = useMemo(() => {
    return {
      hiddenCollectionIds,
      toggleCollectionHidden,
    };
  }, [hiddenCollectionIds, toggleCollectionHidden]);

  return <GalleryEditorContext.Provider value={value}>{children}</GalleryEditorContext.Provider>;
}

export function useGalleryEditorContext() {
  const value = useContext(GalleryEditorContext);

  if (!value) {
    throw new Error('Tried to use a GalleryEditorContext without a provider.');
  }

  return value;
}
