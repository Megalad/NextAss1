// app/api/user/[id]/route.js
import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
    const { id } = await params;
    const data = await req.json();
    try {
        const client = await getClientPromise();
        const db = client.db("wad-01");
        await db.collection("user").updateOne(
            { _id: new ObjectId(id) },
            { $set: { email: data.email, firstname: data.firstname, lastname: data.lastname } }
        );
        return NextResponse.json({ message: "Success" }, { status: 200, headers: corsHeaders });
    } catch (e) {
        return NextResponse.json({ message: e.message }, { status: 400, headers: corsHeaders });
    }
}

export async function DELETE(req, { params }) {
    const { id } = await params;
    try {
        const client = await getClientPromise();
        const db = client.db("wad-01");
        await db.collection("user").deleteOne({ _id: new ObjectId(id) });
        return NextResponse.json({ message: "Deleted" }, { status: 200, headers: corsHeaders });
    } catch (e) {
        return NextResponse.json({ message: e.message }, { status: 400, headers: corsHeaders });
    }
}
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}