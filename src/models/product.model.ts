import mongoose, { mongo } from "mongoose";


const productSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true },
    description: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    sale_price: { type: Number, default: null },
    temp_price: { type: Number, default: null },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    thumbnail: { type: String, required: true },
    images: [{ type: String }],
    stock: { type: Number, required: true, default: 0 },
    status: { type: String, required: true },
    max_per_order: { type: Number, default: null },
    barcode: { type: String, default: null },
    free_shipping: { type: Boolean, default: false },
    is_new: { type: Boolean, default: false },
    customFields: [{ fieldId: { type: mongoose.Schema.Types.ObjectId, ref: "CustomField" }, value: mongoose.Schema.Types.Mixed }],
}, {
    timestamps: true
});
productSchema.methods.toJSON = function () {
    return JSON.parse(JSON.stringify(this.toObject()).replace(/_id/g, 'id'));
};
const Product = mongoose.model("Product", productSchema);