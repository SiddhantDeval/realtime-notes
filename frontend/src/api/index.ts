import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { localStorageAuthKey } from '@/context/authContext'
import { toast } from 'sonner'

export class Api {
    static client = new Api()
    private axiosInstance: AxiosInstance

    constructor(
        private readonly baseURL: string = process.env.NEXT_PUBLIC_API_URL ||
            'http://localhost:4001/api/v1'
    ) {
        this.axiosInstance = axios.create({
            baseURL,
            withCredentials: true, // Send cookies
            headers: {
                'Content-Type': 'application/json',
            },
        })

        // Request interceptor to add token
        this.axiosInstance.interceptors.request.use(
            (config) => {
                // Avoid server-side localStorage access if using SSR (though this is mostly client-side app)
                if (typeof window !== 'undefined') {
                    const authString = localStorage.getItem(localStorageAuthKey)
                    if (authString) {
                        try {
                            const auth = JSON.parse(authString)
                            if (auth?.token) {
                                config.headers.Authorization = `Bearer ${auth.token}`
                            }
                        } catch (e) {
                            // ignore invalid json
                        }
                    }
                }
                return config
            },
            (error) => {
                return Promise.reject(error)
            }
        )

        // Response interceptor for global error handling
        this.axiosInstance.interceptors.response.use(
            (response) => {
                return response
            },
            (error) => {
                // Optionally handle 401 Unauthorized for global logout trigger,
                // but that might best be handled by the AuthContext or strict call sites.
                // For now, simple error propagation.
                const message =
                    error.response?.data?.error ||
                    error.response?.data?.message ||
                    error.message ||
                    'An error occurred'
                // Optional: toast.error(message);
                // Rejecting with the data object if available for easier handling in components
                return Promise.reject(
                    error.response?.data || { error: message }
                )
            }
        )
    }

    // --- Generic wrapper (optional, or just expose axios methods) ---

    // --- Auth Endpoints ---

    login = async (payload: { email: string; password: string }) => {
        return this.axiosInstance.post('/auth/login', payload)
    }

    register = async (payload: {
        email: string
        password: string
        full_name: string
    }) => {
        return this.axiosInstance.post('/auth/register', payload)
    }

    logout = async () => {
        return this.axiosInstance.post('/auth/logout')
    }

    me = async () => {
        return this.axiosInstance.get('/auth/me')
    }

    refreshToken = async () => {
        return this.axiosInstance.post('/auth/refresh-token')
    }

    // --- Note Endpoints ---

    getNotes = async () => {
        // Assuming GET /notes returns { success: true, data: [...] } or just [...]
        const res = await this.axiosInstance.get('/notes')
        return res.data
    }

    getNote = async (id: string) => {
        const res = await this.axiosInstance.get(`/notes/${id}`)
        return res.data
    }

    createNote = async (payload: { title: string; content?: string }) => {
        const res = await this.axiosInstance.post('/notes', payload)
        return res.data
    }

    updateNote = async (
        id: string,
        payload: { title?: string; content?: string }
    ) => {
        const res = await this.axiosInstance.put(`/notes/${id}`, payload)
        return res.data
    }

    deleteNote = async (id: string) => {
        const res = await this.axiosInstance.delete(`/notes/${id}`)
        return res.data
    }
}
