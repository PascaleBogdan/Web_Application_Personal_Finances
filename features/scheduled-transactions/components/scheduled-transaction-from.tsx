import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DatePicker } from "@/components/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/select";
import { AmountInput } from "@/components/amount-input";
import { convertAmountToMiliunits } from "@/lib/utils";
import { insertScheduledTransactionSchema } from "@/db/schema";

const formSchema = z.object({
    date: z.coerce.date(),
    accountId: z.string(),
    categoryId: z.string().nullable().optional(),
    payee: z.string(),
    amount: z.string(),
    notes: z.string().nullable().optional(),
    scheduledDate: z.coerce.date(),
    repeatInterval: z.number().nullable().optional(),
});

type FormValues = z.input<typeof formSchema>;
type ApiFormValues = {
    amount: number;
    payee: string;
    userId: string;
    accountId: string;
    scheduledDate: Date;
    notes?: string | null;
    categoryId?: string | null;
    repeatInterval?: number | null;
};

type Props = {
    onSubmit: (values: ApiFormValues) => void;
    disabled?: boolean;
    accountOptions: { label: string; value: string }[];
    categoryOptions: { label: string; value: string }[];
    onCreateAccount: (name: string) => void;
    onCreateCategory: (name: string) => void;
};

export const ScheduledTransactionForm = ({
    onSubmit,
    disabled,
    accountOptions,
    categoryOptions,
    onCreateAccount,
    onCreateCategory,
}: Props) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date(),
            scheduledDate: new Date(),
        },
    });

    const handleSubmit = (values: FormValues) => {
        console.log("Form Values on Submit:", values); // Add this line
        const amount = parseFloat(values.amount);
        const amountInMiliunits = convertAmountToMiliunits(amount);
        onSubmit({
            accountId: values.accountId,
            amount: amountInMiliunits,
            payee: values.payee,
            scheduledDate: values.scheduledDate,
            userId: "", // Replace with a valid userId if available
            notes: values.notes ?? null,
            categoryId: values.categoryId ?? null,
            repeatInterval: values.repeatInterval ?? null,
        });
    };
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">

                <FormField
                    name="accountId"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Account</FormLabel>
                            <FormControl>
                                <Select
                                    placeholder="Select an account"
                                    options={accountOptions}
                                    onCreate={onCreateAccount}
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={disabled}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    name="categoryId"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                                <Select
                                    placeholder="Select a category"
                                    options={categoryOptions}
                                    onCreate={onCreateCategory}
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={disabled}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    name="payee"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Payee</FormLabel>
                            <FormControl>
                                <Input disabled={disabled} placeholder="Add a payee" {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    name="amount"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                                <AmountInput {...field} disabled={disabled} placeholder="0.00" />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    name="scheduledDate"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Scheduled Date</FormLabel>
                            <FormControl>
                                <DatePicker value={field.value} onChange={field.onChange} disabled={disabled} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                    <FormField
                        name="repeatInterval"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Repeat Interval (days)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="Enter number of days"
                                        value={field.value ?? ""}
                                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : null)} // Ensure correct type
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        ref={field.ref}
                                        disabled={disabled}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                <FormField
                    name="notes"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    value={field.value ?? ""}
                                    disabled={disabled}
                                    placeholder="Optional notes"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button className="w-full" disabled={disabled}>
                    Create Scheduled Transaction
                </Button>
            </form>
        </Form>
    );
};
