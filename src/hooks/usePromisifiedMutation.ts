import { GraphQLTaggedNode, useMutation, UseMutationConfig } from 'react-relay';
import { useCallback } from 'react';
import { MutationParameters } from 'relay-runtime';

export const usePromisifiedMutation = <T extends MutationParameters>(
  mutation: GraphQLTaggedNode
): [
  (config: Omit<UseMutationConfig<T>, 'onError' | 'onCompleted'>) => Promise<T['response']>,
  boolean
] => {
  const [mutate, isMutating] = useMutation(mutation);

  const promisifiedMutate = useCallback(
    async (config: Omit<UseMutationConfig<T>, 'onError' | 'onCompleted'>) =>
      new Promise<T['response']>((resolve, reject) => {
        mutate({
          ...config,
          onCompleted: (response) => {
            resolve(response);
          },
          onError: (error) => {
            reject(error);
          },
        });
      }),
    [mutate]
  );

  return [promisifiedMutate, isMutating];
};
