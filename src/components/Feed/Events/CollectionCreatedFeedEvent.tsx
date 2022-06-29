import breakpoints from 'components/core/breakpoints';
import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, TitleXS } from 'components/core/Text/Text';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { pluralize } from 'utils/string';
import { getTimeSince } from 'utils/time';
import FeedEventTokenPreviews from '../FeedEventTokenPreviews';
import { StyledClickHandler, StyledEvent, StyledEventHeader, StyledTime } from './Event';

type Props = {
  eventRef: any;
};

export default function CollectionCreatedFeedEvent({ eventRef }: Props) {
  const event = useFragment(
    graphql`
      fragment CollectionCreatedFeedEventFragment on CollectionCreatedFeedEventData {
        eventTime
        owner {
          username
        }
        collection {
          dbid
          name
          tokens {
            token {
              dbid
            }
            ...EventMediaFragment
          }
        }
      }
    `,
    eventRef
  );
  const { push } = useRouter();

  const tokensToPreview = useMemo(() => {
    return event.collection.tokens.slice(0, 4);
  }, [event.collection.tokens]);

  const collectionPagePath = `/${event.owner.username}/${event.collection.dbid}`;
  const handleEventClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();
      void push(collectionPagePath);
    },
    [collectionPagePath, push]
  );

  const showSeeAllButton = event.collection.tokens.length > 4;

  return (
    <CustomStyledEvent>
      <StyledClickHandler href={collectionPagePath} onClick={handleEventClick}>
        <StyledEventHeader>
          {/* <span> */}
          <InteractiveLink to={`/${event.owner.username}`}>
            {event.owner.username}
          </InteractiveLink>{' '}
          <BaseM>
            added {event.collection.tokens.length}{' '}
            {pluralize(event.collection.tokens.length, 'piece')} to their new collection,{' '}
          </BaseM>
          <InteractiveLink to={`/${event.owner.username}/${event.collection.dbid}`}>
            {event.collection.name}
          </InteractiveLink>
          <Spacer width={4} />
          <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>
          {/* </span> */}
        </StyledEventHeader>
        <Spacer height={16} />
        <FeedEventTokenPreviews tokensToPreview={tokensToPreview} />
        {showSeeAllButton && (
          <>
            <Spacer height={16} />
            <StyledSecondaryButton text="See All" type="secondary" />
          </>
        )}
      </StyledClickHandler>
    </CustomStyledEvent>
  );
}

const StyledSecondaryButton = styled(Button)`
  @media only screen and ${breakpoints.desktop} {
    width: fit-content;
    align-self: end;
  }
`;

const CustomStyledEvent = styled(StyledEvent)`
  &:hover {
    ${StyledSecondaryButton} {
      ${TitleXS} {
        color: ${colors.offBlack};
      }
      border: 1px solid ${colors.offBlack};
    }
  }
`;
