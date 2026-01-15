import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Task from '@/models/Task'; 

export async function GET(request, { params }) {
    try {
        await connectMongoDB();
        const { boardId } = await params; 
        
        console.log("Cerco task per la board ID:", boardId);

        // La query deve puntare al campo corretto del tuo Schema
        const tasks = await Task.find({});

        console.log("Task trovati nel DB:", tasks.length);
        
        return NextResponse.json(tasks || []);
    } catch (error) {
        console.error("Errore API:", error);
        return NextResponse.json([], { status: 500 });
    }
}