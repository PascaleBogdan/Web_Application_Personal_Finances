import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AccountForm } from "@/features/accounts/components/account-form";
import { inseartAccountSchema } from "@/db/schema";
import { z } from "zod";
import { useOpenAccount } from "@/features/accounts/hooks/use-open-account";
import { useGetAccount } from "../api/use-get-account";
import { Loader2 } from "lucide-react";
import { useEditAccount } from "@/features/accounts/api/use-edit-account";
import { useDeleteAccount } from "@/features/accounts/api/use-delete-account";
import { useConfirm } from "@/hooks/use-confim";

// Update the form schema to include the budget field
export const formSchema = inseartAccountSchema.pick({
    name: true,
    budget: true, // Add budget field
});

export type FormValues = z.input<typeof formSchema>;

type EditAccountSheetProps = {
    isBudgetMode?: boolean; // Add prop to distinguish between name edit and budget edit modes
};

export const EditAccountSheet = ({ isBudgetMode }: EditAccountSheetProps) => {
    const { isOpen, onClose, id } = useOpenAccount();
    const accountQuery = useGetAccount(id);
    const editMutation = useEditAccount(id);
    const deleteMutation = useDeleteAccount(id);
    const [ConfirmDialog, confirm] = useConfirm(
        "Are you sure?",
        "You are about to delete this account."
    );
    const isLoading = accountQuery.isLoading;
    const isPending = editMutation.isPending || deleteMutation.isPending;

    const onSubmit = (values: FormValues) => {
        editMutation.mutate(values, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    const onDelete = async () => {
        const ok = await confirm();

        if (ok) {
            deleteMutation.mutate(undefined, {
                onSuccess: () => {
                    onClose();
                }
            });
        }
    };

    const defaultValues = accountQuery.data ? {
        name: accountQuery.data.name,
        budget: accountQuery.data.budget ?? 0, // Ensure budget is always a number
    } : {
        name: "",
        budget: 0, // Default value for budget
    };

    return (
        <>
            <ConfirmDialog />
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent className="space-y-4">
                    <SheetHeader>
                        <SheetTitle>
                            {isBudgetMode ? "Set Budget" : "Edit Account"}
                        </SheetTitle>
                        <SheetDescription>
                            {isBudgetMode ? "Set a budget for this account." : "Edit an existing account."}
                        </SheetDescription>
                    </SheetHeader>
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="size-4 text-muted-foreground animate-spin" />
                        </div>
                    ) : (
                        <AccountForm
                            id={id}
                            onSubmit={onSubmit}
                            disabled={isPending}
                            defaultValues={defaultValues}
                            onDelete={onDelete}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
};
