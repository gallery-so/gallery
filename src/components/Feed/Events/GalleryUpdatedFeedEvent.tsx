import Link from 'next/link';
import { Route } from 'nextjs-routes';
import { graphql, useFragment } from 'react-relay';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { FeedMode } from '~/components/Feed/Feed';
import { NonRecursiveFeedEventData } from '~/components/Feed/FeedEventData';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { ReportingErrorBoundary } from '~/contexts/boundary/ReportingErrorBoundary';
import { GalleryUpdatedFeedEventFragment$key } from '~/generated/GalleryUpdatedFeedEventFragment.graphql';
import { GalleryUpdatedFeedEventQueryFragment$key } from '~/generated/GalleryUpdatedFeedEventQueryFragment.graphql';
import { getTimeSince } from '~/utils/time';

import { StyledCaptionContainer } from './CollectionCreatedFeedEvent';
import {
  StyledEvent,
  StyledEventContent,
  StyledEventHeader,
  StyledEventLabel,
  StyledTime,
} from './EventStyles';

type Props = {
  feedMode: FeedMode;
  eventDbid: string;
  caption: string | null;
  eventRef: GalleryUpdatedFeedEventFragment$key;
  queryRef: GalleryUpdatedFeedEventQueryFragment$key;
};

export default function GalleryUpdatedFeedEvent({
  eventDbid,
  feedMode,
  caption,
  eventRef,
  queryRef,
}: Props) {
  const event = useFragment(
    graphql`
      fragment GalleryUpdatedFeedEventFragment on GalleryUpdatedFeedEventData {
        __typename
        eventTime
        gallery @required(action: THROW) {
          dbid
          name
        }
        owner @required(action: THROW) {
          username @required(action: THROW)
          ...HoverCardOnUsernameFragment
        }
        subEventDatas {
          ...FeedEventDataNonRecursiveFragment
        }
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment GalleryUpdatedFeedEventQueryFragment on Query {
        ...HoverCardOnUsernameFollowFragment
        ...FeedEventDataNonRecursiveQueryFragment
      }
    `,
    queryRef
  );

  const galleryPagePath: Route = {
    pathname: '/[username]/galleries/[galleryId]',
    query: {
      username: event.owner.username,
      galleryId: event.gallery.dbid,
    },
  };

  return (
    <StyledEvent>
      <VStack gap={16}>
        <StyledEventHeader>
          <HStack gap={4} inline>
            <BaseM>
              <HoverCardOnUsername userRef={event.owner} queryRef={query} /> updated{' '}
              <Link href={galleryPagePath} passHref>
                <StyledEventLabel>{event?.gallery?.name || 'their gallery'}</StyledEventLabel>
              </Link>
              <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>
            </BaseM>
          </HStack>
        </StyledEventHeader>
        <StyledEventContent>
          <VStack gap={16}>
            {caption && (
              <StyledCaptionContainer gap={8} align="center">
                <BaseM>{caption}</BaseM>
              </StyledCaptionContainer>
            )}
            {event?.subEventDatas?.map((subEvent, index) => {
              return (
                <ReportingErrorBoundary key={index} fallback={<></>} dontReport>
                  <NonRecursiveFeedEventData
                    isSubEvent
                    feedMode={feedMode}
                    eventDbid={eventDbid}
                    caption={null}
                    queryRef={query}
                    eventDataRef={subEvent}
                  />
                </ReportingErrorBoundary>
              );
            })}
          </VStack>
        </StyledEventContent>
      </VStack>
    </StyledEvent>
  );
}
