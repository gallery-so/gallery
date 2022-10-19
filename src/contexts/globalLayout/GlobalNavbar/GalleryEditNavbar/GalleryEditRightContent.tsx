import { Button } from 'components/core/Button/Button';

type Props = {
  onDone: () => void;
};

export function GalleryEditRightContent({ onDone }: Props) {
  return <Button onClick={onDone}>Done</Button>;
}
