import styled from 'styled-components';
import { isEditModeToken, StagingItem } from '../../types';
import SortableStagedNft from '../SortableStagedNft';
import SortableStagedWhitespace from '../SortableStagedWhitespace';
import { Section } from './Section';
import { SortableStagedNftFragment$key } from '../../../../../../__generated__/SortableStagedNftFragment.graphql';

type Props = {
  items: StagingItem[];
  itemWidth: number;
  columns: number;
  nftFragmentsKeyedByID: { [id: string]: SortableStagedNftFragment$key };
};

export default function SectionDragging({
  items,
  itemWidth,
  columns,
  nftFragmentsKeyedByID,
}: Props) {
  return (
    <StyledDraggingWrapper>
      <Section isDragging isEmpty={items.length === 0} columns={columns}>
        {items.map((item) => {
          const size = itemWidth;
          const stagedItemRef = nftFragmentsKeyedByID[item.id];
          if (isEditModeToken(item) && stagedItemRef) {
            return (
              <SortableStagedNft
                key={item.id}
                tokenRef={stagedItemRef}
                size={size}
                mini={columns > 4}
              />
            );
          }
          return <SortableStagedWhitespace key={item.id} id={item.id} size={size} />;
        })}
      </Section>
    </StyledDraggingWrapper>
  );
}

const StyledDraggingWrapper = styled.div`
  box-shadow: 0px 0px 16px 4px rgb(0 0 0 / 34%);
`;
