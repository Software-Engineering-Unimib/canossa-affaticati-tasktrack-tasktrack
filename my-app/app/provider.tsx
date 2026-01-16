'use client';

import { AuthProvider } from "@/app/context/AuthContext";
import { FocusProvider } from "@/app/context/FocusContext";
import { BoardsProvider } from "@/app/context/BoardsContext"; // <--- Importa questo

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <BoardsProvider> {/* <--- Avvolgi qui */}
                <FocusProvider>
                    {children}
                </FocusProvider>
            </BoardsProvider>
        </AuthProvider>
    );
}