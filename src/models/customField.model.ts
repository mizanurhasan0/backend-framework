import mongoose from "mongoose";

const customFieldSchema = new mongoose.Schema({
    name: { type: String, required: true },
    fieldType: { type: String, required: true },
    options: [String],
    required: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
});
customFieldSchema.methods.toJSON = function () {
    return JSON.parse(JSON.stringify(this.toObject()).replace(/_id/g, 'id'));
};
export const CustomField = mongoose.model("CustomField", customFieldSchema);
