import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

export class HttpClient {
    private readonly instance: AxiosInstance
    private token: string | null = null
    private readonly LOCAL_STORAGE_KEY: string

    constructor(baseURL: string, localStorageKey: string) {
        this.LOCAL_STORAGE_KEY = localStorageKey
        this.instance = axios.create({
            baseURL,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        })

        this.setupInterceptors()
    }

    public setToken(token: string | null) {
        this.token = token
    }

    private setupInterceptors() {
        this.instance.interceptors.request.use((config) => {
            let currentToken = this.token

            // Fallback to localStorage
            if (!currentToken && typeof window !== 'undefined') {
                const stored = localStorage.getItem(this.LOCAL_STORAGE_KEY)
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored)
                        currentToken = parsed?.token
                    } catch {
                        // ignore invalid json
                    }
                }
            }

            if (currentToken) {
                config.headers.Authorization = `Bearer ${currentToken}`
            }
            return config
        })

        this.instance.interceptors.response.use(
            (response) => response,
            (error) => {
                const message =
                    error.response?.data?.error ||
                    error.response?.data?.message ||
                    error.message ||
                    'An unexpected error occurred'
                
                return Promise.reject(error.response?.data || { error: message })
            }
        )
    }

    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.instance.get<T>(url, config)
        return response.data
    }

    public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.instance.post<T>(url, data, config)
        return response.data
    }

    public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.instance.put<T>(url, data, config)
        return response.data
    }

    public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.instance.delete<T>(url, config)
        return response.data
    }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1'
export const httpClient = new HttpClient(API_URL, 'auth_session')
