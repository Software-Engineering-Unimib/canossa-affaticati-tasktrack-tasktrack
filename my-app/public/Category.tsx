
export interface Category {
    id: string ;
    name: string;
    color: string;
}

export const themeCategoryOptions: { value: string; label: string; class: string }[] = [
    { value: 'blue', label: 'Blu', class: 'bg-blue-500 text-white hover:bg-blue-300' },
    { value : 'cyan', label: 'Ciano', class: 'bg-cyan-500 text-white hover:bg-cyan-300' },
    { value: 'green', label: 'Verde', class: 'bg-green-500 text-white hover:bg-green-300' },
    { value: 'purple', label: 'Viola', class: 'bg-purple-500 text-white hover:bg-purple-300' },
    { value: 'orange', label: 'Arancione', class: 'bg-orange-500 text-white hover:bg-orange-300' },
    { value: 'yellow', label: 'Giallo', class: 'bg-yellow-500 text-white hover:bg-yellow-300' },
    { value: 'red', label: 'Rosso', class: 'bg-red-500 text-white hover:bg-red-300' },
    { value: 'pink', label: 'Rosa', class: 'bg-pink-500 text-white hover:bg-pink-300' },
    { value: 'slate', label: 'Grigio', class: 'bg-slate-500 text-white hover:bg-slate-300' },
];

// Helper per trovare la classe CSS del colore
export const getCategoryColorClass = (colorValue: string) => {
    const themeOption = themeCategoryOptions.find(opt => opt.value === colorValue);
    return themeOption ? themeOption.class : 'bg-slate-200 text-slate-800'; // Fallback
};