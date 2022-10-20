import { BackButton } from 'contexts/globalLayout/GlobalNavbar/BackButton';

type Props = {
  onCancel: () => void;
};

export function CollectionEditorLeftContent({ onCancel }: Props) {
  return <BackButton onClick={onCancel} />;
}
