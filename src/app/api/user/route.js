// app/api/user/route.js
import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const client = await getClientPromise();
        const db = client.db("wad-01");
        const users = await db.collection("user").find({}).toArray();
        return NextResponse.json(users, { status: 200, headers: corsHeaders });
    } catch (error) {
        return NextResponse.json({ message: error.toString() }, { status: 500, headers: corsHeaders });
    }
}

export async function POST(req) {
    try {
        const data = await req.json();
        const { username, email, password, firstname, lastname } = data;

        if (!username || !email || !password) {
            return NextResponse.json({ message: "Missing mandatory data" }, { status: 400, headers: corsHeaders });
        }

        const client = await getClientPromise();
        const db = client.db("wad-01");
        
        const result = await db.collection("user").insertOne({
            username,
            email,
            password: await bcrypt.hash(password, 10),
            firstname,
            lastname,
            status: "ACTIVE"
        });

        return NextResponse.json({ id: result.insertedId }, { status: 200, headers: corsHeaders });
    } catch (exception) {
        return NextResponse.json({ message: "Operation failed: " + exception.message }, { status: 400, headers: corsHeaders });
    }
}
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}