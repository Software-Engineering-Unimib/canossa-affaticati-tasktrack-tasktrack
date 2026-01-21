'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Tags,
    Flag,
    Plus,
    ChevronRight,
    ChevronDown,
    Eye,
    Menu,
    X,
    LucideIcon,
    LogOut,
    User
} from 'lucide-react';

// Import Componenti UI
import LogoMobile from "@/app/components/logo/logoMobile";
import LogoDesktop from "@/app/components/logo/logoDesktop";
import SidebarBoardItem from "@/app/components/sidebar/SidebarBoardItem";
import CreateBoardDialog, { NewBoardData } from "@/app/components/Board/CreateBoardDialog";
import LogoutDialog from '@/app/components/auth/LogoutDialog';

// Import Logica e Context
import { useAuth } from '@/app/context/AuthContext';
import { useBoards } from '@/app/context/BoardsContext'; // <--- USA IL NUOVO CONTEXT CONDIVISO
import { useFocus } from "@/app/context/FocusContext";
import { BoardModel } from '@/models';
import { getClassByTheme } from "@/items/Board";

interface NavItemProps {
    href: string;
    icon: LucideIcon;
    label: string;
    active?: boolean;
}

// Helper per i link di navigazione
const NavItem: React.FC<NavItemProps> = ({ href, icon: Icon, label, active = false }) => (
    <Link
        href={href}
        className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 mb-1
            ${active
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
    >
        <Icon className={`w-5 h-5 mr-3 ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
        {label}
        {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
    </Link>
);

export default function Sidebar() {
    const pathname = usePathname();

    // --- HOOKS ---
    const { user, signOut } = useAuth();
    const { isFocusMode, toggleFocusMode } = useFocus();

    // USIAMO IL CONTEXT PER LE BACHECHE (Dati condivisi con Dashboard)
    const { boards, isLoading: isLoadingBoards, refreshBoards } = useBoards();

    // --- STATI UI ---
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
    const [isBoardsOpen, setIsBoardsOpen] = useState<boolean>(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

    // Gestione Creazione Bacheca
    const handleCreateBoard = async (data: NewBoardData) => {
        try {
            await BoardModel.createBoard(data.title,data.description, data.theme, data.icon);
            await refreshBoards(); // Aggiorna sia Sidebar che Dashboard
            setIsCreateDialogOpen(false);
        } catch (error) {
            console.error("Errore creazione:", error);
        }
    };

    // Gestione Logout
    const handleLogout = async () => {
        await signOut();
        setIsLogoutDialogOpen(false);
    };

    return (
        <>
            {/* MOBILE HEADER */}
            <div className="lg:hidden top-0 left-0 right-0 h-16 bg-white border-b z-50 flex items-center justify-between px-4 fixed">
                <LogoMobile/>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* SIDEBAR CONTAINER */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col
                lg:translate-x-0 lg:static lg:h-screen
                ${isMobileMenuOpen ? 'translate-x-0 top-16' : '-translate-x-full top-0 lg:top-0'}
            `}>

                {/* LOGO AREA */}
                <LogoDesktop/>

                {/* SCROLLABLE CONTENT */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">

                    {/* SEZIONE NAVIGAZIONE */}
                    <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                            Navigazione
                        </div>
                        <nav>
                            <NavItem
                                href="/dashboard"
                                icon={LayoutDashboard}
                                label="I miei Spazi"
                                active={pathname === '/dashboard'}
                            />
                            <NavItem
                                href="/categories"
                                icon={Tags}
                                label="Categorie"
                                active={pathname === '/categories'}
                            />
                            <NavItem
                                href="/priorities"
                                icon={Flag}
                                label="Priorità"
                                active={pathname === '/priorities'}
                            />
                        </nav>
                    </div>

                    {/* SEZIONE BACHECHE (ACCORDION) */}
                    <div>
                        <button
                            onClick={() => setIsBoardsOpen(!isBoardsOpen)}
                            className="w-full flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2 hover:text-gray-600 transition-colors focus:outline-none"
                        >
                            <span>Le tue Bacheche</span>
                            {isBoardsOpen ? (
                                <ChevronDown className="w-4 h-4" />
                            ) : (
                                <ChevronRight className="w-4 h-4" />
                            )}
                        </button>

                        {isBoardsOpen && (
                            <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                                {/* Loading State */}
                                {isLoadingBoards && (
                                    <div className="px-3 py-2 text-xs text-gray-400 italic">
                                        Caricamento...
                                    </div>
                                )}

                                {/* Lista Bacheche Reale */}
                                {!isLoadingBoards && boards.map((board) => (
                                    <SidebarBoardItem
                                        key={board.id}
                                        id={board.id}
                                        name={board.title}
                                        color={getClassByTheme(board.theme)}
                                    />
                                ))}

                                {/* Tasto Crea Nuova */}
                                <button
                                    className="w-full flex items-center px-3 py-2 text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-dashed border-gray-200 hover:border-blue-200 mt-2"
                                    onClick={() => setIsCreateDialogOpen(true)}
                                >
                                    <Plus className="w-4 h-4 mr-3" />
                                    <span>Crea nuova bacheca</span>
                                </button>
                            </div>
                        )}
                    </div>

                </div>

                {/* BOTTOM SECTION (FOCUS & USER) */}
                <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50/50">

                    {/* Toggle Focus Mode */}
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Eye className="w-4 h-4 text-purple-600" />
                            <span>Modalità Focus</span>
                        </div>
                        <button
                            onClick={toggleFocusMode}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${isFocusMode ? 'bg-purple-600' : 'bg-gray-200'}`}
                            role="switch"
                            aria-checked={isFocusMode}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isFocusMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="h-px bg-gray-200 my-2"></div>

                    {/* Profilo Utente Dinamico */}
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all group">
                        <div className="flex items-center flex-1 min-w-0">
                            {/* Avatar */}
                            {user?.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt="Avatar"
                                    className="w-9 h-9 rounded-full object-cover border border-blue-200 shadow-sm shrink-0"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm shrink-0">
                                    {user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4"/>}
                                </div>
                            )}

                            {/* Info Testuali */}
                            <div className="ml-3 flex-1 overflow-hidden">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user ? `${user.name} ${user.surname}` : 'Caricamento...'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user?.email || ''}
                                </p>
                            </div>
                        </div>

                        {/* Tasto Logout */}
                        <button
                            onClick={() => setIsLogoutDialogOpen(true)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Disconnettiti"
                        >
                            <LogOut className="w-4 h-4 shrink-0" />
                        </button>
                    </div>

                </div>
            </aside>

            {/* OVERLAY MOBILE */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-30 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* DIALOG CREAZIONE BACHECA */}
            <CreateBoardDialog
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onCreate={handleCreateBoard}
            />

            {/* DIALOG LOGOUT */}
            <LogoutDialog
                isOpen={isLogoutDialogOpen}
                onClose={() => setIsLogoutDialogOpen(false)}
                onConfirm={handleLogout}
            />
        </>
    );
}