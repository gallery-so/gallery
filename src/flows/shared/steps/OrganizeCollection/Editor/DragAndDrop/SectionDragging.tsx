import { isEditModeToken } from '../../types';
import SortableStagedNft from '../SortableStagedNft';
import SortableStagedWhitespace from '../SortableStagedWhitespace';
import { Section } from './Section';

type Props = {
  items: any;
  itemWidth: any;
  columns: number;
  nftFragmentsKeyedByID: any;
  label: string;
};

export default function SectionDragging({
  items,
  itemWidth,
  columns,
  nftFragmentsKeyedByID,
  label,
}: Props) {
  return (
    <Section label={label} isDragging isEmpty={items.length === 0}>
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
  );
}
