import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Recipe from '@/models/Recipe';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

interface PopulatedRecipe {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  difficulty?: string;
  category?: string;
  image_url?: string;
  user_id: {
    _id: mongoose.Types.ObjectId;
    name?: string;
    email?: string;
    avatar_url?: string;
  } | mongoose.Types.ObjectId;
  is_public?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function isUserPopulated(user_id: any): user_id is { 
  _id: mongoose.Types.ObjectId; 
  name?: string; 
  email?: string; 
  avatar_url?: string; 
} {
  return user_id && typeof user_id === 'object' && '_id' in user_id;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid recipe ID format' },
        { status: 400 }
      );
    }

    console.log('Fetching recipe with ID:', id);

    const recipe = await Recipe.findById(id)
      .populate({
        path: 'user_id',
        select: 'name email avatar_url',
        model: User
      })
      .lean();

    if (!recipe) {
      console.log('Recipe not found for ID:', id);
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    const recipeData = recipe as unknown as PopulatedRecipe;
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    let isAuthorized = recipeData.is_public || false;

    if (token) {
      const user = verifyToken(token);
      if (user) {
        const recipeUserId = isUserPopulated(recipeData.user_id) 
          ? recipeData.user_id._id.toString() 
          : recipeData.user_id.toString();
        
        if (user.id === recipeUserId || user.role === 'admin') {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized to view this recipe' },
        { status: 403 }
      );
    }

    console.log('Recipe found:', recipeData.title);

    const transformedRecipe = {
      id: recipeData._id.toString(),
      title: recipeData.title,
      description: recipeData.description || '',
      ingredients: recipeData.ingredients,
      instructions: recipeData.instructions,
      prep_time: recipeData.prep_time || 0,
      cook_time: recipeData.cook_time || 0,
      servings: recipeData.servings || 1,
      difficulty: recipeData.difficulty || 'medium',
      category: recipeData.category || 'Uncategorized',
      image_url: recipeData.image_url || '',
      author_name: isUserPopulated(recipeData.user_id) ? recipeData.user_id.name || 'Unknown Author' : 'Unknown Author',
      author_avatar: isUserPopulated(recipeData.user_id) ? recipeData.user_id.avatar_url || '' : '',
      author_email: isUserPopulated(recipeData.user_id) ? recipeData.user_id.email || '' : '',
      created_at: recipeData.createdAt,
      updated_at: recipeData.updatedAt,
      user_id: isUserPopulated(recipeData.user_id) 
        ? recipeData.user_id._id.toString() 
        : recipeData.user_id.toString(),
      is_public: recipeData.is_public || true
    };

    return NextResponse.json({
      recipe: transformedRecipe
    });

  } catch (error: any) {
    console.error('Error fetching recipe:', error.message);

    return NextResponse.json(
      {
        error: 'Failed to fetch recipe',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid recipe ID' },
        { status: 400 }
      );
    }

    const requestData = await request.json();

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    if (recipe.user_id.toString() !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized to update this recipe' },
        { status: 403 }
      );
    }

    const allowedUpdates = [
      'title', 'description', 'ingredients', 'instructions',
      'prep_time', 'cook_time', 'servings', 'difficulty',
      'category', 'image_url', 'is_public'
    ];

    allowedUpdates.forEach(field => {
      if (requestData[field] !== undefined) {
        (recipe as any)[field] = requestData[field];
      }
    });

    recipe.updatedAt = new Date();
    await recipe.save();

    await recipe.populate({
      path: 'user_id',
      select: 'name avatar_url',
      model: User
    });

    const populatedRecipe = recipe as any;

    const transformedRecipe = {
      id: populatedRecipe._id.toString(),
      title: populatedRecipe.title,
      description: populatedRecipe.description,
      ingredients: populatedRecipe.ingredients,
      instructions: populatedRecipe.instructions,
      prep_time: populatedRecipe.prep_time,
      cook_time: populatedRecipe.cook_time,
      servings: populatedRecipe.servings,
      difficulty: populatedRecipe.difficulty,
      category: populatedRecipe.category,
      image_url: populatedRecipe.image_url || '',
      author_name: populatedRecipe.user_id?.name || 'Unknown',
      author_avatar: populatedRecipe.user_id?.avatar_url || '',
      created_at: populatedRecipe.createdAt,
      updated_at: populatedRecipe.updatedAt,
      is_public: populatedRecipe.is_public
    };

    return NextResponse.json({
      recipe: transformedRecipe,
      success: true,
      message: 'Recipe updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating recipe:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Validate ID
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid recipe ID' },
        { status: 400 }
      );
    }

    // Find recipe
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    if (recipe.user_id.toString() !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized to delete this recipe' },
        { status: 403 }
      );
    }

    await Recipe.deleteOne({ _id: id });

    return NextResponse.json({
      success: true,
      message: 'Recipe deleted successfully',
      deletedId: id
    });

  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    );
  }
}