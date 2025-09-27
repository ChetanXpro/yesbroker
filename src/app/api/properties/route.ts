import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/app/libs/db";

const JWT_SECRET = process.env.JWT_SECRET || "hackathon-secret-key";

// Helper function to verify JWT token
function verifyToken(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.substring(7);
    try {
        return jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
        return null;
    }
}

// GET all properties or filtered properties
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const ownerId = searchParams.get("owner_id");
        const status = searchParams.get("status") || "available";
        const city = searchParams.get("city");

        let query =
            "SELECT p.*, u.name as owner_name FROM properties p LEFT JOIN users u ON p.owner_id = u.id WHERE 1=1";
        const params: any[] = [];
        let paramCount = 1;

        if (ownerId) {
            query += ` AND p.owner_id = $${paramCount}`;
            params.push(ownerId);
            paramCount++;
        }

        if (status) {
            query += ` AND p.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        if (city) {
            query += ` AND p.city ILIKE $${paramCount}`;
            params.push(`%${city}%`);
            paramCount++;
        }

        query += " ORDER BY p.created_at DESC";

        const result = await pool.query(query, params);

        return NextResponse.json({
            success: true,
            data: result.rows,
            count: result.rowCount,
        });
    } catch (error) {
        console.error("Error fetching properties:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch properties",
            },
            { status: 500 }
        );
    }
}

// POST - Create a new property (requires authentication)
export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Authentication required",
                },
                { status: 401 }
            );
        }

        // Check if user is owner
        if (user.userType !== "owner") {
            return NextResponse.json(
                {
                    success: false,
                    error: "Only property owners can create listings",
                },
                { status: 403 }
            );
        }

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
            status = "available",
        } = body;

        // Validate required fields
        if (!title || !address || !city || !state || !price) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Missing required fields: title, address, city, state, price",
                },
                { status: 400 }
            );
        }

        const query = `
            INSERT INTO properties (
                title, description, address, city, state, zipcode,
                price, bedrooms, bathrooms, square_feet, property_type,
                status, owner_id, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6,
                $7, $8, $9, $10, $11,
                $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            ) RETURNING *
        `;

        const values = [
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
            status,
            user.userId, // Use authenticated user's ID
        ];

        const result = await pool.query(query, values);

        return NextResponse.json(
            {
                success: true,
                data: result.rows[0],
                message: "Property created successfully",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating property:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to create property",
            },
            { status: 500 }
        );
    }
}
