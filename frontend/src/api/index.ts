import axios, { AxiosInstance, AxiosResponse } from 'axios'

export class Api {
    private axiosInstance: AxiosInstance

    constructor(
        private readonly baseURL: string = process.env.NEXT_PUBLIC_API_URL ||
            'http://localhost:4001/api/v1',
        private readonly localStorageAuthKey: string = 'auth_session'
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
                    const authString = localStorage.getItem(
                        this.localStorageAuthKey
                    )
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

    public login = async <T>(payload: { email: string; password: string }) => {
        return this.axiosInstance.post<T>('/auth/login', payload)
    }

    public register = async <T>(payload: {
        email: string
        password: string
        name: string
    }) => {
        return this.axiosInstance.post<T>('/auth/register', payload)
    }

    public logout = async <T>() => {
        return this.axiosInstance.post<T>('/auth/logout')
    }

    public me = async <T>() => {
        return this.axiosInstance.get<T>('/auth/me')
    }

    public refreshToken = async <T>() => {
        return this.axiosInstance.post<T>('/auth/refresh-token')
    }

    // --- Note Endpoints ---

    public getNotes = async <T>(params?: {
        search?: string
        sort?: string
        cursor?: string
        limit?: number
    }) => {
        const res = await this.axiosInstance.get<T>('/notes', { params })
        return res.data
    }

    public getNote = async <T>(id: string) => {
        const res = await this.axiosInstance.get<T>(`/notes/${id}`)
        return res.data
    }

    public createNote = async <T>(payload: {
        title: string
        content?: string
    }) => {
        const res = await this.axiosInstance.post<T>('/notes', payload)
        return res.data
    }

    public updateNote = async <T>(
        id: string,
        payload: { title?: string; content?: string }
    ) => {
        const res = await this.axiosInstance.put<T>(`/notes/${id}`, payload)
        return res.data
    }

    public deleteNote = async <T>(id: string) => {
        const res = await this.axiosInstance.delete<T>(`/notes/${id}`)
        return res.data
    }
}
