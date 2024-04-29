import { useMemo } from 'react';
import usePersistedState from 'src/hooks/usePersistedState';

import { useSanityDataContext } from '~/contexts/SanityDataContext';

import MintCampaignPostTransaction from './MintCampaignPostTransaction';
import MintCampaignPreTransaction from './MintCampaignPreTransaction';

type Props = {
  onClose?: () => void;
  projectInternalId?: string;
};

export default function MintCampaignBottomSheet({ onClose, projectInternalId }: Props) {
  // claimCode is the identifer used to poll for the status of the mint
  // Once we kick off the mint, the backend returns a claim code from Highlight that we can use to check the status of the mint

  const [claimCode, setClaimCode] = usePersistedState(`${projectInternalId}_claim_code`, '');

  const { data } = useSanityDataContext();
  const projectData = useMemo(() => {
    return data?.mintProjects.find((document) => document.internalId === projectInternalId);
  }, [data, projectInternalId]);
  console.log({ projectData });

  if (!projectData) {
    // TODO decide best way to handle missing data
    return null;
  }

  if (claimCode) {
    return (
      <MintCampaignPostTransaction
        claimCode={claimCode}
        onClose={onClose}
        projectData={projectData}
      />
    );
  }

  return (
    <MintCampaignPreTransaction
      setClaimCode={setClaimCode}
      projectInternalId={projectInternalId}
      projectData={projectData}
    />
  );
}
