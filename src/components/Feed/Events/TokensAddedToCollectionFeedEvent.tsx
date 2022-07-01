import breakpoints from 'components/core/breakpoints';
import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, TitleXS } from 'components/core/Text/Text';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';
import { removeNullValues } from 'utils/removeNullValues';
import { pluralize } from 'utils/string';
import { getTimeSince } from 'utils/time';
import { TokensAddedToCollectionFeedEventFragment$key } from '__generated__/TokensAddedToCollectionFeedEventFragment.graphql';
import FeedEventTokenPreviews, { TokenToPreview } from '../FeedEventTokenPreviews';
import { StyledClickHandler, StyledEvent, StyledEventHeader, StyledTime } from './EventStyles';
import unescape from 'utils/unescape';
import { useTrack } from 'contexts/analytics/AnalyticsContext';

type Props = {
  eventRef: TokensAddedToCollectionFeedEventFragment$key;
};

export default function TokensAddedToCollectionFeedEvent({ eventRef }: Props) {
  const event = useFragment(
    graphql`
      fragment TokensAddedToCollectionFeedEventFragment on TokensAddedToCollectionFeedEventData {
        eventTime
        owner @required(action: THROW) {
          username
        }
        collection @required(action: THROW) {
          dbid
          name
        }
        newTokens @required(action: THROW) {
          token {
            dbid
          }
          ...EventMediaFragment
        }
      }
    `,
    eventRef
  );
  const { push } = useRouter();

  const tokensToPreview = useMemo(() => {
    return removeNullValues(event.newTokens).slice(0, 4);
  }, [event.newTokens]) as TokenToPreview[];

  const collectionPagePath = `/${event.owner.username}/${event.collection.dbid}`;
  const track = useTrack();
  const handleEventClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();
      track('Feed: Tokens added to collection event click');
      void push(collectionPagePath);
    },
    [collectionPagePath, push, track]
  );

  const showSeeAllButton = event.newTokens.length > 4;

  const collectionName = unescape(event.collection.name ?? '');

  return (
    <CustomStyledEvent>
      <StyledClickHandler href={collectionPagePath} onClick={handleEventClick}>
        <StyledEventHeader>
          <BaseM>
            <InteractiveLink to={`/${event.owner.username}`}>
              {event.owner.username}
            </InteractiveLink>{' '}
            added {event.newTokens.length} {pluralize(event.newTokens.length, 'piece')} to
            {collectionName ? ' ' : ' their collection'}
            <InteractiveLink to={collectionPagePath}>{collectionName}</InteractiveLink>
          </BaseM>
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
