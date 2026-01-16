import { supabase } from '@/lib/supabase'

export interface Attachment {
    id?: number
    created_at?: string
    name: string
    file_path: string // Path nel bucket Supabase Storage
    file_size: number // Dimensione in bytes
    file_type: string // MIME type o estensione
    task_id: number // FK to Tasks
    uploaded_by: number // FK to Users
}

export interface AttachmentWithUploader extends Attachment {
    uploader?: {
        id: number
        name: string
        surname: string
        email: string
    }
}

export class AttachmentModel {
    // Nome del bucket Supabase Storage per gli allegati
    static readonly BUCKET_NAME = 'task-attachments'

    // Ottieni tutti gli allegati di un task
    static async findByTaskId(taskId: number): Promise<{ data: AttachmentWithUploader[] | null; error: any }> {
        const { data, error } = await supabase
            .from('Attachments')
            .select(`
                *,
                Users (id, name, surname, email)
            `)
            .eq('task_id', taskId)
            .order('created_at', { ascending: false })

        const formattedData = data?.map(item => ({
            ...item,
            uploader: item.Users
        })) || null

        return { data: formattedData, error }
    }

    // Ottieni un allegato per ID
    static async findById(id: number): Promise<{ data: AttachmentWithUploader | null; error: any }> {
        const { data, error } = await supabase
            .from('Attachments')
            .select(`
                *,
                Users (id, name, surname, email)
            `)
            .eq('id', id)
            .single()

        const formattedData = data ? {
            ...data,
            uploader: data.Users
        } : null

        return { data: formattedData, error }
    }

    // Carica un file e crea il record dell'allegato
    static async upload(
        file: File,
        taskId: number,
        uploadedBy: number
    ): Promise<{ data: Attachment | null; error: any }> {
        // Genera un nome file unico
        const timestamp = Date.now()
        const uniqueFileName = `${taskId}/${timestamp}_${file.name}`

        // Carica il file su Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(this.BUCKET_NAME)
            .upload(uniqueFileName, file)

        if (uploadError) {
            return { data: null, error: uploadError }
        }

        // Crea il record nel database
        const attachmentData: Omit<Attachment, 'id' | 'created_at'> = {
            name: file.name,
            file_path: uploadData.path,
            file_size: file.size,
            file_type: file.type || file.name.split('.').pop() || 'unknown',
            task_id: taskId,
            uploaded_by: uploadedBy
        }

        const { data, error } = await supabase
            .from('Attachments')
            .insert(attachmentData)
            .select()
            .single()

        if (error) {
            // Se fallisce l'inserimento nel DB, elimina il file caricato
            await supabase.storage.from(this.BUCKET_NAME).remove([uniqueFileName])
            return { data: null, error }
        }

        return { data, error: null }
    }

    // Crea un record allegato (senza upload, per casi in cui il file è già caricato)
    static async create(attachmentData: Omit<Attachment, 'id' | 'created_at'>): Promise<{ data: Attachment | null; error: any }> {
        const { data, error } = await supabase
            .from('Attachments')
            .insert(attachmentData)
            .select()
            .single()

        return { data, error }
    }

    // Ottieni l'URL pubblico di un allegato
    static async getPublicUrl(filePath: string): Promise<{ url: string | null; error: any }> {
        const { data } = supabase.storage
            .from(this.BUCKET_NAME)
            .getPublicUrl(filePath)

        return { url: data.publicUrl, error: null }
    }

    // Ottieni l'URL firmato (temporaneo) per download privato
    static async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<{ url: string | null; error: any }> {
        const { data, error } = await supabase.storage
            .from(this.BUCKET_NAME)
            .createSignedUrl(filePath, expiresIn)

        return { url: data?.signedUrl || null, error }
    }

    // Elimina un allegato (file + record)
    static async delete(id: number): Promise<{ data: any; error: any }> {
        // Prima ottieni il file_path
        const { data: attachment, error: fetchError } = await supabase
            .from('Attachments')
            .select('file_path')
            .eq('id', id)
            .single()

        if (fetchError) return { data: null, error: fetchError }

        // Elimina il file dallo storage
        const { error: storageError } = await supabase.storage
            .from(this.BUCKET_NAME)
            .remove([attachment.file_path])

        if (storageError) {
            console.error('Error deleting file from storage:', storageError)
            // Continua comunque con l'eliminazione del record
        }

        // Elimina il record dal database
        const { data, error } = await supabase
            .from('Attachments')
            .delete()
            .eq('id', id)

        return { data, error }
    }

    // Elimina tutti gli allegati di un task
    static async deleteByTaskId(taskId: number): Promise<{ data: any; error: any }> {
        // Prima ottieni tutti i file_path
        const { data: attachments, error: fetchError } = await supabase
            .from('Attachments')
            .select('file_path')
            .eq('task_id', taskId)

        if (fetchError) return { data: null, error: fetchError }

        // Elimina i file dallo storage
        if (attachments && attachments.length > 0) {
            const filePaths = attachments.map(a => a.file_path)
            const { error: storageError } = await supabase.storage
                .from(this.BUCKET_NAME)
                .remove(filePaths)

            if (storageError) {
                console.error('Error deleting files from storage:', storageError)
            }
        }

        // Elimina i record dal database
        const { data, error } = await supabase
            .from('Attachments')
            .delete()
            .eq('task_id', taskId)

        return { data, error }
    }

    // Conta gli allegati di un task
    static async countByTaskId(taskId: number): Promise<{ count: number | null; error: any }> {
        const { count, error } = await supabase
            .from('Attachments')
            .select('*', { count: 'exact', head: true })
            .eq('task_id', taskId)

        return { count, error }
    }

    // Calcola la dimensione totale degli allegati di un task
    static async getTotalSizeByTaskId(taskId: number): Promise<{ totalSize: number; error: any }> {
        const { data, error } = await supabase
            .from('Attachments')
            .select('file_size')
            .eq('task_id', taskId)

        const totalSize = data?.reduce((sum, a) => sum + a.file_size, 0) || 0

        return { totalSize, error }
    }

    // Formatta la dimensione del file in formato leggibile
    static formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // Verifica se un utente è l'uploader di un allegato
    static async isUploader(attachmentId: number, userId: number): Promise<{ isUploader: boolean; error: any }> {
        const { data, error } = await supabase
            .from('Attachments')
            .select('uploaded_by')
            .eq('id', attachmentId)
            .single()

        return { isUploader: data?.uploaded_by === userId, error }
    }
}
