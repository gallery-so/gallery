import styled from 'styled-components';
import EventMedia from './Events/EventMedia';

type Props = {
  tokensToPreview: any;
};

export default function FeedEventTokenPreviews({ tokensToPreview }: Props) {
  const showSmallerPreview = tokensToPreview.length > 3;
  return (
    <StyledFeedEventTokenPreviews>
      {tokensToPreview.map((collectionToken) => (
        <EventMedia
          tokenRef={collectionToken}
          key={collectionToken.token.dbid}
          showSmallerPreview={showSmallerPreview}
        />
      ))}
    </StyledFeedEventTokenPreviews>
  );
}

const StyledFeedEventTokenPreviews = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
`;
