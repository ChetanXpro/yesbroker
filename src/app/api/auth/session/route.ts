import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/app/libs/db";

const JWT_SECRET = process.env.JWT_SECRET || "hackathon-secret-key";

export async function POST(req: any) {
    try {
        const { walletAddress } = await req.json();

        if (!walletAddress) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Wallet address required",
                },
                { status: 400 }
            );
        }

        // Get user from database
        const query = "SELECT * FROM users WHERE wallet_address = $1";
        const result = await pool.query(query, [walletAddress]);

        if (result.rowCount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "User not found",
                },
                { status: 404 }
            );
        }

        const user = result.rows[0];

        if (!user.verified) {
            return NextResponse.json(
                {
                    success: false,
                    error: "User not verified",
                },
                { status: 403 }
            );
        }

        // Create JWT token
        const tokenData = {
            userId: user.id,
            walletAddress: user.wallet_address,
            userType: user.user_type,
            verified: user.verified,
            name: user.name,
        };

        const token = jwt.sign(tokenData, JWT_SECRET, { expiresIn: "7d" });

        const response = NextResponse.json({
            success: true,
            token,
            user: {
                id: user.id,
                walletAddress: user.wallet_address,
                userType: user.user_type,
                verified: user.verified,
                name: user.name,
            },
        });

        // Set cookies
        response.cookies.set("yesbroker_token", token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Auth session error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to create session",
            },
            { status: 500 }
        );
    }
}
