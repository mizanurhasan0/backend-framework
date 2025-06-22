import mongoose, { Types } from "mongoose";


const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    parentId: { ref: "Category", type: Types.ObjectId, default: null },
    ancestors: [{
        ref: "Category", type: Types.ObjectId, default: null,
    }],
    productCount: {
        type: Number, default: 0,
    },
}, { timestamps: true });

export const category = mongoose.model("Category", categorySchema);