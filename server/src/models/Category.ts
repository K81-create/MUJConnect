import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    icon: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
});

export const Category = mongoose.model('Category', CategorySchema);
