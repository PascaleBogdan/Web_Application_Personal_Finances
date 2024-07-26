import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  typeof client.api.scheduledTransactions.$get
>;
type RequestType = InferRequestType<
  typeof client.api.scheduledTransactions.$get
>;

export const useCreateScheduledTransaction = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    // @ts-ignore
    mutationFn: async (json) => {
      const response = await client.api.scheduledTransactions.$post({
        // @ts-ignore
        json,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Scheduled transaction created");
      queryClient.invalidateQueries({ queryKey: ["scheduled-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: () => {
      toast.error("Failed to create scheduled transaction");
    },
  });

  return mutation;
};
