import Shimmer from 'components/Shimmer/Shimmer';
import {
  createContext,
  memo,
  ReactNode,
  SyntheticEvent,
  useContext,
  useMemo,
  useState,
} from 'react';
import styled from 'styled-components';

type AspectRatio = 'wide' | 'square' | 'tall' | 'unknown';

type ShimmerState = {
  aspectRatio: null | number;
  aspectRatioType: null | AspectRatio;
};

const ShimmerStateContext = createContext<ShimmerState | undefined>(undefined);

export const useContentState = (): ShimmerState => {
  const context = useContext(ShimmerStateContext);
  if (!context) {
    throw new Error('Attempted to use ShimmerStateContext without a provider!');
  }

  return context;
};

type ShimmerAction = {
  setContentIsLoaded: (event?: SyntheticEvent) => void;
};

const ShimmerActionContext = createContext<ShimmerAction | undefined>(undefined);

export const useSetContentIsLoaded = (): ShimmerAction['setContentIsLoaded'] => {
  const context = useContext(ShimmerActionContext);
  if (!context) {
    throw new Error('Attempted to use ShimmerActionContext without a provider!');
  }

  return context.setContentIsLoaded;
};

type Props = { children: ReactNode | ReactNode[] };

const ShimmerProvider = memo(({ children }: Props) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<null | number>(null);
  const [aspectRatioType, setAspectRatioType] = useState<null | AspectRatio>(null);

  const state = useMemo(
    () => ({
      aspectRatio,
      aspectRatioType,
    }),
    [aspectRatio, aspectRatioType]
  );

  const actions = useMemo(
    () => ({
      // using `any` here because the SynetheticEvent could be fired by different kinds of nodes that are mounting,
      // such as images, videos, and iframes, each of which come with different properties.
      setContentIsLoaded: (event?: any) => {
        if (event) {
          // default aspect ratio to 1; if we can't determine an asset's dimensions, we'll show it in a square viewport
          let aspectRatio = 1;
          if (event.target.nodeName === 'IMG') {
            aspectRatio = event.target.naturalWidth / event.target.naturalHeight;
          }
          if (event.target.nodeName === 'VIDEO') {
            aspectRatio = event.target.videoWidth / event.target.videoHeight;
          }
          setAspectRatio(aspectRatio);

          if (aspectRatio === 1) {
            setAspectRatioType('square');
          } else if (aspectRatio > 1) {
            setAspectRatioType('wide');
          } else if (aspectRatio < 1) {
            setAspectRatioType('tall');
          } else {
            setAspectRatioType('unknown');
          }
        }

        setIsLoaded(true);
      },
    }),
    []
  );

  return (
    <ShimmerStateContext.Provider value={state}>
      <ShimmerActionContext.Provider value={actions}>
        <Container overflowHidden={!isLoaded}>
          <StyledShimmerComponent visible={!isLoaded}>
            <Shimmer />
          </StyledShimmerComponent>
          <StyledChildren visible={isLoaded}>{children}</StyledChildren>
        </Container>
      </ShimmerActionContext.Provider>
    </ShimmerStateContext.Provider>
  );
});

const Container = styled.div<{ overflowHidden: boolean }>`
  position: relative;
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  // remove overflow after underlying NFT has loaded; otherwise the NFT will appear cut-off
  overflow: ${({ overflowHidden }) => (overflowHidden ? 'hidden' : 'visible')};
`;

type VisibleProps = { visible: boolean };

const StyledShimmerComponent = styled.div<VisibleProps>`
  position: absolute;
  display: ${({ visible }) => (visible ? 'block' : 'none')};
  width: inherit;
`;

const StyledChildren = styled.div<VisibleProps>`
  height: 100%;
  width: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
`;

export default ShimmerProvider;
