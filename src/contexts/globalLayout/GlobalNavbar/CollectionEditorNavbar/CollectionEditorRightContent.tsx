import { Button } from 'components/core/Button/Button';

type Props = {
  onDone: () => void;
  isCollectionValid: boolean;
};

export function CollectionEditorRightContent({ isCollectionValid, onDone }: Props) {
  return (
    <Button disabled={!isCollectionValid} onClick={onDone}>
      Done
    </Button>
  );
}
