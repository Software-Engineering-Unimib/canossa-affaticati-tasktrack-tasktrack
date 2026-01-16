import { supabase } from '@/lib/supabase'
import { Board, BoardStats, BoardTheme, BoardIcon } from '@/items/Board'

export class BoardModel {

    // ==========================================
    // SEZIONE 1: LETTURA (FETCH)
    // ==========================================

    static async getAllBoards(): Promise<Board[]> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        try {
            // 1. Fetch Bacheche Proprietarie (Owner)
            // Scarichiamo column_id e due_date per i calcoli
            const { data: ownerBoards, error: ownerError } = await supabase
                .from('Boards')
                .select(`
                    *,
                    Categories (*),
                    Tasks (id, column_id, due_date) 
                `)
                .eq('owner_id', user.id)
                .order('created_at', { ascending: false });

            if (ownerError) throw ownerError;

            // 2. Fetch Bacheche Condivise (Guest)
            const { data: guestData, error: guestError } = await supabase
                .from('BoardGuests')
                .select(`
                    board:Boards (
                        *,
                        Categories (*),
                        Tasks (id, column_id, due_date)
                    )
                `)
                .eq('user_id', user.id);

            if (guestError) throw guestError;

            // 3. Normalizzazione e Mapping
            const guestBoards = guestData ? guestData.map((item: any) => item.board) : [];
            const allBoards = [...(ownerBoards || []), ...guestBoards];
            const uniqueBoards = Array.from(new Map(allBoards.map(b => [b.id, b])).values());

            return uniqueBoards.map(dbBoard => this.mapDbToBoard(dbBoard));

        } catch (error) {
            console.error('Errore fetch boards:', error);
            return [];
        }
    }

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

        if (error || !data) return null;
        return this.mapDbToBoard(data);
    }

    // ==========================================
    // SEZIONE 2: SCRITTURA (CREATE)
    // ==========================================

    static async createBoard(title: string, theme: BoardTheme, icon: BoardIcon) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data: board, error } = await supabase
            .from('Boards')
            .insert({
                title,
                theme,
                icon,
                owner_id: user.id,
                description: ''
            })
            .select()
            .single();

        if (error) throw error;

        const defaultCategories = [
            { name: 'Da fare', color: 'blue', board_id: board.id },
            { name: 'In corso', color: 'orange', board_id: board.id },
            { name: 'Completato', color: 'green', board_id: board.id }
        ];

        await supabase.from('Categories').insert(defaultCategories);

        return board;
    }

    // ==========================================
    // HELPER: MAPPING & CALCOLO STATISTICHE
    // ==========================================
    private static mapDbToBoard(dbBoard: any): Board {
        const tasks = dbBoard.Tasks || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Data e ora attuali

        const stats: BoardStats = {
            // 1. SCADUTE (Deadlines)
            // Logica: Non è 'done' E la data di scadenza è PASSATA (minore di oggi)
            deadlines: tasks.filter((t: any) => {
                const isDone = t.column_id === 'done';

                // Creiamo la data del task e la resettiamo alla mezzanotte
                const taskDate = new Date(t.due_date);
                taskDate.setHours(0, 0, 0, 0);

                // Usiamo <= per includere sia il passato (<) che oggi (=)
                return !isDone && taskDate.getTime() <= today.getTime();
            }).length,

            // 2. IN CORSO
            // Logica: Colonna esplicitamente 'inprogress'
            inProgress: tasks.filter((t: any) => t.column_id === 'inprogress').length,

            // 3. COMPLETATE
            // Logica: Colonna esplicitamente 'done'
            completed: tasks.filter((t: any) => t.column_id === 'done').length
        };

        return {
            id: String(dbBoard.id),
            title: dbBoard.title,
            description: dbBoard.description || '',
            icon: dbBoard.icon as BoardIcon,
            theme: dbBoard.theme as BoardTheme,
            categories: dbBoard.Categories || [],
            stats: stats,
            guests: []
        };
    }
}