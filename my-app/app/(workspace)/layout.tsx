import type { Metadata } from "next";
import "../globals.css";
import Sidebar from "@/app/components/sidebar/Sidebar";
import {FocusProvider} from "@/app/context/FocusContext";
import FocusOverlay from "@/app/components/FocusOverlay";


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
        <FocusProvider>
            <div className="flex h-screen overflow-hidden bg-gray-50">

                {/* La Sidebar rimane a sinistra (fuori dall'overlay viola) */}
                <div className="flex-none hidden lg:block">
                    <Sidebar />
                </div>
                <div className="lg:hidden">
                    <Sidebar />
                </div>

                {/* Area Principale */}
                <main className="flex-1 overflow-y-auto relative scroll-smooth flex flex-col">

                    {/* L'overlay è posizionato 'absolute' o 'fixed' sopra il contenuto
              ma dentro <main>, così la Sidebar resta cliccabile per spegnerlo. */}
                    <FocusOverlay />

                    {/* Il contenuto della pagina (Workspace, Board, ecc.) */}
                    <div className="flex-1 relative z-0">
                        {children}
                    </div>

                </main>

            </div>
        </FocusProvider>
    );
}
