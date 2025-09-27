import { NextRequest, NextResponse } from 'next/server';
import pool from '../../libs/db';

// GET all properties or filtered properties
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ownerId = searchParams.get('owner_id');
    const status = searchParams.get('status');
    const city = searchParams.get('city');

    let query = 'SELECT * FROM properties WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (ownerId) {
      query += ` AND owner_id = $${paramCount}`;
      params.push(ownerId);
      paramCount++;
    }

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (city) {
      query += ` AND city = $${paramCount}`;
      params.push(city);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch properties'
    }, { status: 500 });
  }
}

// POST - Create a new property
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      address,
      city,
      state,
      zipcode,
      price,
      bedrooms,
      bathrooms,
      square_feet,
      property_type,
      status = 'available',
      owner_id
    } = body;

    // Validate required fields
    if (!title || !address || !city || !state || !price || !owner_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title, address, city, state, price, owner_id'
      }, { status: 400 });
    }

    const query = `
      INSERT INTO properties (
        title, description, address, city, state, zipcode,
        price, bedrooms, bathrooms, square_feet, property_type,
        status, owner_id, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, CURRENT_TIMESTAMP
      ) RETURNING *
    `;

    const values = [
      title, description, address, city, state, zipcode,
      price, bedrooms, bathrooms, square_feet, property_type,
      status, owner_id
    ];

    const result = await pool.query(query, values);

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Property created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create property'
    }, { status: 500 });
  }
}