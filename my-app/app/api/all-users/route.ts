import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await connectMongoDB();
    const users = await User.find({});
    return NextResponse.json({ count: users.length, users });
  } catch (error) {
    return NextResponse.json({ error: "Errore connessione o query" }, { status: 500 });
  }
}
