import { Button } from 'components/core/Button/Button';
import DeprecatedButton from 'components/core/Button/DeprecatedButton';
import styled from 'styled-components';

export default function DesignPage() {
  return (
    <>
      <Container>
        <Title>Button</Title>

        <Examples>
          <DeprecatedButton text="primary" />
          <DeprecatedButton text="primary" loading />
          <DeprecatedButton text="primary" loading mini />
        </Examples>
        <Examples>
          <Button>primary</Button>
          <Button loading>primary</Button>
          <Button loading mini>
            primary
          </Button>
        </Examples>

        <Examples>
          <DeprecatedButton text="secondary" type="secondary" />
          <DeprecatedButton text="secondary" type="secondary" loading />
          <DeprecatedButton text="secondary" type="secondary" loading mini />
        </Examples>
        <Examples>
          <Button variant="secondary">secondary</Button>
          <Button variant="secondary" loading>
            secondary
          </Button>
          <Button variant="secondary" loading mini>
            secondary
          </Button>
        </Examples>
      </Container>
    </>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  margin: 0;
`;

const Examples = styled.div`
  display: flex;
  gap: 0.5rem;
`;
