import { useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { sanitizeMarkdown } from 'src/utils/sanitizeMarkdown';

import { SuggestionUserFragment$key } from '~/generated/SuggestionUserFragment.graphql';
import { SuggestionUserQueryFragment$key } from '~/generated/SuggestionUserQueryFragment.graphql';

import { Markdown } from '../Markdown';
import { Typography } from '../Typography';
import { FollowButton } from './FollowButton';

type Props = {
  userRef: SuggestionUserFragment$key;
  queryRef: SuggestionUserQueryFragment$key;
};

const MAX_DESCRIPTION_CHARACTER = 50;

export function SuggestionUser({ userRef, queryRef }: Props) {
  const user = useFragment(
    graphql`
      fragment SuggestionUserFragment on GalleryUser {
        username
        bio
        ...FollowButtonUserFragment
      }
    `,
    userRef
  );

  const query = useFragment(
    graphql`
      fragment SuggestionUserQueryFragment on Query {
        ...FollowButtonQueryFragment
      }
    `,
    queryRef
  );

  const formattedBio = useMemo(() => {
    const bio = sanitizeMarkdown(user.bio ?? '');
    return bio.substring(0, MAX_DESCRIPTION_CHARACTER);
  }, [user.bio]);

  return (
    <View className="flex flex-row items-center justify-between px-4 py-3">
      <View className="flex-1 pr-4">
        <Typography
          font={{
            family: 'ABCDiatype',
            weight: 'Bold',
          }}
        >
          {user.username}
        </Typography>
        <View className="h-5">
          <Markdown numberOfLines={1}>{formattedBio}</Markdown>
        </View>
      </View>

      <FollowButton userRef={user} queryRef={query} />
    </View>
  );
}
