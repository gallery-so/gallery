import { Button, ButtonLink } from 'components/core/Button/Button';
import styled from 'styled-components';
import React, { useState } from 'react';
import { TitleM } from 'components/core/Text/Text';

const PendingButton = (props: React.ComponentProps<typeof Button>) => {
  const [pending, setPending] = useState(false);
  return (
    <Button
      pending={pending}
      onClick={() => {
        setPending(true);
        setTimeout(() => {
          setPending(false);
        }, 2000);
      }}
      {...props}
    >
      pending
    </Button>
  );
};

export default function DesignPage() {
  return (
    <>
      <Section>
        <TitleM>Button</TitleM>
        <Examples>
          <Button>primary</Button>
          <Button pending>primary</Button>
          <Button disabled>primary</Button>
          <Button disabled pending>
            primary
          </Button>
        </Examples>
        <Examples>
          <Button variant="secondary">secondary</Button>
          <Button variant="secondary" pending>
            secondary
          </Button>
          <Button disabled variant="secondary">
            secondary
          </Button>
          <Button disabled variant="secondary" pending>
            secondary
          </Button>
        </Examples>
        <Examples>
          <PendingButton />
          <PendingButton variant="secondary" />
        </Examples>
      </Section>

      <Section>
        <TitleM>ButtonLink</TitleM>
        <Examples>
          <ButtonLink href="#">primary</ButtonLink>
          <ButtonLink href="#" pending>
            primary
          </ButtonLink>
          <ButtonLink disabled href="#">
            primary
          </ButtonLink>
          <ButtonLink disabled href="#" pending>
            primary
          </ButtonLink>
        </Examples>
        <Examples>
          <ButtonLink href="#" variant="secondary">
            secondary
          </ButtonLink>
          <ButtonLink href="#" variant="secondary" pending>
            secondary
          </ButtonLink>
          <ButtonLink disabled href="#" variant="secondary">
            secondary
          </ButtonLink>
          <ButtonLink disabled href="#" variant="secondary" pending>
            secondary
          </ButtonLink>
        </Examples>
      </Section>
    </>
  );
}

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
`;

const Examples = styled.div`
  display: flex;
  gap: 0.5rem;
`;
