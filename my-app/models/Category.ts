import { supabase } from '@/lib/supabase';
import { Category } from '@/items/Category';

export class CategoryModel {

    /**
     * Crea una nuova categoria collegata a una bacheca
     */
    static async createCategory(boardId: string | number, name: string, color: string) {
        const { data, error } = await supabase
            .from('Categories')
            .insert({
                board_id: boardId,
                name,
                color
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Aggiorna una categoria esistente
     */
    static async updateCategory(id: string | number, updates: Partial<Category>) {
        const { error } = await supabase
            .from('Categories')
            .update({
                name: updates.name,
                color: updates.color
            })
            .eq('id', id);

        if (error) throw error;
    }

    /**
     * Elimina una categoria
     */
    static async deleteCategory(id: string | number) {
        const { error } = await supabase
            .from('Categories')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}