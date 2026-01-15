'use server'

import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function fetchAllUsers() {
    try {
        await dbConnect();

        // .lean() converte i documenti Mongoose in semplici oggetti JavaScript (più veloci)
        const users = await User.find({}).lean();

        // Dobbiamo convertire l'_id e le date in stringhe per evitare errori di serializzazione di Next.js
        const serializedUsers = users.map((user: any) => ({
            ...user,
            _id: user._id.toString(),
            createdAt: user.createdAt ? user.createdAt.toISOString() : null,
        }));

        return { success: true, data: serializedUsers };

    } catch (error) {
        console.error("Errore nel recupero utenti:", error);
        return { success: false, error: "Impossibile recuperare gli utenti" };
    }
}