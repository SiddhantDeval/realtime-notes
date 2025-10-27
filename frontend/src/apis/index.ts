export class Api {
  static client = new Api();
  
  constructor(private readonly host: string = "http://localhost:4001/api/v1") {}

  async fetch<T>(url: string, init?: RequestInit): Promise<T> {
    const urlWithHost = url.startsWith("http") ? url : this.host + url;

    const res = await fetch(urlWithHost, {
      credentials: "include", // send HTTPS cookies
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
      method: init?.method || "GET",
      ...init,
    });
    if (!res.ok) {
      // treat 401/403 as "not logged in"
      if (res.status === 401) throw Object.assign(new Error("unauthorized"), { code: 401 });
      throw new Error(await res.text());
    }
    return res.json();
  }

  async health() {
    return this.fetch("http://localhost:4001/health");
  }

  async login(payload: { email: string; password: string }) {
    return this.fetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ payload }),
    });
  }

  async logout() {
    return this.fetch("/auth/logout", { method: "POST" });
  }

  async register(payload: { email: string; password: string; full_name: string }) {
    return this.fetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async refreshToken() {
    return this.fetch("/auth/refresh-token", { method: "POST" });
  }
}
