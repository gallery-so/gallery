// The sole purpose of this component is to wrap the OrganizeCollection step with the Collection Editor Context Provider
// so that the OrganizeCollection step can access the collection being edited

import CollectionEditorProvider from 'contexts/collectionEditor/CollectionEditorContext';
import { WizardContext } from 'react-albus';
import OrganizeCollection from './OrganizeCollection';

type Props = {
  step?: any;
};

function OrganizeCollectionWrapper({ next }: WizardContext & Props) {
  return (
    <CollectionEditorProvider>
      <OrganizeCollection next={next} />
    </CollectionEditorProvider>
  );
}

export default OrganizeCollectionWrapper;
