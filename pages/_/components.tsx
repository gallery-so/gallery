import { Button, ButtonLink } from 'components/core/Button/Button';
import DeprecatedButton from 'components/core/Button/DeprecatedButton';
import styled from 'styled-components';
import { useState } from 'react';

const SpinnerButton = () => {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      loading={loading}
      onClick={() => {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      }}
    >
      spinner
    </Button>
  );
};

export default function DesignPage() {
  return (
    <>
      <Container>
        <Title>DeprecatedButton</Title>
        <Examples>
          <DeprecatedButton text="primary" />
          <DeprecatedButton text="primary" loading />
          <DeprecatedButton text="primary" loading mini />
          <DeprecatedButton text="primary" disabled />
          <DeprecatedButton text="primary" disabled loading />
          <DeprecatedButton text="primary" disabled loading mini />
        </Examples>
        <Examples>
          <DeprecatedButton text="secondary" type="secondary" />
          <DeprecatedButton text="secondary" type="secondary" loading />
          <DeprecatedButton text="secondary" type="secondary" loading mini />
          <DeprecatedButton text="secondary" type="secondary" disabled />
          <DeprecatedButton text="secondary" type="secondary" disabled loading />
          <DeprecatedButton text="secondary" type="secondary" disabled loading mini />
        </Examples>
      </Container>

      <Container>
        <Title>Button</Title>
        <Examples>
          <Button>primary</Button>
          <Button loading>primary</Button>
          <Button loading mini>
            primary
          </Button>
          <Button disabled>primary</Button>
          <Button disabled loading>
            primary
          </Button>
          <Button disabled loading mini>
            primary
          </Button>
        </Examples>
        <Examples>
          <Button variant="secondary">secondary</Button>
          <Button variant="secondary" loading>
            secondary
          </Button>
          <Button variant="secondary" loading mini>
            secondary
          </Button>
          <Button disabled variant="secondary">
            secondary
          </Button>
          <Button disabled variant="secondary" loading>
            secondary
          </Button>
          <Button disabled variant="secondary" loading mini>
            secondary
          </Button>
        </Examples>
        <Examples>
          <SpinnerButton />
        </Examples>
      </Container>
      <Container>
        <Title>ButtonLink</Title>
        <Examples>
          <ButtonLink href="#">primary</ButtonLink>
          <ButtonLink href="#" loading>
            primary
          </ButtonLink>
          <ButtonLink href="#" loading mini>
            primary
          </ButtonLink>
          <ButtonLink disabled href="#">
            primary
          </ButtonLink>
          <ButtonLink disabled href="#" loading>
            primary
          </ButtonLink>
          <ButtonLink disabled href="#" loading mini>
            primary
          </ButtonLink>
        </Examples>
        <Examples>
          <ButtonLink href="#" variant="secondary">
            secondary
          </ButtonLink>
          <ButtonLink href="#" variant="secondary" loading>
            secondary
          </ButtonLink>
          <ButtonLink href="#" variant="secondary" loading mini>
            secondary
          </ButtonLink>
          <ButtonLink disabled href="#" variant="secondary">
            secondary
          </ButtonLink>
          <ButtonLink disabled href="#" variant="secondary" loading>
            secondary
          </ButtonLink>
          <ButtonLink disabled href="#" variant="secondary" loading mini>
            secondary
          </ButtonLink>
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
