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
import { removeNullValues } from 'utils/removeNullValues';
import { pluralize } from 'utils/string';
import { getTimeSince } from 'utils/time';
import { CollectionCreatedFeedEventFragment$key } from '__generated__/CollectionCreatedFeedEventFragment.graphql';
import FeedEventTokenPreviews, { TokenToPreview } from '../FeedEventTokenPreviews';
import { StyledClickHandler, StyledEvent, StyledEventHeader, StyledTime } from './EventStyles';

type Props = {
  eventRef: CollectionCreatedFeedEventFragment$key;
};

export default function CollectionCreatedFeedEvent({ eventRef }: Props) {
  const event = useFragment(
    graphql`
      fragment CollectionCreatedFeedEventFragment on CollectionCreatedFeedEventData {
        eventTime
        owner @required(action: THROW) {
          username
        }
        collection @required(action: THROW) {
          dbid
          name
          tokens @required(action: THROW) {
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
    return removeNullValues(event.collection.tokens).slice(0, 4);
  }, [event.collection.tokens]) as TokenToPreview[];

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
          <InteractiveLink to={`/${event.owner.username}`}>{event.owner.username}</InteractiveLink>{' '}
          <BaseM>
            added {event.collection.tokens.length}{' '}
            {pluralize(event.collection.tokens.length, 'piece')} to their new collection,{' '}
          </BaseM>
          <InteractiveLink to={`/${event.owner.username}/${event.collection.dbid}`}>
            {event.collection.name}
          </InteractiveLink>
          <Spacer width={4} />
          <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>
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
