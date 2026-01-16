'use client';

import { AuthProvider } from "@/app/context/AuthContext";
import { FocusProvider } from "@/app/context/FocusContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <FocusProvider>
                {children}
            </FocusProvider>
        </AuthProvider>
    );
}