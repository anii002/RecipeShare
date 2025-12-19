import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Recipe from '@/models/Recipe';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

// Type for populated user
interface PopulatedUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  avatar_url?: string;
}

// Type for recipe with populated user
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
  user_id: PopulatedUser | mongoose.Types.ObjectId;
  is_public: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Type guard to check if user is populated
function isUserPopulated(user: any): user is PopulatedUser {
  return user && typeof user === 'object' && 'name' in user;
}

// GET /api/recipes - Get all recipes
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { is_public: true };
    
    if (category && category !== 'All Categories') {
      query.category = category;
    }
    
    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty.toLowerCase();
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Get recipes with user info
    const recipes = await Recipe.find(query)
      .populate({
        path: 'user_id',
        select: 'name avatar_url',
        model: User
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Recipe.countDocuments(query);

    // Transform data
    const transformedRecipes = (recipes as unknown as PopulatedRecipe[]).map(recipe => {
      const user = recipe.user_id;
      const userName = isUserPopulated(user) ? user.name : 'Unknown';
      const userAvatar = isUserPopulated(user) ? user.avatar_url : '';
      
      return {
        id: recipe._id.toString(),
        title: recipe.title,
        description: recipe.description || '',
        prep_time: recipe.prep_time || 0,
        cook_time: recipe.cook_time || 0,
        servings: recipe.servings || 1,
        difficulty: recipe.difficulty || 'medium',
        category: recipe.category || 'Uncategorized',
        image_url: recipe.image_url || '',
        author_name: userName,
        author_avatar: userAvatar,
        created_at: recipe.createdAt,
        updated_at: recipe.updatedAt
      };
    });

    return NextResponse.json({
      recipes: transformedRecipes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const recipeData = await request.json();

    const requiredFields = ['title', 'ingredients', 'instructions'];
    for (const field of requiredFields) {
      if (!recipeData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const userExists = await User.findById(user.id);
    if (!userExists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const recipe = await Recipe.create({
      ...recipeData,
      user_id: new mongoose.Types.ObjectId(user.id)
    });

    await recipe.populate({
      path: 'user_id',
      select: 'name avatar_url',
      model: User
    });

    const recipeObj = recipe.toObject ? recipe.toObject() : recipe;
    const populatedRecipe = recipeObj as unknown as PopulatedRecipe;
    
    const userName = isUserPopulated(populatedRecipe.user_id) 
      ? populatedRecipe.user_id.name 
      : 'Unknown';
    const userAvatar = isUserPopulated(populatedRecipe.user_id)
      ? populatedRecipe.user_id.avatar_url
      : '';

    const transformedRecipe = {
      id: populatedRecipe._id.toString(),
      title: populatedRecipe.title,
      description: populatedRecipe.description || '',
      ingredients: populatedRecipe.ingredients,
      instructions: populatedRecipe.instructions,
      prep_time: populatedRecipe.prep_time || 0,
      cook_time: populatedRecipe.cook_time || 0,
      servings: populatedRecipe.servings || 1,
      difficulty: populatedRecipe.difficulty || 'medium',
      category: populatedRecipe.category || 'Uncategorized',
      image_url: populatedRecipe.image_url || '',
      author_name: userName,
      author_avatar: userAvatar,
      created_at: populatedRecipe.createdAt,
      updated_at: populatedRecipe.updatedAt
    };

    return NextResponse.json(
      { recipe: transformedRecipe, success: true },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating recipe:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: 'Validation error', details: errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}