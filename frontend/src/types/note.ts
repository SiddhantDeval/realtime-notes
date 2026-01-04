export interface Note {
    id: string
    title: string
    updatedAt: string
    latestContent: string
    version: number
    ownerId: string
    owner: {
        name: string
        email: string
    }
}

export interface CreateNoteInput {
    title: string
    content?: string
}

export type UpdateNoteInput = Partial<CreateNoteInput>
