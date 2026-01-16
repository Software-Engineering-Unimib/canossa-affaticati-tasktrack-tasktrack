// ================================================
// TASKTRACK - MODELS INDEX
// ================================================
// Questo file esporta tutti i modelli per un import conveniente
// Uso: import { UserModel, BoardModel, TaskModel } from '@/models'

// User
export { UserModel } from './User'
export type { User } from './User'

// Board
export { BoardModel } from './Board'
export type { Board, BoardWithStats, BoardTheme, BoardIcon } from './Board'

// Category
export { CategoryModel } from './Category'
export type { Category, CategoryColor } from './Category'

// Task
export { TaskModel } from './Task'
export type { Task, TaskWithRelations, TaskAssignee, ColumnId, PriorityLevel } from './Task'

// TaskCategory (relazione many-to-many)
export { TaskCategoryModel } from './TaskCategory'
export type { TaskCategory } from './TaskCategory'

// TaskAssignee (assegnatari task)
export { TaskAssigneeModel } from './TaskAssignee'
export type { TaskAssignee as TaskAssigneeRecord, TaskAssigneeWithUser } from './TaskAssignee'

// BoardGuest (collaboratori bacheca)
export { BoardGuestModel } from './BoardGuest'
export type { BoardGuest, BoardGuestWithUser, BoardGuestWithBoard } from './BoardGuest'

// Comment
export { CommentModel } from './Comment'
export type { Comment, CommentWithAuthor } from './Comment'

// Attachment
export { AttachmentModel } from './Attachment'
export type { Attachment, AttachmentWithUploader } from './Attachment'

// PriorityConfig
export { PriorityConfigModel } from './PriorityConfig'
export type { PriorityConfig, PriorityConfigWithReminders } from './PriorityConfig'

// Reminder
export { ReminderModel } from './Reminder'
export type { Reminder, TimeUnit } from './Reminder'
