import type { Metadata } from "next";
import "../globals.css";
import Sidebar from "@/app/components/sidebar/sidebar";


export const metadata: Metadata = {
  title: "Task Track",
  description: "Personal task tracking application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        // 1. Contenitore Esterno: Occupa tutta l'altezza dello schermo (h-screen)
        // e impedisce lo scroll del body (overflow-hidden)
        <div className="flex h-screen overflow-hidden bg-gray-50">

            {/* 2. La Sidebar: Non scrolla insieme alla pagina, ha il suo scroll interno se serve */}
            <div className="flex-none hidden lg:block">
                <Sidebar />
            </div>

            {/* Sidebar Mobile: Il componente Sidebar gestisce già la sua visibilità mobile (fixed) */}
            <div className="lg:hidden">
                <Sidebar />
            </div>

            {/* 3. Area Contenuto (Main):
          - flex-1: Prende tutto lo spazio rimanente
          - overflow-y-auto: ABILITA lo scroll solo qui dentro
          - relative: Per posizionare correttamente elementi assoluti interni
      */}
            <main className="flex-1 overflow-y-auto relative scroll-smooth">
                {children}
            </main>

        </div>
    );
}
