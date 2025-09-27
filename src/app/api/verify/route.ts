import { NextResponse } from "next/server";
import { SelfBackendVerifier, AllIds, DefaultConfigStore } from "@selfxyz/core";
import jwt from "jsonwebtoken";
import pool from "@/app/libs/db";

const JWT_SECRET = process.env.JWT_SECRET || "hackathon-secret-key";

const verifyEndpoint = `https://yesbroker-green.vercel.app/api/verify`;

const selfBackendVerifier = new SelfBackendVerifier(
    "self-workshop",
    verifyEndpoint,
    false,
    AllIds,
    new DefaultConfigStore({
        minimumAge: 18,
        excludedCountries: [],
        ofac: false,
    }),
    "hex"
);

function decodeUserType(hexData: string) {
    try {
        const cleanHex = hexData.startsWith("0x") ? hexData.slice(2) : hexData;
        const buffer = Buffer.from(cleanHex, "hex");

        let readable = "";
        for (let i = 0; i < buffer.length; i++) {
            const char = buffer[i];
            if (char >= 32 && char <= 126) {
                readable += String.fromCharCode(char);
            }
        }

        // Extract just "renter" or "owner" from the readable string
        if (readable.includes("owner")) {
            return "owner";
        } else if (readable.includes("renter")) {
            return "renter";
        }

        return "renter"; // default fallback
    } catch (error) {
        console.error("Error decoding user type:", error);
        return "renter";
    }
}

export async function POST(req: any) {
    try {
        const { attestationId, proof, publicSignals, userContextData } = await req.json();

        console.log("Starting verification...");

        const result = await selfBackendVerifier.verify(
            attestationId,
            proof,
            publicSignals,
            userContextData
        );

        if (!result.isValidDetails.isValid) {
            return NextResponse.json({
                status: "error",
                result: false,
                reason: "Verification failed",
                error_code: "VERIFICATION_FAILED",
            });
        }

        const walletAddress = result.userData.userIdentifier;
        const userType = decodeUserType(userContextData);

        console.log("Wallet:", walletAddress);
        console.log("User Type:", userType);

        // Check if user exists
        const checkUserQuery = "SELECT * FROM users WHERE wallet_address = $1";
        const existingUser = await pool.query(checkUserQuery, [walletAddress]);

        let user;
        let isNewUser = false;
        let redirectTo = "/dashboard";

        if (existingUser.rowCount === 0) {
            // Create new user
            const insertQuery = `
                INSERT INTO users (name, wallet_address, verified, user_type, created_at, updated_at)
                VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING *
            `;
            const defaultName = `${userType}_${walletAddress.slice(-4)}`;

            const insertResult = await pool.query(insertQuery, [
                defaultName,
                walletAddress,
                true,
                userType,
            ]);

            user = insertResult.rows[0];
            isNewUser = true;
            redirectTo = "/onboard";

            console.log("New user created:", user.id);
        } else {
            // User exists, just update verification status
            const updateQuery = `
                UPDATE users 
                SET verified = true, updated_at = CURRENT_TIMESTAMP 
                WHERE wallet_address = $1 
                RETURNING *
            `;

            const updateResult = await pool.query(updateQuery, [walletAddress]);
            user = updateResult.rows[0];

            console.log("Existing user updated:", user.id);
        }

        const tokenData = {
            userId: user.id,
            walletAddress: user.wallet_address,
            userType: user.user_type,
            verified: user.verified,
            isNewUser,
        };

        const token = jwt.sign(tokenData, JWT_SECRET, { expiresIn: "7d" });

        const response = NextResponse.json({
            status: "success",
            result: true,
            credentialSubject: result.discloseOutput,
            userData: {
                userId: user.id,
                userType: user.user_type,
                verified: user.verified,
                walletAddress: user.wallet_address,
                isNewUser,
            },
            redirect: redirectTo,
        });

        response.cookies.set("yesbroker_token", token, {
            httpOnly: false,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
        });

        return response;
    } catch (error: any) {
        console.error("Verification error:", error);
        return NextResponse.json({
            status: "error",
            result: false,
            reason: error.message,
            error_code: "UNKNOWN_ERROR",
        });
    }
}
