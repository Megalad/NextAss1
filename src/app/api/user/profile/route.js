import { verifyJWT } from "@/lib/auth";
import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function OPTIONS(req) {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function GET(req) {
  const user = verifyJWT(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");
    // Fetch user data based on the email in the token
    const profile = await db.collection("user").findOne({ email: user.email });

    if (profile) {
        // Return profile data (ID, Name, Email, Image)
        return NextResponse.json(profile, { status: 200, headers: corsHeaders });
    } else {
        return NextResponse.json({ message: "User not found" }, { status: 404, headers: corsHeaders });
    }
  } catch (error) {
    return NextResponse.json({ message: error.toString() }, { status: 500, headers: corsHeaders });
  }
}