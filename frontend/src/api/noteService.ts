import { httpClient } from './httpClient'
import { Note } from '@/types'

export interface NotesResponse {
    notes: Note[]
    nextCursor?: string
}

export class NoteService {
    static getNotes(params?: {
        search?: string
        sort?: string
        cursor?: string
        limit?: number
    }) {
        return httpClient.get<{ data: NotesResponse }>('/notes', { params })
    }

    static getNote(id: string) {
        return httpClient.get<{ data: Note }>(`/notes/${id}`)
    }

    static createNote(payload: { title: string; content?: string }) {
        return httpClient.post<{ data: { note: Note } }>('/notes', payload)
    }

    static updateNote(id: string, payload: { title?: string; content?: string }) {
        return httpClient.put<{ data: { note: Note } }>(`/notes/${id}`, payload)
    }

    static deleteNote(id: string) {
        return httpClient.delete(`/notes/${id}`)
    }
}
