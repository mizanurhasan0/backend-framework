import { Types } from "mongoose";

export interface TCategory {
    name: string;
    slug?: string;
    description?: string;
    parentId?: Types.ObjectId | string;
    ancestors?: (Types.ObjectId | string)[];
    level?: number;
    path?: string;
    isActive?: boolean;
    productCount?: number;
    childrenCount?: number;
    order?: number;
}