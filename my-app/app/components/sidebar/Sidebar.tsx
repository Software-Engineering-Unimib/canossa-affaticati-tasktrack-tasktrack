/**
 * @fileoverview Sidebar principale dell'applicazione.
 *
 * Contiene:
 * - Logo
 * - Navigazione principale
 * - Lista bacheche con accordion
 * - Toggle modalità focus
 * - Profilo utente con logout
 *
 * @module components/sidebar/Sidebar
 */

'use client';

import React, { useState, useCallback } from 'react';
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
    LogOut,
    User,
    LucideIcon,
} from 'lucide-react';

import LogoMobile from '@/app/components/logo/logoMobile';
import LogoDesktop from '@/app/components/logo/logoDesktop';
import SidebarBoardItem from '@/app/components/sidebar/SidebarBoardItem';
import CreateBoardDialog, { NewBoardData } from '@/app/components/Board/CreateBoardDialog';
import LogoutDialog from '@/app/components/auth/LogoutDialog';

import { useAuth } from '@/app/context/AuthContext';
import { useBoards } from '@/app/context/BoardsContext';
import { useFocus } from '@/app/context/FocusContext';
import { BoardModel } from '@/models';
import { getClassByTheme } from '@/items/Board';

/**
 * Configurazione di un item di navigazione.
 */
interface NavItemConfig {
    href: string;
    icon: LucideIcon;
    label: string;
}

/**
 * Items di navigazione principale.
 */
const NAV_ITEMS: readonly NavItemConfig[] = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'I miei Spazi' },
    { href: '/categories', icon: Tags, label: 'Categorie' },
    { href: '/priorities', icon: Flag, label: 'Priorità' },
];

/**
 * Props per NavItem.
 */
interface NavItemProps extends NavItemConfig {
    isActive: boolean;
}

/**
 * Item di navigazione.
 */
function NavItem({ href, icon: Icon, label, isActive }: NavItemProps) {
    return (
        <Link
            href={href}
            className={`
                group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg 
                transition-all duration-200 mb-1
                ${isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }
            `}
        >
            <Icon className={`
                w-5 h-5 mr-3 
                ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}
            `} />
            {label}
            {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
            )}
        </Link>
    );
}

/**
 * Sidebar principale dell'applicazione.
 */
