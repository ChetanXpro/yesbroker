// app/api/property-interests/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/app/libs/db";

const JWT_SECRET = process.env.JWT_SECRET || "hackathon-secret-key";

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

// GET - Get user's interests or property's interested users
export async function GET(request: NextRequest) {
    try {
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const propertyId = searchParams.get("property_id");

        let query: string;
        let params: any[];

        if (propertyId) {
            // Get all users interested in a specific property (for owners)
            query = `
                SELECT pi.*, u.name, u.wallet_address, p.title as property_title
                FROM property_interests pi
                JOIN users u ON pi.user_id = u.id
                JOIN properties p ON pi.property_id = p.id
                WHERE pi.property_id = $1 AND p.owner_id = $2
                ORDER BY pi.created_at DESC
            `;
            params = [propertyId, user.userId];
        } else {
            // Get user's own interests (for renters)
            query = `
                SELECT pi.*, p.title, p.address, p.city, p.price, p.status
                FROM property_interests pi
                JOIN properties p ON pi.property_id = p.id
                WHERE pi.user_id = $1
                ORDER BY pi.created_at DESC
            `;
            params = [user.userId];
        }

        const result = await pool.query(query, params);

        return NextResponse.json({
            success: true,
            data: result.rows,
            count: result.rowCount,
        });
    } catch (error) {
        console.error("Error fetching property interests:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch interests" },
            { status: 500 }
        );
    }
}

// POST - Show interest in a property
export async function POST(request: NextRequest) {
    try {
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 }
            );
        }

        const { property_id } = await request.json();

        if (!property_id) {
            return NextResponse.json(
                { success: false, error: "Property ID is required" },
                { status: 400 }
            );
        }

        // Check if property exists
        const propertyCheck = await pool.query(
            "SELECT id, owner_id FROM properties WHERE id = $1",
            [property_id]
        );

        if (propertyCheck.rowCount === 0) {
            return NextResponse.json(
                { success: false, error: "Property not found" },
                { status: 404 }
            );
        }

        // Check if user already showed interest
        const existingInterest = await pool.query(
            "SELECT id FROM property_interests WHERE property_id = $1 AND user_id = $2",
            [property_id, user.userId]
        );

        if (existingInterest.rowCount && existingInterest.rowCount > 0) {
            return NextResponse.json(
                { success: false, error: "You have already shown interest in this property" },
                { status: 400 }
            );
        }

        // Create interest record
        const result = await pool.query(
            `INSERT INTO property_interests (property_id, user_id, created_at)
             VALUES ($1, $2, CURRENT_TIMESTAMP)
             RETURNING *`,
            [property_id, user.userId]
        );

        return NextResponse.json({
            success: true,
            data: result.rows[0],
            message: "Interest recorded successfully",
        });
    } catch (error) {
        console.error("Error creating property interest:", error);
        return NextResponse.json(
            { success: false, error: "Failed to record interest" },
            { status: 500 }
        );
    }
}
