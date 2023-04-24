import React, { useMemo, useState } from 'react';
import styled from 'styled-components';

import { Button, ButtonLink } from '~/components/core/Button/Button';
import colors from '~/shared/theme/colors';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleM } from '~/components/core/Text/Text';
import icons from '~/icons/index';

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
  const sortedIcons = useMemo(() => {
    const sortedKeys = Object.keys(icons).sort();
    return sortedKeys.reduce((acc: Record<string, () => JSX.Element>, key) => {
      // @ts-expect-error icons[key] will not be undefined
      acc[key] = icons[key];
      return acc;
    }, {});
  }, []);

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
          <ButtonLink href={{ pathname: '/' }}>primary</ButtonLink>
          <ButtonLink href={{ pathname: '/' }} pending>
            primary
          </ButtonLink>
          <ButtonLink disabled href={{ pathname: '/' }}>
            primary
          </ButtonLink>
          <ButtonLink disabled href={{ pathname: '/' }} pending>
            primary
          </ButtonLink>
        </Examples>
        <Examples>
          <ButtonLink href={{ pathname: '/' }} variant="secondary">
            secondary
          </ButtonLink>
          <ButtonLink href={{ pathname: '/' }} variant="secondary" pending>
            secondary
          </ButtonLink>
          <ButtonLink disabled href={{ pathname: '/' }} variant="secondary">
            secondary
          </ButtonLink>
          <ButtonLink disabled href={{ pathname: '/' }} variant="secondary" pending>
            secondary
          </ButtonLink>
        </Examples>
      </Section>
      <Section>
        <TitleM>Icons</TitleM>
        <Examples wrap="wrap">
          {Object.keys(sortedIcons).map((iconKey) => {
            const Icon = icons[iconKey];

            if (Icon) {
              return (
                <IconContainer key={iconKey} align="center" justify="center" gap={8}>
                  <Icon />
                  <BaseM color={colors.shadow}>{iconKey}</BaseM>
                </IconContainer>
              );
            }
          })}
        </Examples>
      </Section>
    </>
  );
}

const Section = styled(VStack)`
  padding: 2rem;
  gap: 16px;
  width: 100vw;
`;

const Examples = styled(HStack)`
  gap: 8px;
  width: 100%;
`;

const IconContainer = styled(HStack)`
  border: 1px solid ${colors.porcelain};
  border-radius: 8px;
  color: ${colors.porcelain};
  padding: 4px 8px;
  height: 48px;
`;
