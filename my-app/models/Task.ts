import mongoose from "mongoose";

// 1. DEFINIZIONE DELLO SCHEMA (Questo è quello che legge il Database)
const TaskSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId },
    title: { type: String, required: true },
    description: { type: String },
    // Se boardId è l'ID della board a cui appartiene
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true }, 
    categories: [{ type: Object }], // Array di oggetti categoria
    priority: { type: String, enum: ['Low', 'Medium', 'High'] }, // Esempio di Priority
    columnId: { type: String, default: 'todo' }, 
    dueDate: { type: Date },
    assignees: [{ type: String }],
    comments: { type: Number, default: 0 },
    attachments: { type: Number, default: 0 }
}, { timestamps: true }); // Aggiunge automaticamente createdAt e updatedAt

// 2. CREAZIONE DEL MODELLO
const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);
export default Task;