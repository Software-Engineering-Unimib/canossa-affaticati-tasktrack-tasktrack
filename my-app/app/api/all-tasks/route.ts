import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Task from "@/models/Task";

export async function GET() {
  try {
    await connectMongoDB();
    const tasks = await Task.find({});
    console.log('[API /api/all-tasks] Tasks trovate:', tasks);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('[API /api/all-tasks] Errore:', error);
    return NextResponse.json({ error: "Errore connessione o query" }, { status: 500 });
  }
}
