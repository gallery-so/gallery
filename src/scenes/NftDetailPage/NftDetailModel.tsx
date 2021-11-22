import { useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';
import styled from 'styled-components';
import { Nft } from 'types/Nft';
import '@google/model-viewer'
import './model-viewer.css';

type Props = {
  nft: Nft;
};

// TODO: Clean this up once fixed
// https://github.com/google/model-viewer/issues/1502

declare global {
  namespace JSX {
    interface IntrinsicElements {
    'model-viewer': ModelViewerJSX &
        React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
    }
  }
}

interface ModelViewerJSX {
  src: string
  poster?: string
  class: string
}

function NftDetailModel({ nft }: Props) {
  const setContentIsLoaded = useSetContentIsLoaded();
  setContentIsLoaded()
  return (
    <StyledNftDetailModel>
      <model-viewer class="model-viewer" auto-rotate camera-controls src={nft.animation_url}/>
    </StyledNftDetailModel>
  );
}

const StyledNftDetailModel = styled.div`
  width: 100%;
  height: 100%;
`;

export default NftDetailModel;
