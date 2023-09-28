import Link from 'next/link';
import { Route } from 'nextjs-routes';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { NonRecursiveFeedEventData } from '~/components/Feed/FeedEventData';
import { FeedMode } from '~/components/Feed/types';
import UserHoverCard from '~/components/HoverCard/UserHoverCard';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { GalleryUpdatedFeedEventFragment$key } from '~/generated/GalleryUpdatedFeedEventFragment.graphql';
import { GalleryUpdatedFeedEventQueryFragment$key } from '~/generated/GalleryUpdatedFeedEventQueryFragment.graphql';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import { getTimeSince } from '~/shared/utils/time';

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
          ...UserHoverCardFragment
          ...ProfilePictureFragment
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

  // Max 3 sub events
  const subEvents = useMemo(() => event?.subEventDatas?.slice(0, 4), [event?.subEventDatas]);

  return (
    <StyledEvent>
      <VStack gap={16}>
        <StyledEventHeader>
          <HStack gap={4} align="center" inline>
            <HStack gap={4} align="center" inline>
              <ProfilePicture size="sm" userRef={event.owner} />
              <UserHoverCard userRef={event.owner} />
            </HStack>
            <BaseM>updated</BaseM>
            <Link href={galleryPagePath} passHref legacyBehavior>
              <StyledEventLabel>{event?.gallery?.name || 'their gallery'}</StyledEventLabel>
            </Link>
            <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>
          </HStack>
        </StyledEventHeader>
        <StyledEventContent>
          <VStack gap={16}>
            {caption && (
              <StyledCaptionContainer gap={8} align="center">
                <BaseM>
                  <Markdown text={caption} />
                </BaseM>
              </StyledCaptionContainer>
            )}
            <VStack>
              {subEvents?.map((subEvent, index) => {
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
          </VStack>
        </StyledEventContent>
      </VStack>
    </StyledEvent>
  );
}
