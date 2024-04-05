import { MCHX_CLAIM_CODE_KEY } from 'src/constants/storageKeys';
import usePersistedState from 'src/hooks/usePersistedState';

import MintCampaignPostTransaction from './MintCampaignPostTransaction';
import MintCampaignPreTransaction from './MintCampaignPreTransaction';

export default function MintCampaignBottomSheet({ onClose }: { onClose: () => void }) {
  // claimCode is the identifer used to poll for the status of the mint
  // Once we kick off the mint, the backend returns a claim code from Highlight that we can use to check the status of the mint

  const [claimCode, setClaimCode] = usePersistedState(MCHX_CLAIM_CODE_KEY, '');

  if (claimCode) {
    return <MintCampaignPostTransaction claimCode={claimCode} onClose={onClose} />;
  }

  return <MintCampaignPreTransaction setClaimCode={setClaimCode} />;
}
