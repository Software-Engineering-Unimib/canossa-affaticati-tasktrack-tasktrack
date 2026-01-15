import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Task from '@/models/Task'; 

export async function GET(request: Request, { params }: { params: { boardId: string } }) {
  try {
    await connectMongoDB();
    const { boardId } = await params;
    
    console.log("🔍 Cerco task per la board ID:", boardId);

    // Converti la stringa boardId in ObjectId per matchare il database
    const tasks = await Task.find({ boardId: boardId });

    console.log(`✅ Task trovati: ${tasks.length}`);
    
    return NextResponse.json(tasks || []);
  } catch (error) {
    console.error("❌ Errore API:", error);
    return NextResponse.json([], { status: 500 });
  }
}