import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRecipe extends Document {
  title: string;
  description?: string;
  ingredients: string;
  instructions: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  image_url?: string;
  user_id: Types.ObjectId | string; 
  is_public: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RecipeSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  ingredients: {
    type: String,
    required: [true, 'Ingredients are required'],
  },
  instructions: {
    type: String,
    required: [true, 'Instructions are required'],
  },
  prep_time: {
    type: Number,
    default: 0,
  },
  cook_time: {
    type: Number,
    default: 0,
  },
  servings: {
    type: Number,
    default: 1,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  category: {
    type: String,
    default: 'Uncategorized',
  },
  image_url: {
    type: String,
    default: '',
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  is_public: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Recipe || mongoose.model<IRecipe>('Recipe', RecipeSchema);