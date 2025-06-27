import { isValidObjectId } from "mongoose";
import { z } from "zod";

const objectId = z.string().refine((val) => isValidObjectId(val), { message: "Invalid ObjectId" });

export const CheckCategory = z.object({
    name: z.string().min(1, { message: "Name is required!" }).transform((val) => val.toLowerCase()),
    parentId: objectId.optional(),
    ancestors: z.array(objectId).optional(),
    productCount: z.number().nonnegative().optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
    order: z.number().nonnegative().optional(),
    slug: z.string().optional(),
    level: z.number().nonnegative().optional(),
    path: z.string().optional(),
    childrenCount: z.number().nonnegative().optional(),
    children: z.array(objectId).optional(),
})