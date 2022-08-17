import { useFragment } from 'react-relay';
import styled from 'styled-components';
import { graphql } from 'relay-runtime';
import { NftDetailVideoFragment$key } from '__generated__/NftDetailVideoFragment.graphql';

type Props = {
  mediaRef: NftDetailVideoFragment$key;
  hideControls?: boolean;
  onLoad: () => void;
  onError: () => void;
};

function NftDetailVideo({ mediaRef, hideControls = false, onLoad, onError }: Props) {
  const token = useFragment(
    graphql`
      fragment NftDetailVideoFragment on VideoMedia {
        contentRenderURLs @required(action: THROW) {
          raw @required(action: THROW)
          large @required(action: THROW)
        }
        previewURLs {
          large
        }
      }
    `,
    mediaRef
  );

  return (
    <StyledVideo
      src={`${token.contentRenderURLs.large}#t=0.001`}
      muted
      autoPlay
      loop
      playsInline
      controls={!hideControls}
      onLoadedData={onLoad}
      /**
       * NOTE: As of July 2022, there's a bug on iOS where certain videos will fail to load.
       * Upon inspecting the simulator's logs, the network request for the video asset
       * simply returns "An error occurred trying to load the resource". A few years ago
       * a similar issue occurred on iOS that was solved with a combination of the props
       * used above: `autoPlay`, `playsInline`, and `loop`. Now this bug has resurfaced,
       * and even Opensea itself cannot load videos on iOS. The best we can do is render
       * a static poster in its place.
       */
      onError={onError}
      poster={token?.previewURLs?.large ?? ''}
    />
  );
}

export const StyledVideo = styled.video`
  width: 100%;
  height: 100%;
  border: none;

  max-height: inherit;
`;

export default NftDetailVideo;
