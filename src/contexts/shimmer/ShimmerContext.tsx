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

type AspectRatio = 'wide' | 'square' | 'tall';

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
      setContentIsLoaded: (event?: SyntheticEvent) => {
        if (event) {
          // @ts-expect-error: issues with TS image onload event
          const aspectRatio = event.target.width / event.target.height;
          if (aspectRatio === 1) {
            setAspectRatioType('square');
          } else if (aspectRatio > 1) {
            setAspectRatioType('wide');
          } else if (aspectRatio < 1) {
            setAspectRatioType('tall');
          }

          setAspectRatio(aspectRatio);
        }

        setIsLoaded(true);
      },
    }),
    []
  );

  return (
    <ShimmerStateContext.Provider value={state}>
      <ShimmerActionContext.Provider value={actions}>
        <Container>
          <StyledShimmerComponent visible={!isLoaded}>
            <Shimmer />
          </StyledShimmerComponent>
          <StyledChildren visible={isLoaded}>{children}</StyledChildren>
        </Container>
      </ShimmerActionContext.Provider>
    </ShimmerStateContext.Provider>
  );
});

const Container = styled.div`
  position: relative;
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
`;

type VisibleProps = { visible: boolean };

const StyledShimmerComponent = styled.div<VisibleProps>`
  position: absolute;
  display: ${({ visible }) => (visible ? 'block' : 'none')};
  width: 100%;
`;

const StyledChildren = styled.div<VisibleProps>`
  height: 100%;
  width: 100%;
  // flex-basis: calc(100% - 64px); /* For collecttor's note */
  opacity: ${({ visible }) => (visible ? 1 : 0)};
`;

export default ShimmerProvider;
