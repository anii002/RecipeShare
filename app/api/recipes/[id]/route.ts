import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Recipe from '@/models/Recipe';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

// Helper to clean and validate MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

// GET /api/recipes/[id] - Get single recipe by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    // Await params properly for Next.js 16
    const { id } = await params;
    
    // Validate the ID format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid recipe ID format' },
        { status: 400 }
      );
    }
    
    console.log('Fetching recipe with ID:', id);
    
    // Find recipe by ID and populate user info
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

    // Check if recipe is public or user owns it
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    let isAuthorized = recipe.is_public;
    
    if (token) {
      const user = verifyToken(token);
      if (user && (user.id === recipe.user_id._id.toString() || user.role === 'admin')) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized to view this recipe' },
        { status: 403 }
      );
    }

    console.log('Recipe found:', recipe.title);
    
    // Transform recipe data for frontend
    const transformedRecipe = {
      id: recipe._id.toString(),
      title: recipe.title,
      description: recipe.description || '',
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      prep_time: recipe.prep_time || 0,
      cook_time: recipe.cook_time || 0,
      servings: recipe.servings || 1,
      difficulty: recipe.difficulty || 'medium',
      category: recipe.category || 'Uncategorized',
      image_url: recipe.image_url || '',
      author_name: recipe.user_id?.name || 'Unknown Author',
      author_avatar: recipe.user_id?.avatar_url || '',
      author_email: recipe.user_id?.email || '',
      created_at: recipe.createdAt,
      updated_at: recipe.updatedAt,
      user_id: recipe.user_id?._id?.toString() || '',
      is_public: recipe.is_public
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

// PUT /api/recipes/[id] - Update existing recipe
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    // Verify authentication
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

    const recipeData = await request.json();
    
    // Find the recipe
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Verify ownership (user_id matches or admin)
    if (recipe.user_id.toString() !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized to update this recipe' },
        { status: 403 }
      );
    }

    // Update only allowed fields
    const allowedUpdates = [
      'title', 'description', 'ingredients', 'instructions',
      'prep_time', 'cook_time', 'servings', 'difficulty',
      'category', 'image_url', 'is_public'
    ];

    allowedUpdates.forEach(field => {
      if (recipeData[field] !== undefined) {
        recipe[field] = recipeData[field];
      }
    });

    recipe.updatedAt = new Date();
    await recipe.save();

    // Populate user info for response
    await recipe.populate({
      path: 'user_id',
      select: 'name avatar_url',
      model: User
    });

    const transformedRecipe = {
      id: recipe._id.toString(),
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      prep_time: recipe.prep_time,
      cook_time: recipe.cook_time,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      category: recipe.category,
      image_url: recipe.image_url || '',
      author_name: recipe.user_id?.name || 'Unknown',
      author_avatar: recipe.user_id?.avatar_url || '',
      created_at: recipe.createdAt,
      updated_at: recipe.updatedAt,
      is_public: recipe.is_public
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

// DELETE /api/recipes/[id] - Remove recipe
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    // Verify authentication
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

    // Check permissions
    if (recipe.user_id.toString() !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized to delete this recipe' },
        { status: 403 }
      );
    }

    // Perform deletion
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