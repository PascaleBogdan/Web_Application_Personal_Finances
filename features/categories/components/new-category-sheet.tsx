import {Sheet,SheetContent,SheetDescription,SheetHeader,SheetTitle} from "@/components/ui/sheet"
import { useNewCategory } from "@/features/categories/hooks/use-new-category";
import { CategoryForm } from "@/features/categories/components/category-form";
import { inseartCategoriesSchema } from "@/db/schema";
import { z } from "zod";
import { useCreateCategory } from "@/features/categories/api/use-create-category";

    const formSchema = inseartCategoriesSchema .pick({
        name: true,
    });
    type FormValues = z.input<typeof formSchema>;

    export const NewCategorySheet = () => {
        const { isOpen, onClose} = useNewCategory();

        const mutation = useCreateCategory();

        const onSubmit = (values:FormValues) => {
            mutation.mutate(values,{
                onSuccess:() =>{
                    onClose();
                },
            });
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="space-y-4">
                <SheetHeader>
                    <SheetTitle>
                        New Category
                    </SheetTitle>
                    <SheetDescription>
                        Create a new category
                    </SheetDescription>
                </SheetHeader>
                <CategoryForm 
                onSubmit={onSubmit}
                disabled={mutation.isPending} 
                defaultValues={{name:"",}}
                 />
            </SheetContent>
        </Sheet>
    );
} ;