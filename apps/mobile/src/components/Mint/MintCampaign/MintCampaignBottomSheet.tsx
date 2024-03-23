import { useState } from 'react';

import MintCampaignPostTransaction from './MintCampaignPostTransaction';
import MintCampaignPreTransaction from './MintCampaignPreTransaction';

export default function MintCampaignBottomSheet({ onClose }: { onClose: () => void }) {
  // the identifer used to poll for the status of the mint
  // 2dz4BJiicd3tvo7RtH66okiklHU
  // Once we kick off the mint the backend returns a claim code from Highlight that we can use to check the status of the mint
  const [claimCode, setClaimCode] = useState<string | null>();

  if (claimCode) {
    return <MintCampaignPostTransaction claimCode={claimCode} onClose={onClose} />;
  }

  return <MintCampaignPreTransaction setClaimCode={setClaimCode} />;
}
