import {BookSearch, Briefcase, GraduationCap, Home, LucideIcon} from "lucide-react";

export const categoryBoardIcons: Record<BoardCategory, LucideIcon> = {
    university: GraduationCap,
    personal: Home,
    other: BookSearch,
    work: Briefcase,
};

export type BoardCategory = 'university' | 'personal' | 'work' | 'other';

// Opzioni per la select delle categorie (Label leggibili per l'utente)
export const categoryBoardOptions: { value: BoardCategory; label: string }[] = [
    { value: 'university', label: 'Università' },
    { value: 'personal', label: 'Personale & Hobby' },
    { value: 'other', label: 'Altro' },
    { value: 'work', label: 'Lavoro' },
];