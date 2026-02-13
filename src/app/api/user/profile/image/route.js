import { verifyJWT } from "@/lib/auth";
import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid"; //
import path from "path";
import fs from "fs/promises";

export async function OPTIONS(req) {
  return new Response(null, { status: 200, headers: corsHeaders });
}

// Helper to parse multipart form data
async function parseMultipartFormData(req) {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.startsWith("multipart/form-data")) {
    throw new Error("Invalid content-type");
  }
  return await req.formData();
}

export async function POST(req) {
  const user = verifyJWT(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  try {
    const formData = await parseMultipartFormData(req);
    const file = formData.get("file"); //

    // 1. Validation: Check if file exists and is a string
    if (!file || typeof file === "string") {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400, headers: corsHeaders });
    }

    // 2. Validation: Only allow image types
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ message: "Only image files allowed" }, { status: 400, headers: corsHeaders });
    }

    // 3. Save File: Use UUID for unguessable name
    const ext = file.name.split(".").pop();
    const filename = uuidv4() + "." + ext;
    const savePath = path.join(process.cwd(), "public", "profile-images", filename);

    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(savePath, Buffer.from(arrayBuffer));

    // 4. Update Database: Store only the path
    const client = await getClientPromise();
    const db = client.db("wad-01");
    await db.collection("user").updateOne(
      { email: user.email },
      { $set: { profileImage: `/profile-images/${filename}` } }
    );

    return NextResponse.json({ imageUrl: `/profile-images/${filename}` }, { status: 200, headers: corsHeaders });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Internal Error" }, { status: 500, headers: corsHeaders });
  }
}