import { NextResponse } from "next/server";
import { SelfBackendVerifier, AllIds, DefaultConfigStore } from "@selfxyz/core";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "hackathon-secret-key";

const selfBackendVerifier = new SelfBackendVerifier(
  "self-workshop",
  "https://indirect-garbage-edmonton-disco.trycloudflare.com/api/verify",
  false,
  AllIds,
  new DefaultConfigStore({
    minimumAge: 18,
    excludedCountries: [],
    ofac: false,
  }),
  "hex"
);

function generateUserId() {
  return (
    "user_" + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  );
}

export async function POST(req: Request) {
  try {
    const { attestationId, proof, publicSignals, userContextData, userType } =
      await req.json();

    const result = await selfBackendVerifier.verify(
      attestationId,
      proof,
      publicSignals,
      userContextData
    );

    if (result.isValidDetails.isValid) {
      const userData = {
        userId: generateUserId(),
        verified: true,
        nationality: result.discloseOutput?.nationality,
        age: result.discloseOutput?.dateOfBirth,
        verifiedAt: Date.now(),
        // Add userType to the JWT payload
        userType: userType || "renter", // Default to renter if not specified
      };

      const token = jwt.sign(userData, JWT_SECRET, { expiresIn: "7d" });

      // Self app expects this exact format
      const selfResponse = NextResponse.json({
        status: "success",
        result: true,
        credentialSubject: result.discloseOutput,
        userData: {
          userId: userData.userId,
          userType: userData.userType,
          verified: true,
        },
      });

      // Set your cookie separately
      selfResponse.cookies.set("yesbroker_token", token, {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/", // Ensure cookie is available site-wide
      });

      return selfResponse;
    } else {
      return NextResponse.json({
        status: "error",
        result: false,
        reason: "Verification failed",
        error_code: "VERIFICATION_FAILED",
        details: result.isValidDetails,
      });
    }
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
