import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Task from "@/models/Task";

export async function GET() {
  try {
    console.log("🔄 Tentativo di connessione a MongoDB...");
    await connectMongoDB();
    console.log("✅ Connessione riuscita!");

    // Test 1: Conta tutti i documenti
    const totalCount = await Task.countDocuments();
    console.log(`📊 Totale task nel DB: ${totalCount}`);

    // Test 2: Prendi tutti i task (non filtrati) - senza .lean() per ObjectId
    const allTasks = await Task.find({}).limit(5);
    console.log("📋 Primi 5 task:", JSON.stringify(allTasks, null, 2));

    // Test 3: Statistiche per boardId

    return NextResponse.json({
      status: "✅ Connessione OK",
      totalTasks: totalCount,
      sampleTasks: allTasks,
    });
  } catch (error) {
    console.error("❌ Errore:", error);
    return NextResponse.json(
      {
        status: "❌ Errore connessione",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
