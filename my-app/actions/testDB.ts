'use server'

import dbConnect from "../lib/db";
import User from "../models/User";

export async function testConnection() {
    try {
        await dbConnect();
        console.log("Database connesso con successo!");

        // Prova a cercare un utente (anche se il DB è vuoto non darà errore, tornerà null)
        const count = await User.countDocuments();
        return { success: true, message: `Connesso! Utenti trovati: ${count}` };
    } catch (error) {
        console.error("Errore connessione DB:", error);
        return { success: false, message: "Errore di connessione" };
    }
}