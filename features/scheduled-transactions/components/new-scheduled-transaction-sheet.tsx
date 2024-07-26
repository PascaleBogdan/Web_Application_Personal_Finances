import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useNewScheduledTransaction } from "@/features/scheduled-transactions/hooks/use-new-scheduled-transactions";
import { insertScheduledTransactionSchema } from "@/db/schema";
import { z } from "zod";
import { useCreateScheduledTransaction } from "../api/use-created-scheduled-transactions";
import { useCreateCategory } from "@/features/categories/api/use-create-category";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useCreateAccount } from "@/features/accounts/api/use-create-account";
import { ScheduledTransactionForm } from "./scheduled-transaction-from";
import { Loader2 } from "lucide-react";

const formSchema = insertScheduledTransactionSchema.omit({
  id: true,
});
type FormValues = z.input<typeof formSchema>;

export const NewScheduledTransactionSheet = () => {
  const { isOpen, onClose } = useNewScheduledTransaction();
  const createMutation = useCreateScheduledTransaction();

  const categoryQuery = useGetCategories();
  const categoryMutation = useCreateCategory();
  const onCreateCategory = (name: string) =>
    categoryMutation.mutate({
      name,
    });
  const categoryOptions = (categoryQuery.data ?? []).map((category) => ({
    label: category.name,
    value: category.id,
  }));

  const accountQuery = useGetAccounts();
  const accountMutation = useCreateAccount();
  const onCreateAccount = (name: string) =>
    accountMutation.mutate({
      name,
    });
  const accountOptions = (accountQuery.data ?? []).map((account) => ({
    label: account.name,
    value: account.id,
  }));

  const isPending =
    createMutation.isPending ||
    categoryMutation.isPending ||
    accountMutation.isPending;

  const isLoading = categoryQuery.isLoading || accountQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    console.log("Submitting values:", values);
    createMutation.mutate(values, {
      onSuccess: () => {
        onClose();
      },
      onError: (error) => {
        console.error("Error creating scheduled transaction:", error);
      },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>New Scheduled Transaction</SheetTitle>
          <SheetDescription>Add a new scheduled transaction.</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <ScheduledTransactionForm
            onSubmit={onSubmit}
            disabled={isPending}
            categoryOptions={categoryOptions}
            onCreateCategory={onCreateCategory}
            accountOptions={accountOptions}
            onCreateAccount={onCreateAccount}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
