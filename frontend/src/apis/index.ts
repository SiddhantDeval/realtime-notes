import { localStorageAuthKey } from "@/utils/auth";

interface Response<T> {
  success: boolean;
  status: number;
  data: T;
  error?: string;
  details?: any;
}
export class Api {
  static client = new Api();
  constructor(private readonly host: string = "http://localhost:4001/api/v1") {}
  // NOTE: - use Arrow function to preserve the this(context) of function.
  fetch = async <T>(url: string, init?: RequestInit & { isAuthToken?: boolean }): Promise<T> => {
    const urlWithHost = url.startsWith("http") ? url : this.host + url;

    // Add token to header
    const auth = JSON.parse(localStorage.getItem(localStorageAuthKey) ?? "{}");
    let { isAuthToken = true, ...fetchOptions } = init || {};
    console.log(auth);
    if (isAuthToken && auth.token) {
      fetchOptions = {
        ...fetchOptions,
        headers: {
          ...fetchOptions.headers,
          Authorization: `Bearer ${auth.token}`,
        },
      };
    }

    const res = await fetch(urlWithHost, {
      credentials: "include", // send HTTPS cookies
      headers: { "Content-Type": "application/json", ...(fetchOptions.headers || {}) },
      method: fetchOptions.method || "GET",
      ...init,
    });

    return res.json();
  };

  health = async () => {
    return this.fetch("http://localhost:4001/health");
  };

  login = async (payload: { email: string; password: string }): Promise<Response<any>> => {
    return this.fetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  };

  logout = async () => {
    return this.fetch("/auth/logout", { method: "POST" });
  };

  register = async (payload: { email: string; password: string; full_name: string }): Promise<Response<any>> => {
    return this.fetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  };

  me = async (): Promise<Response<any>> => {
    return this.fetch("/auth/me", { method: "GET" });
  };

  refreshToken = async () => {
    return this.fetch("/auth/refresh-token", { method: "POST" });
  };
}
