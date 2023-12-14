import { PropsWithChildren, useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { ErrorIcon } from 'src/icons/ErrorIcon';
import { RefreshIcon } from 'src/icons/RefreshIcon';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { useTokenStateManagerContext } from '~/contexts/TokenStateManagerContext';
import { TokenFailureFallbacksErrorFallbackFragment$key } from '~/generated/TokenFailureFallbacksErrorFallbackFragment.graphql';
import { TokenFailureFallbacksLoadingFallbackFragment$key } from '~/generated/TokenFailureFallbacksLoadingFallbackFragment.graphql';
import { contexts } from '~/shared/analytics/constants';

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

type ErrorFallbackProps = {
  refreshable?: boolean;
};

// TODO:
// - use refresh icon instead, and fetch new asset
// - check dark mode
export function TokenPreviewErrorFallback({
  tokenRef,
  variant,
  refreshable = true,
}: {
  tokenRef: TokenFailureFallbacksErrorFallbackFragment$key;
} & FallbackProps &
  ErrorFallbackProps) {
  const token = useFragment(
    graphql`
      fragment TokenFailureFallbacksErrorFallbackFragment on Token {
        dbid
        definition {
          tokenId
          community {
            name
          }
        }
      }
    `,
    tokenRef
  );

  const { refreshToken, getTokenState } = useTokenStateManagerContext();
  const isRefreshing = useMemo(() => {
    return getTokenState(token.dbid ?? '')?.refreshingMetadata;
  }, [getTokenState, token.dbid]);

  const handlePress = useCallback(() => {
    if (isRefreshing || !refreshable) {
      return;
    }
    refreshToken(token.dbid);
  }, [isRefreshing, refreshToken, refreshable, token.dbid]);

  return (
    <GalleryTouchableOpacity
      className="w-full h-full flex items-center justify-center"
      onPress={handlePress}
      eventElementId="Refresh Broken Token Button"
      eventName="Refresh Broken Token Pressed"
      eventContext={contexts.Error}
      activeOpacity={refreshable ? 0.2 : 1}
    >
      <Text
        className={`text-${variantToTextSize(variant)} text-metal text-center`}
        numberOfLines={2}
      >
        {token.definition?.community?.name ?? token.definition?.tokenId}
      </Text>
      {variant === 'tiny' ? null : (
        <View className="p-1">{refreshable ? <RefreshIcon /> : <ErrorIcon />}</View>
      )}
    </GalleryTouchableOpacity>
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
