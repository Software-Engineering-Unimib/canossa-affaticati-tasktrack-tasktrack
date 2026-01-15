import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Task from "@/models/Task";

export async function POST(request) {
    try {
        const body = await request.json();
        await connectMongoDB();
        
        // Creazione del documento su MongoDB
        const newTask = await Task.create(body);
        
        return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Errore salvataggio task" }, { status: 500 });
    }
}