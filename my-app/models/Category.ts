/**
 * @fileoverview Repository per la gestione delle categorie.
 *
 * Le categorie sono entità dipendenti dalle bacheche:
 * ogni categoria appartiene a una sola bacheca.
 *
 * @module models/Category
 */

import { supabase } from '@/lib/supabase';
import { Category } from '@/items/Category';

/**
 * Dati per la creazione di una nuova categoria.
 */
interface CreateCategoryData {
    name: string;
    color: string;
}

/**
 * Repository per le operazioni CRUD sulle categorie.
 *
 * Pattern: Repository
 */
export class CategoryModel {
    /**
     * Crea una nuova categoria associata a una bacheca.
     *
     * @param boardId - ID della bacheca padre
     * @param name - Nome della categoria
     * @param color - Colore della categoria (es. 'blue', 'red')
     * @returns La categoria creata
     * @throws Error se la creazione fallisce
     */
    static async createCategory(
        boardId: string | number,
        name: string,
        color: string
    ): Promise<Category> {
        const { data, error } = await supabase
            .from('Categories')
            .insert({
                board_id: boardId,
                name,
                color,
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Impossibile creare la categoria: ${error.message}`);
        }

        return data;
    }

    /**
     * Aggiorna una categoria esistente.
     *
     * @param id - ID della categoria
     * @param updates - Campi da aggiornare (name e/o color)
     * @throws Error se l'aggiornamento fallisce
     */
    static async updateCategory(
        id: string | number,
        updates: Partial<Pick<Category, 'name' | 'color'>>
    ): Promise<void> {
        const { error } = await supabase
            .from('Categories')
            .update(updates)
            .eq('id', id);

        if (error) {
            throw new Error(`Impossibile aggiornare la categoria: ${error.message}`);
        }
    }

    /**
     * Elimina una categoria.
     *
     * @param id - ID della categoria da eliminare
     * @throws Error se l'eliminazione fallisce
     *
     * @remarks
     * L'eliminazione rimuoverà anche le associazioni TaskCategories
     * grazie al vincolo ON DELETE CASCADE nel database.
     */
    static async deleteCategory(id: string | number): Promise<void> {
        const { error } = await supabase
            .from('Categories')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Impossibile eliminare la categoria: ${error.message}`);
        }
    }
}