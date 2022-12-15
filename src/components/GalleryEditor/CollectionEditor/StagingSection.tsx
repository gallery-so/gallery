import { useCallback, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import { VStack } from '~/components/core/Spacer/Stack';
import StagedNftImage from '~/components/GalleryEditor/CollectionEditor/StagedNftImage';
import { Toolbar } from '~/components/GalleryEditor/CollectionEditor/Toolbar/Toolbar';
import { StagingSectionFragment$key } from '~/generated/StagingSectionFragment.graphql';

type Props = {
  tokenRefs: StagingSectionFragment$key;
};

export default function StagingSection({ tokenRefs }: Props) {
  const tokens = useFragment(
    graphql`
      fragment StagingSectionFragment on Token @relay(plural: true) {
        dbid

        ...StagedNftImageNewFragment
      }
    `,
    tokenRefs
  );

  const [columns, setColumns] = useState(1);

  const handleIncrement = useCallback(() => {
    setColumns((previous) => previous + 1);
  }, []);

  const handleDecrement = useCallback(() => {
    setColumns((previous) => previous - 1);
  }, []);

  return (
    <SectionContainer gap={2}>
      <Toolbar onDecrement={handleDecrement} onIncrement={handleIncrement} />

      <StagedGrid columns={columns}>
        {tokens.map((token) => {
          return <StagedNftImage key={token.dbid} tokenRef={token} hideLabel={false} />;
        })}
      </StagedGrid>
    </SectionContainer>
  );
}

const StagedGrid = styled.div<{ columns: number }>`
  width: 100%;
  display: grid;
  place-content: center;
  gap: 32px 16px;
  grid-template-columns: repeat(${({ columns }) => columns}, max(400px));
`;

const SectionContainer = styled(VStack)`
  width: 100%;
  margin: 0 56px;
  align-self: flex-start;

  border: 1px solid ${colors.hyperBlue};

  padding-bottom: 30px;
`;
