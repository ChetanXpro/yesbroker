import { NextRequest, NextResponse } from "next/server";
import pool from "../../../libs/db";

// GET a single property by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = params.id;

        const query = "SELECT * FROM properties WHERE id = $1";
        const result = await pool.query(query, [id]);

        if (result.rowCount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Property not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: result.rows[0],
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching property:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch property",
            },
            { status: 500 }
        );
    }
}

// PUT - Update a property
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        const body = await request.json();

        // First check if property exists
        const checkQuery = "SELECT * FROM properties WHERE id = $1";
        const checkResult = await pool.query(checkQuery, [id]);

        if (checkResult.rowCount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Property not found",
                },
                { status: 404 }
            );
        }

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
            status,
            owner_id,
        } = body;

        const updateFields = [];
        const values = [];
        let paramCount = 1;

        if (title !== undefined) {
            updateFields.push(`title = $${paramCount}`);
            values.push(title);
            paramCount++;
        }
        if (description !== undefined) {
            updateFields.push(`description = $${paramCount}`);
            values.push(description);
            paramCount++;
        }
        if (address !== undefined) {
            updateFields.push(`address = $${paramCount}`);
            values.push(address);
            paramCount++;
        }
        if (city !== undefined) {
            updateFields.push(`city = $${paramCount}`);
            values.push(city);
            paramCount++;
        }
        if (state !== undefined) {
            updateFields.push(`state = $${paramCount}`);
            values.push(state);
            paramCount++;
        }
        if (zipcode !== undefined) {
            updateFields.push(`zipcode = $${paramCount}`);
            values.push(zipcode);
            paramCount++;
        }
        if (price !== undefined) {
            updateFields.push(`price = $${paramCount}`);
            values.push(price);
            paramCount++;
        }
        if (bedrooms !== undefined) {
            updateFields.push(`bedrooms = $${paramCount}`);
            values.push(bedrooms);
            paramCount++;
        }
        if (bathrooms !== undefined) {
            updateFields.push(`bathrooms = $${paramCount}`);
            values.push(bathrooms);
            paramCount++;
        }
        if (square_feet !== undefined) {
            updateFields.push(`square_feet = $${paramCount}`);
            values.push(square_feet);
            paramCount++;
        }
        if (property_type !== undefined) {
            updateFields.push(`property_type = $${paramCount}`);
            values.push(property_type);
            paramCount++;
        }
        if (status !== undefined) {
            updateFields.push(`status = $${paramCount}`);
            values.push(status);
            paramCount++;
        }
        if (owner_id !== undefined) {
            updateFields.push(`owner_id = $${paramCount}`);
            values.push(owner_id);
            paramCount++;
        }

        if (updateFields.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "No fields to update",
                },
                { status: 400 }
            );
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const query = `
      UPDATE properties
      SET ${updateFields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

        const result = await pool.query(query, values);

        return NextResponse.json(
            {
                success: true,
                data: result.rows[0],
                message: "Property updated successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating property:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to update property",
            },
            { status: 500 }
        );
    }
}

// DELETE a property
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = params.id;

        const query = "DELETE FROM properties WHERE id = $1 RETURNING *";
        const result = await pool.query(query, [id]);

        if (result.rowCount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Property not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Property deleted successfully",
                data: result.rows[0],
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting property:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to delete property",
            },
            { status: 500 }
        );
    }
}
