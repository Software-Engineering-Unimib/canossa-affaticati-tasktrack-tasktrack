import {BookSearch, Briefcase, GraduationCap, Home, LucideIcon} from "lucide-react";

export const BoardIcons: Record<Icon, LucideIcon> = {
    university: GraduationCap,
    personal: Home,
    other: BookSearch,
    work: Briefcase,
};

export type Icon = 'university' | 'personal' | 'work' | 'other';

// Opzioni per la select delle categorie (Label leggibili per l'utente)
export const iconBoardOptions: { value: Icon; label: string }[] = [
    { value: 'university', label: 'Università' },
    { value: 'personal', label: 'Personale & Hobby' },
    { value: 'other', label: 'Altro' },
    { value: 'work', label: 'Lavoro' },
];