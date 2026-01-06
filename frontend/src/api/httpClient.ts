import { API_URL, SESSION_KEY } from '@/config'
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
    public getToken() {
        let currentToken = this.token
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
        return currentToken
    }

    private setupInterceptors() {
        this.instance.interceptors.request.use((config) => {
            let currentToken = this.getToken()
            if (currentToken) {
                config.headers.Authorization = `Bearer ${currentToken}`
            } else {
                debugger
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

                return Promise.reject(
                    error.response?.data || { error: message }
                )
            }
        )
    }

    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.instance.get<T>(url, config)
        return response.data
    }

    public async post<T>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const response = await this.instance.post<T>(url, data, config)
        return response.data
    }

    public async put<T>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const response = await this.instance.put<T>(url, data, config)
        return response.data
    }

    public async delete<T>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const response = await this.instance.delete<T>(url, config)
        return response.data
    }
}

export const httpClient = new HttpClient(API_URL, SESSION_KEY)
