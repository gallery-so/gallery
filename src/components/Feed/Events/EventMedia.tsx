import ImageWithLoading from 'components/LoadingAsset/ImageWithLoading';
import ShimmerProvider from 'contexts/shimmer/ShimmerContext';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import FeedEventNftPreviewWrapper from './FeedEventNftPreviewWrapper';

type Props = {
  tokenRef: any;
  showSmallerPreview: boolean;
};

const DEFAULT_DIMENSIONS_DESKTOP = 259.33;
const SMALL_DIMENSIONS_DESKTOP = 190.5;
// const DEFAULT_DIMENSIONS_MOBILE = 259.33;

export default function EventMedia({ tokenRef, showSmallerPreview }: Props) {
  const token = useFragment(
    graphql`
      fragment EventMediaFragment on CollectionToken {
        ...FeedEventNftPreviewWrapperFragment
      }
    `,
    tokenRef
  );

  const maxWidth = showSmallerPreview ? SMALL_DIMENSIONS_DESKTOP : DEFAULT_DIMENSIONS_DESKTOP;
  const maxHeight = showSmallerPreview ? SMALL_DIMENSIONS_DESKTOP : DEFAULT_DIMENSIONS_DESKTOP;

  return (
    <StyledEventMedia width={maxWidth}>
      <FeedEventNftPreviewWrapper tokenRef={token} maxWidth={maxWidth} maxHeight={maxHeight} />
    </StyledEventMedia>
  );
}

const StyledEventMedia = styled.div<{ width: number }>`
  display: flex;
  width: ${({ width }) => width}px;
`;
