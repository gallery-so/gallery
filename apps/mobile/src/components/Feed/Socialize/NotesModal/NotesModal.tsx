import { FlashList, ListRenderItem } from '@shopify/flash-list';
import React, { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, usePaginationFragment } from 'react-relay';

import { AdmireNoteFragment$key } from '~/generated/AdmireNoteFragment.graphql';
import { CommentNoteFragment$key } from '~/generated/CommentNoteFragment.graphql';
import { NotesModalFragment$key } from '~/generated/NotesModalFragment.graphql';

import { AdmireNote } from './AdmireNote';
import { CommentNote } from './CommentNote';

type Props = {
  eventRef: NotesModalFragment$key;
};

export const NOTES_PER_PAGE = 10;

type SortedInteraction =
  | {
      __typename: 'Comment';
      commentRef: CommentNoteFragment$key;
    }
  | {
      __typename: 'Admire';
      admireRef: AdmireNoteFragment$key;
    }
  | {
      __typename: '%other';
    };

export function NotesModal({ eventRef }: Props) {
  const {
    data: feedEvent,
    loadPrevious,
    hasPrevious,
    isLoadingPrevious,
  } = usePaginationFragment(
    graphql`
      fragment NotesModalFragment on FeedEvent
      @refetchable(queryName: "NotesModalRefetchableFragment") {
        interactions(last: $interactionsFirst, before: $interactionsAfter)
          @connection(key: "NotesModal_interactions") {
          edges {
            node {
              __typename

              ... on Admire {
                __typename
                ...AdmireNoteFragment
              }
              ... on Comment {
                __typename
                ...CommentNoteFragment
              }
            }
          }
        }
      }
    `,
    eventRef
  );

  const nonNullInteractionsAndSeeMore = useMemo(() => {
    const interactions: SortedInteraction[] = [];

    for (const interaction of feedEvent.interactions?.edges ?? []) {
      if (interaction?.node) {
        if (interaction.node.__typename === 'Comment') {
          interactions.push({ __typename: 'Comment', commentRef: interaction.node });
        } else if (interaction.node.__typename === 'Admire') {
          interactions.push({ __typename: 'Admire', admireRef: interaction.node });
        }
      }
    }

    return interactions;
  }, [feedEvent.interactions?.edges]);

  const sortedInteractions = useMemo(() => {
    return nonNullInteractionsAndSeeMore.sort((a, b) => {
      if (a.__typename === 'Comment' && b.__typename === 'Admire') {
        return -1;
      }

      if (a.__typename === 'Admire' && b.__typename === 'Comment') {
        return 1;
      }

      return 0;
    });
  }, [nonNullInteractionsAndSeeMore]);

  const loadMore = useCallback(() => {
    if (hasPrevious) {
      loadPrevious(NOTES_PER_PAGE);
    }
  }, [hasPrevious, loadPrevious]);

  const renderItem = useCallback<ListRenderItem<SortedInteraction>>(({ item }) => {
    if (item.__typename === 'Comment') {
      return <CommentNote commentRef={item.commentRef} />;
    } else if (item.__typename === 'Admire') {
      return <AdmireNote admireRef={item.admireRef} />;
    }
    return <View />;
  }, []);

  return (
    <FlashList
      data={sortedInteractions}
      estimatedItemSize={40}
      renderItem={renderItem}
      onEndReached={loadMore}
      refreshing={isLoadingPrevious}
      onEndReachedThreshold={0.8}
      ItemSeparatorComponent={() => <View className="h-2" />}
    />
  );
}
