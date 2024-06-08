import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/hono";
import { InferRequestType, InferResponseType } from "hono";

// Define the response and request types
type ResponseType = InferResponseType<typeof client.api.accounts[":id"]["budget"]["$patch"]>;
type RequestType = { budget: number };

// Create the useSetBudget hook
export const useSetBudget = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      if (!id) throw new Error("ID is required");
      const response = await client.api.accounts[":id"]["budget"]["$patch"]({ json, param: { id } });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Budget updated successfully");
      queryClient.invalidateQueries({ queryKey: ["account", { id }] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: () => {
      toast.error("Failed to update budget");
    },
  });

  return mutation;
};
