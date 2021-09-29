import Shimmer from 'components/Shimmer/Shimmer';
import {
  createContext,
  memo,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
import styled from 'styled-components';

type ShimmerAction = {
  setContentIsLoaded: () => void;
};

const ShimmerActionContext = createContext<ShimmerAction | undefined>(
  undefined,
);

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

  const value = useMemo(
    () => ({
      setContentIsLoaded: () => {
        setIsLoaded(true);
      },
    }),
    [],
  );

  return (
    <ShimmerActionContext.Provider value={value}>
      <Container>
        <StyledShimmerComponent visible={!isLoaded}>
          <Shimmer />
        </StyledShimmerComponent>
        <StyledChildren visible={isLoaded}>{children}</StyledChildren>
      </Container>
    </ShimmerActionContext.Provider>
  );
});

const Container = styled.div`
  position: relative;
  width: 100%;
`;

type VisibleProps = { visible: boolean };

const StyledShimmerComponent = styled.div<VisibleProps>`
  position: absolute;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  width: 100%;
`;

const StyledChildren = styled.div<VisibleProps>`
  height: 100%;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
`;

export default ShimmerProvider;
