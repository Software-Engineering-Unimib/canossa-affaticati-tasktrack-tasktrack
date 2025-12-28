import {BookOpen, Briefcase, GraduationCap, Home, LucideIcon} from "lucide-react";
import {BoardCategory} from "@/public/Board";

export const categoryIcons: Record<BoardCategory, LucideIcon> = {
    university: BookOpen,
    personal: Home,
    thesis: GraduationCap,
    work: Briefcase,
};