export default function Sidebar() {
    const pathname = usePathname();

    // Hooks
    const { user, signOut } = useAuth();
    const { isFocusMode, toggleFocusMode } = useFocus();
    const { boards, isLoading: isLoadingBoards, refreshBoards } = useBoards();

    // Stati UI
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isBoardsAccordionOpen, setIsBoardsAccordionOpen] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

    /**
     * Crea una nuova bacheca.
     */
    const handleCreateBoard = useCallback(async (data: NewBoardData) => {
        try {
            await BoardModel.createBoard(data.title, data.description, data.theme, data.icon);
            await refreshBoards();
            setIsCreateDialogOpen(false);
        } catch (error) {
            console.error('Errore creazione bacheca:', error);
        }
    }, [refreshBoards]);

    /**
     * Esegue il logout.
     */
    const handleLogout = useCallback(async () => {
        await signOut();
        setIsLogoutDialogOpen(false);
    }, [signOut]);

    /**
     * Toggle menu mobile.
     */
    const toggleMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(prev => !prev);
    }, []);

    /**
     * Toggle accordion bacheche.
     */
    const toggleBoardsAccordion = useCallback(() => {
        setIsBoardsAccordionOpen(prev => !prev);
    }, []);

    return (
        <>
            {/* Header Mobile */}
            <MobileHeader
                isOpen={isMobileMenuOpen}
                onToggle={toggleMobileMenu}
            />

            {/* Sidebar Container */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 
                transform transition-transform duration-300 ease-in-out flex flex-col
                lg:translate-x-0 lg:static lg:h-screen
                ${isMobileMenuOpen ? 'translate-x-0 top-16' : '-translate-x-full top-0 lg:top-0'}
            `}>
                {/* Logo */}
                <LogoDesktop />

                {/* Contenuto scrollabile */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
                    {/* Navigazione */}
                    <NavigationSection pathname={pathname} />

                    {/* Bacheche */}
                    <BoardsSection
                        isOpen={isBoardsAccordionOpen}
                        isLoading={isLoadingBoards}
                        boards={boards}
                        onToggle={toggleBoardsAccordion}
                        onCreateClick={() => setIsCreateDialogOpen(true)}
                    />
                </div>

                {/* Footer */}
                <SidebarFooter
                    user={user}
                    isFocusMode={isFocusMode}
                    onToggleFocus={toggleFocusMode}
                    onLogoutClick={() => setIsLogoutDialogOpen(true)}
                />
            </aside>

            {/* Overlay mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-30 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Dialogs */}
            <CreateBoardDialog
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onCreate={handleCreateBoard}
            />

            <LogoutDialog
                isOpen={isLogoutDialogOpen}
                onClose={() => setIsLogoutDialogOpen(false)}
                onConfirm={handleLogout}
            />
        </>
    );
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENTI INTERNI
// ═══════════════════════════════════════════════════════════════════

/**
 * Header mobile con hamburger menu.
 */
function MobileHeader({
                          isOpen,
                          onToggle,
                      }: {
    isOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 flex items-center justify-between px-4">
            <LogoMobile />
            <button
                onClick={onToggle}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                aria-label={isOpen ? 'Chiudi menu' : 'Apri menu'}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
    );
}

/**
 * Sezione navigazione principale.
 */
function NavigationSection({ pathname }: { pathname: string }) {
    return (
        <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                Navigazione
            </div>
            <nav>
                {NAV_ITEMS.map((item) => (
                    <NavItem
                        key={item.href}
                        {...item}
                        isActive={pathname === item.href}
                    />
                ))}
            </nav>
        </div>
    );
}

/**
 * Sezione bacheche con accordion.
 */
function BoardsSection({
                           isOpen,
                           isLoading,
                           boards,
                           onToggle,
                           onCreateClick,
                       }: {
    isOpen: boolean;
    isLoading: boolean;
    boards: { id: string; title: string; theme: string }[];
    onToggle: () => void;
    onCreateClick: () => void;
}) {
    return (
        <div>
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2 hover:text-gray-600 transition-colors focus:outline-none"
            >
                <span>Le tue Bacheche</span>
                {isOpen ? (
                    <ChevronDown className="w-4 h-4" />
                ) : (
                    <ChevronRight className="w-4 h-4" />
                )}
            </button>

            {isOpen && (
                <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                    {/* Loading */}
                    {isLoading && (
                        <div className="px-3 py-2 text-xs text-gray-400 italic">
                            Caricamento...
                        </div>
                    )}

                    {/* Lista bacheche */}
                    {!isLoading && boards.map((board) => (
                        <SidebarBoardItem
                            key={board.id}
                            id={board.id}
                            name={board.title}
                            color={getClassByTheme(board.theme)}
                        />
                    ))}

                    {/* Pulsante crea */}
                    <button
                        onClick={onCreateClick}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-dashed border-gray-200 hover:border-blue-200 mt-2"
                    >
                        <Plus className="w-4 h-4 mr-3" />
                        <span>Crea nuova bacheca</span>
                    </button>
                </div>
            )}
        </div>
    );
}

/**
 * Footer sidebar con focus mode e profilo.
 */
function SidebarFooter({
                           user,
                           isFocusMode,
                           onToggleFocus,
                           onLogoutClick,
                       }: {
    user: { name?: string; surname?: string; email?: string; avatar_url?: string } | null;
    isFocusMode: boolean;
    onToggleFocus: () => void;
    onLogoutClick: () => void;
}) {
    return (
        <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50/50">
            {/* Toggle Focus Mode */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Eye className="w-4 h-4 text-purple-600" />
                    <span>Modalità Focus</span>
                </div>
                <button
                    onClick={onToggleFocus}
                    className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors 
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                        ${isFocusMode ? 'bg-purple-600' : 'bg-gray-200'}
                    `}
                    role="switch"
                    aria-checked={isFocusMode}
                    aria-label="Toggle modalità focus"
                >
                    <span className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${isFocusMode ? 'translate-x-6' : 'translate-x-1'}
                    `} />
                </button>
            </div>

            <div className="h-px bg-gray-200" />

            {/* Profilo utente */}
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all group">
                <div className="flex items-center flex-1 min-w-0">
                    <UserAvatar user={user} />
                    <div className="ml-3 flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {user ? `${user.name} ${user.surname}` : 'Caricamento...'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {user?.email ?? ''}
                        </p>
                    </div>
                </div>

                <button
                    onClick={onLogoutClick}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Disconnettiti"
                    aria-label="Logout"
                >
                    <LogOut className="w-4 h-4 shrink-0" />
                </button>
            </div>
        </div>
    );
}

/**
 * Avatar utente.
 */
function UserAvatar({
                        user,
                    }: {
    user: { name?: string; avatar_url?: string } | null;
}) {
    if (user?.avatar_url) {
        return (
            <img
                src={user.avatar_url}
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover border border-blue-200 shadow-sm shrink-0"
            />
        );
    }

    return (
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? <User className="w-4 h-4" />}
        </div>
    );
}