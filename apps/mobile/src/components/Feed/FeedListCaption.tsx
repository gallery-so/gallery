import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { FeedListCaptionFragment$key } from '~/generated/FeedListCaptionFragment.graphql';

import { Typography } from '../Typography';

type FeedListCaptionProps = {
  feedEventRef: FeedListCaptionFragment$key;
};

export function FeedListCaption({ feedEventRef }: FeedListCaptionProps) {
  const feedEvent = useFragment(
    graphql`
      fragment FeedListCaptionFragment on FeedEvent {
        caption
      }
    `,
    feedEventRef
  );

  if (!feedEvent.caption) {
    return null;
  }

  return (
    <Typography
      className="px-4 text-center text-2xl"
      font={{ family: 'GTAlpina', weight: 'Light', italic: true }}
    >
      {feedEvent.caption}
    </Typography>
  );
}
