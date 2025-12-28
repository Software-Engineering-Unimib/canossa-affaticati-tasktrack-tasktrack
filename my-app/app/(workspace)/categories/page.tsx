"use client";

import { useState, useEffect, use } from "react";
import { Plus } from "lucide-react";
import CreateCategoryDialog from "@/app/components/CreateCategoryDialog";
import EditCategoryDialog from "@/app/components/EditCategoryDialog";
import CategoryCard from "@/app/components/CategoryCard";

interface CategoryStats {
  total: number;
  completed: number;
}

interface Category {
  id: string;
  name: string;
  color: string;
  description: string;
  stats: CategoryStats;
}

const DEFAULT_CATEGORIES: Omit<Category, "createdAt">[] = [
  { id: "1", name: "Lavoro", color: "bg-blue-500", description: "Task e progetti di lavoro", stats: { total: 5, completed: 2 } },
  { id: "2", name: "Casa", color: "bg-green-500", description: "Faccende domestiche", stats: { total: 3, completed: 1 } },
  { id: "3", name: "Salute", color: "bg-red-500", description: "Attività di salute e benessere", stats: { total: 8, completed: 4 } },
  { id: "4", name: "Hobby", color: "bg-purple-500", description: "Attività ricreative", stats: { total: 2, completed: 0 } },
];

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  // Carica categorie da localStorage al mount
  useEffect(() => {
    const savedCategories = localStorage.getItem("categories");
    if (savedCategories) {
      const parsed = JSON.parse(savedCategories);
      // Normalizza le categorie: assicura che abbiano stats
      const normalized = parsed.map((cat: any) => ({
        ...cat,
        stats: cat.stats || { total: 0, completed: 0 },
      }));
      setCategories(normalized);
    } else {
      // Primo accesso: inizializza con categorie di default
      const defaultCategories: Category[] = DEFAULT_CATEGORIES.map(cat => ({
        ...cat,
        createdAt: new Date(),
      }));
      setCategories(defaultCategories);
      localStorage.setItem("categories", JSON.stringify(defaultCategories));
    }
    setIsLoading(false);
  }, []);

  // Salva categorie ogni volta che cambiano
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("categories", JSON.stringify(categories));
    }
  }, [categories, isLoading]);

  const handleAddCategory = (newCategory: Category) => {
    setCategories([...categories, newCategory]);
  };

  const handleUpdateCategory = (updatedCategory: Category) => {
    setCategories(
      categories.map(cat => (cat.id === updatedCategory.id ? updatedCategory : cat))
    );
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 w-full max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Categorie
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Organizza i tuoi task per categoria.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* CARD: TASTO "CREA NUOVA" */}
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex flex-col items-center justify-center h-full min-h-[220px] rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-white hover:border-blue-400 hover:shadow-md transition-all group animate-in fade-in duration-500"
        >
          <div className="w-14 h-14 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-blue-200 transition-all duration-300">
            <Plus className="w-7 h-7 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <span className="font-semibold text-slate-500 group-hover:text-blue-600 transition-colors">
            Crea Nuova Categoria
          </span>
        </button>

        {/* MAPPATURA CATEGORIE */}
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onEdit={setCategoryToEdit}
          />
        ))}
      </div>

        <CreateCategoryDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onAdd={handleAddCategory}
        />

        <EditCategoryDialog
          isOpen={categoryToEdit !== null}
          initialData={categoryToEdit}
          onClose={() => setCategoryToEdit(null)}
          onUpdate={handleUpdateCategory}
          onDelete={handleDeleteCategory}
        />
      </div>
  );
}