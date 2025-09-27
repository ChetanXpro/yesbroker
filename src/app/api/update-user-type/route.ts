import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "hackathon-secret-key";

export async function POST(req: Request) {
  try {
    const { userType } = await req.json();

    // Validate userType
    if (!userType || !["owner", "renter"].includes(userType)) {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 });
    }

    // Get token from cookies
    const cookies = req.headers.get("cookie");
    const tokenMatch = cookies?.match(/yesbroker_token=([^;]+)/);

    if (!tokenMatch) {
      return NextResponse.json(
        { error: "No authentication token found" },
        { status: 401 }
      );
    }

    const token = tokenMatch[1];

    try {
      // Verify and decode the current token
      const currentUserData = jwt.verify(token, JWT_SECRET) as any;

      // Create new token with updated userType
      const updatedUserData = {
        ...currentUserData,
        userType,
        updatedAt: Date.now(),
      };

      const newToken = jwt.sign(updatedUserData, JWT_SECRET, {
        expiresIn: "7d",
      });

      const response = NextResponse.json({
        success: true,
        userType,
        message: "User type updated successfully",
      });

      // Set the updated token
      response.cookies.set("yesbroker_token", newToken, {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      return response;
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error updating user type:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
