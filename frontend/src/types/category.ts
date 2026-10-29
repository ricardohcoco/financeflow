import type { TransactionType } from "./transaction";

export type Category = {
    id: number;
    name: string;
    type: TransactionType;
};