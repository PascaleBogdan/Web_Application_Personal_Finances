import { z } from "zod";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { inseartAccountSchema } from "@/db/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = inseartAccountSchema.pick({
    name: true,
    budget: true,
}).extend({
    name: z.string().nonempty("Name is required"), // Ensure name is required
    budget: z.union([z.number().positive("Budget must be a positive number").nullable(), z.null()]), // Allow budget to be a positive number or null
});

type FormValues = z.input<typeof formSchema>;

type Props = {
    id?: string;
    defaultValues?: FormValues;
    onSubmit: (values: FormValues) => void;
    onDelete?: () => void;
    disabled?: boolean;
};

export const AccountForm = ({
    id,
    defaultValues,
    onSubmit,
    onDelete,
    disabled,
}: Props) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: defaultValues?.name || "",
            budget: null, // Initialize budget as null to keep the input empty
        },
    });

    const handleSubmit = (values: FormValues) => {
        onSubmit(values);
    }

    const handleDelete = () => {
        onDelete?.();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
            <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={disabled}
                                    placeholder="e.g. Credit Card, Cash, Bank"
                                    {...field}
                                />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
          <FormField
                    name="budget"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Budget</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    disabled={disabled}
                                    placeholder="Enter budget"
                                    {...field}
                                    value={field.value === null ? '' : field.value} // Ensure the input is empty if value is null
                                    onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button className="w-full" disabled={disabled}>
                    {id ? "Save changes" : "Create account"}
                </Button>
                {!!id && (
                    <Button
                        type="button"
                        disabled={disabled}
                        onClick={handleDelete}
                        className="w-full"
                        variant="outline"
                    >
                        <Trash className="size-4 mr-2" />
                        Delete account
                    </Button>
                )}
            </form>
        </Form>
    );
};
