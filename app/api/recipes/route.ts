import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let sql = `
      SELECT r.*, u.name as author_name
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      WHERE r.is_public = true
    `;
    const params = [];

    if (category && category !== 'All') {
      sql += ' AND r.category = ?';
      params.push(category);
    }

    sql += ' ORDER BY r.created_at DESC';

    const recipes = await query<any>(sql, params);
    
    return NextResponse.json({ recipes });
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

    if (!recipeData.title || !recipeData.ingredients || !recipeData.instructions) {
      return NextResponse.json(
        { error: 'Title, ingredients, and instructions are required' },
        { status: 400 }
      );
    }

    const result = await query<any>(
      `INSERT INTO recipes (
        title, description, ingredients, instructions,
        prep_time, cook_time, servings, difficulty,
        category, user_id, is_public
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recipeData.title,
        recipeData.description || '',
        recipeData.ingredients,
        recipeData.instructions,
        recipeData.prep_time || 0,
        recipeData.cook_time || 0,
        recipeData.servings || 1,
        recipeData.difficulty || 'medium',
        recipeData.category || 'Uncategorized',
        user.id,
        true
      ]
    );

    const newRecipe = await query<any>(
      'SELECT r.*, u.name as author_name FROM recipes r JOIN users u ON r.user_id = u.id WHERE r.id = ?',
      [result.insertId]
    );

    return NextResponse.json(
      { recipe: newRecipe[0], success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}