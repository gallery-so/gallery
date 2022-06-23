import ImageWithLoading from 'components/LoadingAsset/ImageWithLoading';
import ShimmerProvider from 'contexts/shimmer/ShimmerContext';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

type Props = {
  tokenRef: any;
};

export default function EventMedia({ tokenRef }: Props) {
  const token = useFragment(
    graphql`
      fragment EventMediaFragment on Token {
        name
        media {
          ... on Media {
            previewURLs {
              medium
              # srcSet
            }
          }
        }
      }
    `,
    tokenRef
  );
  console.log(token);
  return (
    <StyledEventMedia>
      <ShimmerProvider>
        <ImageWithLoading src={token.media.previewURLs.medium} alt={token.name ?? ''} />
      </ShimmerProvider>
    </StyledEventMedia>
  );
}

const StyledEventMedia = styled.div`
  max-height: 259.33px;
  display: flex;
`;
