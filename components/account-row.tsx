import { useOpenAccount } from "@/features/accounts/hooks/use-open-account";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

type AccountRowProps = {
    id: string;
    name: string;
    budget: number | null; // Allow budget to be number or null
};

export const AccountRow = ({ id, name, budget }: AccountRowProps) => {
    const { onOpen } = useOpenAccount();

    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex-1">
                <h3 className="text-lg font-medium">{name}</h3>
                <p
                    className={`text-sm ${
                        budget !== null && budget >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                >
                    Budget: ${budget !== null ? budget : "N/A"}
                </p>
            </div>
            <Button variant="ghost" className="size-8 p-0" onClick={() => onOpen(id)}>
                <MoreHorizontal className="size-4" />
            </Button>
        </div>
    );
};
