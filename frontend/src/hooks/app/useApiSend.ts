import {QueryKey, useMutation, UseMutationOptions, useQueryClient,} from "@tanstack/react-query";

type UseApiSendOptions<TData, TError, TVariables = void, TContext = unknown> =
    UseMutationOptions<TData, TError, TVariables, TContext>;

export const useApiSend = <
    TData = unknown,
    TError = unknown,
    TVariables = void,
    TContext = unknown
>(
    fn: (variables: TVariables) => Promise<TData>,
    success?: (data: TData) => void,
    error?: (error: TError) => void,
    invalidateKey?: QueryKey[],
    options?: UseApiSendOptions<TData, TError, TVariables, TContext>
) => {
    const queryClient = useQueryClient();

    return useMutation<TData, TError, TVariables, TContext>({
        mutationFn: fn,
        onSuccess: (data: TData) => {
            invalidateKey?.forEach((key) => {
                queryClient.invalidateQueries({queryKey: key})
            });
            success && success(data);
        },
        onError: error,
        retry: 1,
        ...options,
    });
};