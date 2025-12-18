import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single recipe
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const recipeId = resolvedParams.id;
    const id = parseInt(recipeId);

    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid recipe ID',
          receivedId: recipeId
        },
        { status: 400 }
      );
    }

    const recipes = await query<any>(
      `SELECT r.*, u.name as author_name
       FROM recipes r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [id]
    );

    if (recipes.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Recipe not found',
          requestedId: id
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      recipe: recipes[0]
    });
  } catch (error: any) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// PUT (Update) recipe
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const recipeId = resolvedParams.id;
    const id = parseInt(recipeId);

    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: 'Invalid recipe ID' },
        { status: 400 }
      );
    }

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

    // Check if recipe exists
    const existingRecipes = await query<any>(
      'SELECT * FROM recipes WHERE id = ?',
      [id]
    );

    if (existingRecipes.length === 0) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    const existingRecipe = existingRecipes[0];
    
    // Check ownership
    if (existingRecipe.user_id !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to update this recipe' },
        { status: 403 }
      );
    }

    // Update recipe
    await query<any>(
      `UPDATE recipes SET
        title = ?, description = ?, ingredients = ?, instructions = ?,
        prep_time = ?, cook_time = ?, servings = ?, difficulty = ?,
        category = ?, image_url = ?, is_public = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        recipeData.title || existingRecipe.title,
        recipeData.description || existingRecipe.description,
        recipeData.ingredients || existingRecipe.ingredients,
        recipeData.instructions || existingRecipe.instructions,
        recipeData.prep_time ?? existingRecipe.prep_time,
        recipeData.cook_time ?? existingRecipe.cook_time,
        recipeData.servings ?? existingRecipe.servings,
        recipeData.difficulty || existingRecipe.difficulty,
        recipeData.category || existingRecipe.category,
        recipeData.image_url || existingRecipe.image_url,
        recipeData.is_public ?? existingRecipe.is_public,
        id
      ]
    );

    const updatedRecipe = await query<any>(
      `SELECT r.*, u.name as author_name
       FROM recipes r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      recipe: updatedRecipe[0]
    });
  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE recipe
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const recipeId = resolvedParams.id;
    const id = parseInt(recipeId);

    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: 'Invalid recipe ID' },
        { status: 400 }
      );
    }

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

    // Check if recipe exists
    const recipes = await query<any>(
      'SELECT * FROM recipes WHERE id = ?',
      [id]
    );

    if (recipes.length === 0) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    const recipe = recipes[0];
    
    // Check ownership
    if (recipe.user_id !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to delete this recipe' },
        { status: 403 }
      );
    }

    // Delete recipe
    await query<any>('DELETE FROM recipes WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}