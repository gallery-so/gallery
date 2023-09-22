import { PropsWithChildren, useMemo } from 'react';
import { Text, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { ErrorIcon } from 'src/icons/ErrorIcon';

import { TokenFailureFallbacksErrorFallbackFragment$key } from '~/generated/TokenFailureFallbacksErrorFallbackFragment.graphql';
import { TokenFailureFallbacksLoadingFallbackFragment$key } from '~/generated/TokenFailureFallbacksLoadingFallbackFragment.graphql';

export type FallbackProps = {
  fallbackAspectSquare?: boolean;
  variant?: 'tiny' | 'small' | 'medium' | 'large';
};

export function FallbackWrapper({
  children,
  fallbackAspectSquare,
}: PropsWithChildren<FallbackProps>) {
  const inner = useMemo(
    () => (
      <View className="w-full h-full bg-porcelain dark:bg-black-800 flex items-center justify-center text-center truncate p-1">
        {children}
      </View>
    ),
    [children]
  );

  if (fallbackAspectSquare) {
    return <View className="aspect-square">{inner}</View>;
  }

  return inner;
}

// TODO:
// - use refresh icon instead, and fetch new asset
// - check dark mode
export function TokenPreviewErrorFallback({
  tokenRef,
  variant,
}: {
  tokenRef: TokenFailureFallbacksErrorFallbackFragment$key;
} & FallbackProps) {
  const token = useFragment(
    graphql`
      fragment TokenFailureFallbacksErrorFallbackFragment on Token {
        tokenId
        contract {
          name
        }
      }
    `,
    tokenRef
  );

  return (
    <>
      <Text
        className={`text-${variantToTextSize(variant)} text-metal text-center`}
        numberOfLines={2}
      >
        {token.contract?.name ?? token.tokenId}
      </Text>
      {variant === 'tiny' ? null : (
        <View className="p-1">
          <ErrorIcon />
        </View>
      )}
    </>
  );
}

// TODO:
// - check dark mode
export function TokenPreviewLoadingFallback({
  tokenRef,
  variant,
}: {
  tokenRef: TokenFailureFallbacksLoadingFallbackFragment$key;
} & FallbackProps) {
  const token = useFragment(
    graphql`
      fragment TokenFailureFallbacksLoadingFallbackFragment on Token {
        tokenId
        contract {
          name
        }
      }
    `,
    tokenRef
  );

  return (
    <>
      <Text
        className={`text-${variantToTextSize(variant)} text-metal text-center`}
        numberOfLines={2}
      >
        {token.contract?.name ?? token.tokenId}
      </Text>
      {variant === 'tiny' ? null : (
        <Text className={`text-${variantToSubtextSize(variant)} text-metal`}>(processing)</Text>
      )}
    </>
  );
}

function variantToTextSize(variant: FallbackProps['variant'] = 'tiny') {
  return {
    tiny: 'xs',
    small: 'xs',
    medium: 'sm',
    large: 'base',
  }[variant];
}

function variantToSubtextSize(variant: FallbackProps['variant'] = 'tiny') {
  return {
    tiny: 'xxs',
    small: 'xxs',
    medium: 'xs',
    large: 'xs',
  }[variant];
}