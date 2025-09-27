import { NextRequest, NextResponse } from "next/server";
import pool from "../../../libs/db";

interface WebhookPayload {
    status: string;
    transactionHash?: string | null;
    propertyId: string | number;
}

export async function POST(request: NextRequest) {
    try {
        const body: WebhookPayload = await request.json();
        const { status, transactionHash, propertyId } = body;

        //
        // Validate required fields
        https: if (!status || !propertyId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Missing required fields: status, propertyId",
                },
                { status: 400 }
            );
        }

        // Check if property exists
        const checkQuery = "SELECT id FROM properties WHERE id = $1";
        const checkResult = await pool.query(checkQuery, [propertyId]);

        if (checkResult.rowCount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Property not found",
                },
                { status: 404 }
            );
        }

        // Handle different status cases
        if (status.toLowerCase() === "success") {
            // For success, we expect a transaction hash
            if (!transactionHash) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Transaction hash is required for successful transactions",
                    },
                    { status: 400 }
                );
            }

            // Update property as verified with transaction hash
            const updateQuery = `
                UPDATE properties
                SET is_verified = true,
                    verification_transaction_hash = $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING id, is_verified, verification_transaction_hash
            `;

            const result = await pool.query(updateQuery, [transactionHash, propertyId]);

            return NextResponse.json(
                {
                    success: true,
                    message: "Property verified successfully",
                    data: result.rows[0],
                },
                { status: 200 }
            );
        } else {
            // For failed/other statuses, just log the attempt (optional: store failed transaction hash if provided)
            const updateQuery = `
                UPDATE properties
                SET is_verified = false,
                    verification_transaction_hash = $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING id, is_verified, verification_transaction_hash
            `;

            const result = await pool.query(updateQuery, [transactionHash || null, propertyId]);

            return NextResponse.json(
                {
                    success: true,
                    message: `Verification attempt logged with status: ${status}`,
                    data: result.rows[0],
                },
                { status: 200 }
            );
        }
    } catch (error) {
        console.error("Error processing webhook:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
            },
            { status: 500 }
        );
    }
}
