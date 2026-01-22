/**
 * @fileoverview Repository per la gestione delle bacheche.
 *
 * Gestisce bacheche proprietarie e condivise (guest),
 * incluso il calcolo delle statistiche aggregate.
 *
 * @module models/Board
 */

import { supabase } from '@/lib/supabase';
import { Board, BoardStats, BoardTheme, BoardIcon } from '@/items/Board';

/**
 * Dati grezzi di un task dal database.
 * Usato per il calcolo delle statistiche.
 */
interface RawTaskData {
    id: number;
    column_id: string;
    due_date: string;
}

/**
 * Dati grezzi di una bacheca dal database.
 */
interface RawBoardData {
    id: number;
    title: string;
    description: string | null;
    icon: string;
    theme: string;
    Categories: any[];
    Tasks: RawTaskData[];
    BoardGuests?: { user_id: string; role: string }[];
}

/**
 * Categorie create di default per ogni nuova bacheca.
 */
const DEFAULT_CATEGORIES = [
    { name: 'Da fare', color: 'blue' },
    { name: 'In corso', color: 'orange' },
    { name: 'Completato', color: 'green' },
] as const;

/**
 * Repository per le operazioni sulle bacheche.
 *
 * Pattern: Repository
 */
export class BoardModel {
    // ═══════════════════════════════════════════════════════════
    // LETTURA
    // ═══════════════════════════════════════════════════════════

    /**
     * Ottiene tutte le bacheche accessibili dall'utente corrente.
     * Include sia bacheche proprietarie che condivise.
     *
     * @returns Array di bacheche con statistiche calcolate
     */
    static async getAllBoards(): Promise<Board[]> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return [];
        }

        try {
            const [ownerBoards, guestBoards] = await Promise.all([
                this.fetchOwnerBoards(user.id),
                this.fetchGuestBoards(user.id),
            ]);

            const allBoards = [...ownerBoards, ...guestBoards];
            const uniqueBoards = this.deduplicateBoards(allBoards);

            return uniqueBoards.map(board => this.mapDbToBoard(board));
        } catch (error) {
            console.error('Errore fetch boards:', error);
            return [];
        }
    }

    /**
     * Ottiene una bacheca specifica per ID.
     *
     * @param boardId - ID della bacheca
     * @returns Bacheca o null se non trovata/non accessibile
     */
    static async getBoardById(boardId: string): Promise<Board | null> {
        const { data, error } = await supabase
            .from('Boards')
            .select(`
                *,
                Categories (*),
                Tasks (*),
                BoardGuests (user_id, role)
            `)
            .eq('id', boardId)
            .single();

        if (error || !data) {
            return null;
        }

        return this.mapDbToBoard(data);
    }

    // ═══════════════════════════════════════════════════════════
    // SCRITTURA
    // ═══════════════════════════════════════════════════════════

    /**
     * Crea una nuova bacheca con categorie di default.
     *
     * @param title - Titolo della bacheca
     * @param description - Descrizione opzionale
     * @param theme - Tema colore
     * @param icon - Icona della bacheca
     * @returns Dati della bacheca creata
     * @throws Error se l'utente non è autenticato o la creazione fallisce
     */
    static async createBoard(
        title: string,
        description: string,
        theme: BoardTheme,
        icon: BoardIcon
    ) {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('Utente non autenticato');
        }

        const { data: board, error } = await supabase
            .from('Boards')
            .insert({
                title,
                description: description || '',
                theme,
                icon,
                owner_id: user.id,
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Errore creazione bacheca: ${error.message}`);
        }

        // Crea categorie di default
        await this.createDefaultCategories(board.id);

        return board;
    }

    /**
     * Aggiorna una bacheca esistente.
     *
     * @throws Error se l'aggiornamento fallisce
     */
    static async updateBoard(
        id: string | number,
        title: string,
        description: string,
        theme: string,
        icon: string
    ): Promise<void> {
        const { error } = await supabase
            .from('Boards')
            .update({ title, description, theme, icon })
            .eq('id', id);

        if (error) {
            throw new Error(`Errore aggiornamento bacheca: ${error.message}`);
        }
    }

    /**
     * Elimina una bacheca.
     *
     * @remarks
     * L'eliminazione è a cascata: rimuove anche task, categorie e guest.
     *
     * @throws Error se l'eliminazione fallisce
     */
    static async deleteBoard(id: string | number): Promise<void> {
        const { error } = await supabase
            .from('Boards')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Errore eliminazione bacheca: ${error.message}`);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // METODI PRIVATI
    // ═══════════════════════════════════════════════════════════

    /**
     * Fetch delle bacheche di cui l'utente è proprietario.
     */
    private static async fetchOwnerBoards(userId: string): Promise<RawBoardData[]> {
        const { data, error } = await supabase
            .from('Boards')
            .select(`
                *,
                Categories (*),
                Tasks (id, column_id, due_date)
            `)
            .eq('owner_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data ?? [];
    }

    /**
     * Fetch delle bacheche condivise con l'utente.
     */
    private static async fetchGuestBoards(userId: string): Promise<RawBoardData[]> {
        const { data, error } = await supabase
            .from('BoardGuests')
            .select(`
                board:Boards (
                    *,
                    Categories (*),
                    Tasks (id, column_id, due_date)
                )
            `)
            .eq('user_id', userId);

        if (error) throw error;

        return data?.map((item: any) => item.board).filter(Boolean) ?? [];
    }

    /**
     * Rimuove duplicati mantenendo la prima occorrenza.
     */
    private static deduplicateBoards(boards: RawBoardData[]): RawBoardData[] {
        const seen = new Map<number, RawBoardData>();

        for (const board of boards) {
            if (!seen.has(board.id)) {
                seen.set(board.id, board);
            }
        }

        return Array.from(seen.values());
    }

    /**
     * Crea le categorie di default per una nuova bacheca.
     */
    private static async createDefaultCategories(boardId: number): Promise<void> {
        const categories = DEFAULT_CATEGORIES.map(cat => ({
            ...cat,
            board_id: boardId,
        }));

        await supabase.from('Categories').insert(categories);
    }

    /**
     * Mappa i dati grezzi del database nel modello Board.
     * Include il calcolo delle statistiche.
     */
    private static mapDbToBoard(dbBoard: RawBoardData): Board {
        const stats = this.calculateStats(dbBoard.Tasks ?? []);

        return {
            id: String(dbBoard.id),
            title: dbBoard.title,
            description: dbBoard.description ?? '',
            icon: dbBoard.icon as BoardIcon,
            theme: dbBoard.theme as BoardTheme,
            categories: dbBoard.Categories ?? [],
            stats,
            guests: [],
        };
    }

    /**
     * Calcola le statistiche aggregate di una bacheca.
     *
     * - deadlines: task non completati con scadenza oggi o passata
     * - inProgress: task in colonna 'inprogress'
     * - completed: task in colonna 'done'
     */
    private static calculateStats(tasks: RawTaskData[]): BoardStats {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let deadlines = 0;
        let inProgress = 0;
        let completed = 0;

        for (const task of tasks) {
            if (task.column_id === 'done') {
                completed++;
                continue;
            }

            if (task.column_id === 'inprogress') {
                inProgress++;
            }

            // Controlla scadenza
            const taskDate = new Date(task.due_date);
            taskDate.setHours(0, 0, 0, 0);

            if (taskDate.getTime() <= today.getTime()) {
                deadlines++;
            }
        }

        return { deadlines, inProgress, completed };
    }
}