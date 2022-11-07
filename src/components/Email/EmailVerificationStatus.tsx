import { useCallback, useMemo } from 'react';

import AlertTriangleIcon from '~/icons/AlertTriangleIcon';
import CircleCheckIcon from '~/icons/CircleCheckIcon';
import ClockIcon from '~/icons/ClockIcon';

import { Button } from '../core/Button/Button';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM, BaseS } from '../core/Text/Text';

const UNVERIFIED = Symbol('UNVERIFIED');
const VERIFIED = Symbol('VERIFIED');
const FAILED = Symbol('FAILED');
const ADMIN = Symbol('ADMIN');

type Props = {
  savedEmail: string;
  setIsEditMode: (editMode: boolean) => void;
};

// can we use graphql enum for this
type VerificationStatus = typeof UNVERIFIED | typeof VERIFIED | typeof FAILED | typeof ADMIN;

function EmailVerificationStatus({ setIsEditMode, savedEmail }: Props) {
  const handleEditClick = useCallback(() => {
    setIsEditMode(true);
  }, [setIsEditMode]);

  const verificationStatus = UNVERIFIED;

  const verificationStatusIndicator = useMemo(() => {
    switch (verificationStatus) {
      case UNVERIFIED:
        return (
          <>
            <ClockIcon />
            <BaseS>Pending verification</BaseS>
          </>
        );
      case VERIFIED:
        return (
          <>
            <CircleCheckIcon />
            <BaseS>Verified</BaseS>
          </>
        );
      case FAILED:
        return (
          <>
            <AlertTriangleIcon />
            <BaseS>Could not verify.</BaseS>
          </>
        );
    }
  }, [verificationStatus]);
  return (
    <HStack justify="space-between">
      <VStack>
        <BaseM>{savedEmail}</BaseM>
        <HStack gap={4}>{verificationStatusIndicator}</HStack>
      </VStack>
      <Button variant="secondary" onClick={handleEditClick}>
        EDIT
      </Button>
    </HStack>
  );
}

export default EmailVerificationStatus;
